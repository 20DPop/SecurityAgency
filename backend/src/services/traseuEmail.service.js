// backend/src/services/traseuEmail.service.js
// Emailul cu traseul turei: harta se descarcă o singură dată pe server și se atașează inline (cid),
// starea trimiterii se păstrează în baza de date, iar un worker reîncearcă automat dacă ceva eșuează.
const Pontaj = require('../models/pontaj.model');
const User = require('../models/user.model');
const { sendEmail } = require('./email.service');

const MAX_INCERCARI = 5;
const MAX_PUNCTE_HARTA = 200;
const MAX_URL = 7500;            // Mapbox respinge URL-urile peste ~8192 de caractere
const GOL_MINUTE = 10;           // interval fără puncte considerat "gol în traseu"
const TZ = 'Europe/Bucharest';   // serverul rulează în UTC, orele din email trebuie să fie ale României
const CID_HARTA = 'harta-traseu';

// ---------------- Formatare ----------------
const escapeHtml = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtOra = (d) => new Date(d).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
const fmtData = (d) =>
  new Date(d).toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: TZ });
const fmtDataOra = (d) => `${new Date(d).toLocaleDateString('ro-RO', { timeZone: TZ })} ${fmtOra(d)}`;
const fmtDurata = (ms) => `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}min`;

// ---------------- Puncte GPS ----------------
const sortPuncte = (h) => [...(h || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

const haversineM = (a, b) => {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Distanță parcursă (ignoră zgomotul GPS sub 5 m) și intervale fără date
const analizeaza = (puncte) => {
  let metri = 0;
  let goluri = 0;
  let golMaxMin = 0;
  for (let i = 1; i < puncte.length; i++) {
    const d = haversineM(puncte[i - 1], puncte[i]);
    if (d >= 5) metri += d;
    const min = (new Date(puncte[i].timestamp) - new Date(puncte[i - 1].timestamp)) / 60000;
    if (min > GOL_MINUTE) { goluri++; golMaxMin = Math.max(golMaxMin, min); }
  }
  return { km: metri / 1000, goluri, golMaxMin: Math.round(golMaxMin) };
};

// ---------------- Harta (Mapbox Static Images) ----------------
// Polyline cu precizie 5 (formatul acceptat de Mapbox pentru overlay-ul "path")
const encodePolyline = (coords) => {
  let prevLat = 0;
  let prevLng = 0;
  let out = '';
  const enc = (v) => {
    v = v < 0 ? ~(v << 1) : v << 1;
    let s = '';
    while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
    return s + String.fromCharCode(v + 63);
  };
  for (const [lat, lng] of coords) {
    const la = Math.round(lat * 1e5);
    const ln = Math.round(lng * 1e5);
    out += enc(la - prevLat) + enc(ln - prevLng);
    prevLat = la;
    prevLng = ln;
  }
  return out;
};

const esantioneaza = (arr, n) => {
  if (arr.length <= n) return arr;
  const pas = (arr.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => arr[Math.round(i * pas)]);
};

const buildMapUrl = (puncteBrute, token = process.env.MAPBOX_TOKEN) => {
  if (!token || !puncteBrute || puncteBrute.length === 0) return null;
  const puncte = sortPuncte(puncteBrute);
  const primul = puncte[0];
  const ultimul = puncte[puncte.length - 1];
  const r = (n) => Number(n).toFixed(5);
  const base = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/';
  const tok = `access_token=${encodeURIComponent(token)}`;

  const lats = puncte.map((p) => p.latitude);
  const lngs = puncte.map((p) => p.longitude);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);

  // Un singur punct sau agent nemișcat (<~10 m): hartă centrată, fără traseu (cu "auto" Mapbox dă eroare)
  if (puncte.length < 2 || (latSpan < 0.0001 && lngSpan < 0.0001)) {
    const lat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const lng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    return `${base}pin-l+cc0000(${r(lng)},${r(lat)})/${r(lng)},${r(lat)},16/800x500?${tok}`;
  }

  let n = MAX_PUNCTE_HARTA;
  for (;;) {
    const poly = encodeURIComponent(encodePolyline(esantioneaza(puncte, n).map((p) => [p.latitude, p.longitude])));
    const url =
      `${base}path-4+ff0000-0.9(${poly}),` +
      `pin-s-a+00b300(${r(primul.longitude)},${r(primul.latitude)}),` +
      `pin-s-b+cc0000(${r(ultimul.longitude)},${r(ultimul.latitude)})/auto/800x500?padding=50&${tok}`;
    if (url.length <= MAX_URL || n <= 20) return url;
    n = Math.floor(n / 2);
  }
};

// Descarcă imaginea o singură dată (2 încercări). Nu aruncă: fără hartă, emailul pleacă oricum, cu linkuri.
const descarcaHarta = async (url) => {
  if (!url || typeof fetch !== 'function') return null;
  for (let incercare = 1; incercare <= 2; incercare++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`Mapbox a răspuns cu HTTP ${res.status}`);
      const tip = (res.headers.get('content-type') || '').split(';')[0];
      if (!tip.startsWith('image/')) throw new Error(`Răspuns neașteptat de la Mapbox (${tip || 'fără tip'})`);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length === 0 || buffer.length > 3 * 1024 * 1024) throw new Error('Imagine hartă invalidă');
      return { buffer, contentType: tip };
    } catch (e) {
      console.error(`[Traseu Email] Harta nu a putut fi descărcată (încercarea ${incercare}/2): ${e.message}`);
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
};

// ---------------- Conținut email ----------------
const linkHarta = (p) => `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`;

const construiesteHtml = ({ paznic, beneficiar, pontaj, puncte, analiza, areImagine }) => {
  const firma = beneficiar?.profile?.nume_companie || '-';
  const durata = pontaj.ora_iesire ? fmtDurata(new Date(pontaj.ora_iesire) - new Date(pontaj.ora_intrare)) : '-';
  const td1 = 'padding: 8px 0; color: #666; vertical-align: top;';
  const rand = (eticheta, valoare, stil = '') =>
    `<tr><td style="${td1}">${eticheta}</td><td style="font-weight: bold; ${stil}">${valoare}</td></tr>`;

  const inchidere = pontaj.tipInchidere === 'fara_pv'
    ? rand('⚠️ Închidere:',
        `Fără proces verbal de predare-primire${pontaj.motivInchidere ? `<br><span style="font-weight: normal; color: #555;">Motiv: ${escapeHtml(pontaj.motivInchidere)}</span>` : ''}`,
        'color: #b45309;')
    : '';

  let harta;
  if (puncte.length === 0) {
    harta = `<p style="color:#e74c3c;">Nu s-au înregistrat date GPS pentru această tură.</p>`;
  } else if (areImagine) {
    harta = `<img src="cid:${CID_HARTA}" width="100%" style="width:100%;max-width:600px;border-radius:8px;" alt="Harta traseului"/>`;
  } else {
    harta = `<p style="color:#b45309;">Harta nu a putut fi generată. Poziții înregistrate:</p>
      <p>📍 <a href="${linkHarta(puncte[0])}">Start</a> &nbsp;|&nbsp; 🏁 <a href="${linkHarta(puncte[puncte.length - 1])}">Ultima poziție</a></p>`;
  }

  const avertismente = [];
  if (puncte.length > 0 && analiza.goluri > 0) {
    avertismente.push(`În traseu există ${analiza.goluri} interval(e) fără date GPS (cel mai lung: ${analiza.golMaxMin} min), de obicei zone fără semnal.`);
  }
  if (puncte.length > 0 && puncte.length < 3 && pontaj.ora_iesire && new Date(pontaj.ora_iesire) - new Date(pontaj.ora_intrare) > 30 * 60000) {
    avertismente.push('Au fost înregistrate foarte puține puncte: agentul nu s-a deplasat sau GPS-ul nu a transmis date.');
  }
  const avert = avertismente.map((a) => `<p style="background:#fff8e1;border-left:4px solid #f59e0b;padding:10px 12px;color:#7a5a00;font-size:13px;">⚠️ ${a}</p>`).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🗺️ Raport Traseu</h1>
        <p style="color: #aaaaaa; margin: 8px 0 0 0; font-size: 14px;">${escapeHtml(fmtData(pontaj.ora_intrare))}</p>
      </div>
      <div style="padding: 28px;">
        <p style="color: #555;">Tura agentului <strong>${escapeHtml(paznic.nume)} ${escapeHtml(paznic.prenume)}</strong> a fost încheiată.</p>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            ${rand('🏢 Beneficiar:', escapeHtml(firma))}
            ${rand('🕐 Check-in:', fmtDataOra(pontaj.ora_intrare))}
            ${rand('🕕 Check-out:', pontaj.ora_iesire ? fmtDataOra(pontaj.ora_iesire) : '-')}
            ${rand('⏱️ Durata:', durata)}
            ${rand('📍 Puncte GPS:', puncte.length)}
            ${puncte.length > 1 ? rand('🛣️ Distanță parcursă:', `${analiza.km.toFixed(1)} km`) : ''}
            ${inchidere}
          </table>
        </div>
        ${avert}
        ${harta}
      </div>
      <div style="background:#f0f0f0;padding:16px;text-align:center;">
        <p style="margin:0;color:#999;font-size:11px;">Email generat automat de SecurityApp.</p>
      </div>
    </div>`;
};

// ---------------- Trimitere ----------------
const calculeazaDestinatari = (beneficiar) => {
  const set = new Set(
    (process.env.TRASEU_EMAIL_STATIC || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  // Beneficiarul primește emailul doar dacă are activată opțiunea (seeUpdates === 1), ca până acum
  if (beneficiar?.email && beneficiar.seeUpdates === 1) set.add(beneficiar.email.trim().toLowerCase());
  return [...set];
};

// Întoarce { skipped?, sentTo, errors }. Trimite separat fiecărui destinatar (nu își văd adresele între ei)
// și doar celor care nu au primit încă emailul (retry-urile nu dublează mesajele).
const trimiteEmailPontaj = async (pontaj) => {
  const [beneficiar, paznic] = await Promise.all([
    User.findById(pontaj.beneficiaryId),
    User.findById(pontaj.paznicId),
  ]);
  if (!paznic) return { skipped: 'Agentul nu mai există.', sentTo: [], errors: [] };

  const destinatari = calculeazaDestinatari(beneficiar);
  if (destinatari.length === 0) return { skipped: 'Niciun destinatar (TRASEU_EMAIL_STATIC gol, iar beneficiarul nu are emailul activat).', sentTo: [], errors: [] };

  const deja = (pontaj.emailSentTo || []).map((e) => e.toLowerCase());
  const deTrimis = destinatari.filter((e) => !deja.includes(e));
  if (deTrimis.length === 0) return { sentTo: deja, errors: [] };

  const puncte = sortPuncte(pontaj.locationHistory);
  const analiza = analizeaza(puncte);
  const imagine = await descarcaHarta(buildMapUrl(puncte));
  const html = construiesteHtml({ paznic, beneficiar, pontaj, puncte, analiza, areImagine: !!imagine });

  const subject = `Raport traseu - ${paznic.nume} ${paznic.prenume} - ${beneficiar?.profile?.nume_companie || ''} - ${fmtData(pontaj.ora_intrare)}`
    .replace(/[\r\n]+/g, ' ');
  const attachments = imagine
    ? [{ filename: 'harta-traseu.png', content: imagine.buffer, contentType: imagine.contentType, contentId: CID_HARTA }]
    : undefined;

  const sentTo = [...deja];
  const errors = [];
  for (const to of deTrimis) {
    try {
      await sendEmail({ to, subject, html, senderName: 'SecurityApp', attachments });
      sentTo.push(to);
      console.log(`[Traseu Email] Trimis la ${to} (pontaj ${pontaj._id})`);
    } catch (e) {
      errors.push(`${to}: ${e.message}`);
      console.error(`[Traseu Email] Eșec la ${to}:`, e.message);
    }
  }
  return { sentTo, errors };
};

// ---------------- Stare în baza de date + retry ----------------
// Valorile puse pe pontaj la check-out: emailul se trimite după o scurtă întârziere (implicit 2 minute),
// ca punctele GPS întârziate din coada offline să apuce să ajungă în traseu.
const programareEmail = () => {
  const min = Number(process.env.TRASEU_EMAIL_DELAY_MIN);
  const intarziere = (Number.isFinite(min) && min >= 0 ? min : 2) * 60000;
  return { emailStatus: 'pending', emailDueAt: new Date(Date.now() + intarziere), emailAttempts: 0, emailSentTo: [], emailLastError: null };
};

const finalizeaza = async (pontaj, rezultat, eroare) => {
  const incercari = pontaj.emailAttempts || 1;
  let set;
  if (eroare || (rezultat && rezultat.errors.length > 0)) {
    const mesaj = eroare ? eroare.message : rezultat.errors.join(' | ');
    const sentTo = rezultat ? rezultat.sentTo : pontaj.emailSentTo || [];
    set = incercari >= MAX_INCERCARI
      ? { emailStatus: 'failed', emailLastError: mesaj, emailSentTo: sentTo }
      : { emailStatus: 'pending', emailDueAt: new Date(Date.now() + incercari * 5 * 60000), emailLastError: mesaj, emailSentTo: sentTo };
  } else if (rezultat.skipped) {
    set = { emailStatus: 'skipped', emailLastError: rezultat.skipped };
  } else {
    set = { emailStatus: 'sent', emailSentAt: new Date(), emailSentTo: rezultat.sentTo, emailLastError: null };
  }
  await Pontaj.updateOne({ _id: pontaj._id }, { $set: set });
  return set;
};

const executa = async (pontaj) => {
  try {
    return await finalizeaza(pontaj, await trimiteEmailPontaj(pontaj), null);
  } catch (e) {
    console.error('[Traseu Email] Eroare:', e.message);
    return finalizeaza(pontaj, null, e);
  }
};

// Preia atomic un pontaj de procesat (sigur și dacă rulează mai multe instanțe ale serverului)
const revendica = () => {
  const acum = new Date();
  return Pontaj.findOneAndUpdate(
    {
      emailAttempts: { $lt: MAX_INCERCARI },
      $or: [
        { emailStatus: 'pending', emailDueAt: { $lte: acum } },
        { emailStatus: 'sending', emailClaimedAt: { $lte: new Date(acum.getTime() - 10 * 60000) } }, // proces căzut la mijloc
      ],
    },
    { $set: { emailStatus: 'sending', emailClaimedAt: acum }, $inc: { emailAttempts: 1 } },
    { new: true, sort: { emailDueAt: 1 } }
  );
};

let ruleaza = false;
const proceseazaCoada = async () => {
  if (ruleaza) return;
  ruleaza = true;
  try {
    await Pontaj.updateMany(
      { emailStatus: 'sending', emailAttempts: { $gte: MAX_INCERCARI }, emailClaimedAt: { $lte: new Date(Date.now() - 10 * 60000) } },
      { $set: { emailStatus: 'failed', emailLastError: 'Procesare întreruptă' } }
    );
    for (let i = 0; i < 10; i++) {
      const pontaj = await revendica();
      if (!pontaj) break;
      await executa(pontaj);
    }
  } catch (e) {
    console.error('[Traseu Email] Eroare worker:', e.message);
  } finally {
    ruleaza = false;
  }
};

const startTraseuEmailWorker = (cron) => {
  cron.schedule('* * * * *', proceseazaCoada);
  console.log('📧 Worker email traseu pornit (verifică în fiecare minut)');
};

// Retrimitere manuală (admin): resetează starea și încearcă imediat, către toți destinatarii
const retrimiteAcum = async (pontajId) => {
  const pontaj = await Pontaj.findOneAndUpdate(
    { _id: pontajId, ora_iesire: { $ne: null }, emailStatus: { $ne: 'sending' } },
    { $set: { emailStatus: 'sending', emailClaimedAt: new Date(), emailAttempts: 1, emailSentTo: [], emailLastError: null } },
    { new: true }
  );
  if (!pontaj) return null;
  await executa(pontaj);
  return Pontaj.findById(pontajId).select('emailStatus emailLastError emailSentTo emailAttempts');
};

module.exports = {
  buildMapUrl, programareEmail, startTraseuEmailWorker, retrimiteAcum,
  // exportate pentru teste
  encodePolyline, analizeaza, construiesteHtml, trimiteEmailPontaj, executa, proceseazaCoada, MAX_INCERCARI,
};