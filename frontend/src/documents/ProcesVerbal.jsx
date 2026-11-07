// frontend/src/paznic/ProcesVerbal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import './ProcesVerbal.css';
import SignaturePadWrapper from '../components/SignaturePad';

const MAX_POZE = 3;

// Redimensionează poza la max 1280px și o convertește în JPEG (și HEIC/PNG mari devin ~300 KB).
// Browserul aplică singur orientarea EXIF la desenarea pe canvas.
const redimensioneaza = (file, maxDim = 1280, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; // PNG-urile transparente nu devin negre în JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('conversie'))), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('format')); };
    img.src = url;
  });

export default function ProcesVerbal() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    punctDeLucru: '',
    reprezentant_beneficiar: '',
    ora_declansare_alarma: '',
    ora_prezentare_echipaj: '',
    ora_incheiere_misiune: '',
    evenimente: [{ dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' }],
    agentSignatureDataURL: '',
    beneficiarySignatureDataURL: '',
  });
  
  const [beneficiariCuPuncte, setBeneficiariCuPuncte] = useState([]);
  const [puncteFiltrate, setPuncteFiltrate] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signaturesSaved, setSignaturesSaved] = useState({ agent: false, beneficiary: false });
  const [poze, setPoze] = useState([]); // [{ id, blob, preview }]
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const pozeRef = useRef([]);
  pozeRef.current = poze;

  // Eliberăm previzualizările la ieșirea din pagină
  useEffect(() => () => pozeRef.current.forEach(p => URL.revokeObjectURL(p.preview)), []);

  useEffect(() => {
    const fetchAssignedData = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/posts/my-assigned-workpoints');
        setBeneficiariCuPuncte(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Nu s-au putut încărca datele de alocare.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedData();
  }, []);

  const handleBeneficiarChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, beneficiaryId: selectedId, punctDeLucru: '' }));
    
    const beneficiarSelectat = beneficiariCuPuncte.find(b => b.beneficiarId === selectedId);
    setPuncteFiltrate(beneficiarSelectat ? beneficiarSelectat.puncteDeLucru : []);
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEventChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      evenimente: prev.evenimente.map((ev, i) => (i === index ? { ...ev, [name]: value } : ev))
    }));
  };
  const handlePozeSelectate = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // permite alegerea aceleiași poze din nou
    const locuri = MAX_POZE - poze.length;
    if (files.length > locuri) setError(`Puteți adăuga maximum ${MAX_POZE} poze.`);
    else setError('');
    for (const file of files.slice(0, Math.max(0, locuri))) {
      try {
        const blob = await redimensioneaza(file);
        setPoze(prev => (prev.length >= MAX_POZE ? prev : [...prev, { id: `${Date.now()}-${Math.random()}`, blob, preview: URL.createObjectURL(blob) }]));
      } catch (err) {
        setError('Poza nu a putut fi citită. Folosiți o imagine JPG sau PNG.');
      }
    }
  };
  const handleRemovePoza = (id) => {
    setPoze(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.preview);
      return prev.filter(x => x.id !== id);
    });
  };
  const handleAddRow = () => setFormData(prev => ({ ...prev, evenimente: [...prev.evenimente, { dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' }]}));
  const handleRemoveRow = (index) => {
    if (formData.evenimente.length > 1) {
      setFormData(prev => ({ ...prev, evenimente: prev.evenimente.filter((_, i) => i !== index) }));
    }
  };
  const handleSaveAgentSignature = (signature) => {
    setFormData(prev => ({ ...prev, agentSignatureDataURL: signature }));
    setSignaturesSaved(prev => ({ ...prev, agent: true }));
    alert('Semnătura agentului a fost salvată.');
  };
  const handleSaveBeneficiarySignature = (signature) => {
    setFormData(prev => ({ ...prev, beneficiarySignatureDataURL: signature }));
    setSignaturesSaved(prev => ({ ...prev, beneficiary: true }));
    alert('Semnătura beneficiarului a fost salvată.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.beneficiaryId || !formData.punctDeLucru) {
      setError('EROARE: Trebuie să selectați un beneficiar și un punct de lucru.');
      return;
    }
    if (!signaturesSaved.agent || !signaturesSaved.beneficiary) {
      setError('EROARE: Ambele semnături sunt obligatorii.');
      return;
    }
    setLoading(true);
    try {
      // multipart: câmpurile text + poze. `evenimente` pleacă ca text JSON.
      const { evenimente, ...campuri } = formData;
      const fd = new FormData();
      Object.entries(campuri).forEach(([k, v]) => fd.append(k, v));
      fd.append('evenimente', JSON.stringify(evenimente));
      poze.forEach((p, i) => fd.append('poze', p.blob, `poza${i + 1}.jpg`));
      await apiClient.post(`/proces-verbal/create`, fd);
      alert('✅ Proces verbal salvat cu succes!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare la salvarea documentului.');
    } finally {
      setLoading(false);
    }
  };
  
  const areAllSignaturesSaved = signaturesSaved.agent && signaturesSaved.beneficiary;

  return (
    <div className="pv-container">
      <h1>Completare Proces Verbal de Intervenție</h1>
      <p className="pv-subtitle">Documentul va fi generat automat pe baza datelor introduse.</p>
      
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="pv-form">
        <fieldset disabled={areAllSignaturesSaved}>
            <legend>Selectare Obiectiv</legend>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="beneficiaryId">Selectează Beneficiarul</label>
                    <select id="beneficiaryId" name="beneficiaryId" value={formData.beneficiaryId} onChange={handleBeneficiarChange} required disabled={loading}>
                        <option value="">-- Alege o firmă --</option>
                        {beneficiariCuPuncte.map(b => (
                            <option key={b.beneficiarId} value={b.beneficiarId}>{b.numeCompanie}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="punctDeLucru">Selectează Punctul de Lucru</label>
                    <select id="punctDeLucru" name="punctDeLucru" value={formData.punctDeLucru} onChange={handleChange} required disabled={!formData.beneficiaryId}>
                        <option value="">-- Alege un punct --</option>
                        {puncteFiltrate.map((p, index) => (
                            <option key={index} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>
        </fieldset>
        
        <fieldset disabled={areAllSignaturesSaved}>
            <legend>Detalii Principale Intervenție</legend>
            <div className="form-grid">
               <div className="form-group">
                  <label htmlFor="ora_declansare_alarma">Alarma declanșată la ora</label>
                  <input id="ora_declansare_alarma" type="datetime-local" name="ora_declansare_alarma" value={formData.ora_declansare_alarma} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="ora_prezentare_echipaj">Echipaj prezent la ora</label>
                  <input id="ora_prezentare_echipaj" type="datetime-local" name="ora_prezentare_echipaj" value={formData.ora_prezentare_echipaj} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="ora_incheiere_misiune">Misiune încheiată la ora</label>
                  <input id="ora_incheiere_misiune" type="datetime-local" name="ora_incheiere_misiune" value={formData.ora_incheiere_misiune} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="reprezentant_beneficiar">Nume Reprezentant Beneficiar</label>
                  <input id="reprezentant_beneficiar" type="text" name="reprezentant_beneficiar" value={formData.reprezentant_beneficiar} onChange={handleChange} placeholder="Ex: Popescu Ion" />
                </div>
            </div>
        </fieldset>

        <fieldset disabled={areAllSignaturesSaved}>
            <legend>Tabel Evenimente Detaliate</legend>
            {formData.evenimente.map((event, index) => (
              <div key={index} className="event-row">
                <span className="event-row-number">{index + 1}.</span>
                <div className="event-grid">
                  <input type="datetime-local" name="dataOraReceptionarii" value={event.dataOraReceptionarii} onChange={(e) => handleEventChange(index, e)} required title="Data și Ora Recepționării"/>
                  <input type="text" name="tipulAlarmei" value={event.tipulAlarmei} onChange={(e) => handleEventChange(index, e)} placeholder="Tipul alarmei" required />
                  <input type="text" name="echipajAlarmat" value={event.echipajAlarmat} onChange={(e) => handleEventChange(index, e)} placeholder="Echipaj alarmat" required />
                  <input type="datetime-local" name="oraSosirii" value={event.oraSosirii} onChange={(e) => handleEventChange(index, e)} required title="Ora Sosirii"/>
                  <input type="text" name="cauzeleAlarmei" value={event.cauzeleAlarmei} onChange={(e) => handleEventChange(index, e)} placeholder="Cauzele alarmei" required />
                  <input type="text" name="modulDeSolutionare" value={event.modulDeSolutionare} onChange={(e) => handleEventChange(index, e)} placeholder="Mod de soluționare" required />
                  <input type="text" name="observatii" value={event.observatii} onChange={(e) => handleEventChange(index, e)} placeholder="Observații (opțional)" />
                </div>
                {formData.evenimente.length > 1 && (<button type="button" className="remove-row-btn" onClick={() => handleRemoveRow(index)}>Șterge</button>)}
              </div>
            ))}
            <button type="button" className="add-row-btn" onClick={handleAddRow}>+ Adaugă Rând</button>
        </fieldset>
        
        <fieldset disabled={areAllSignaturesSaved}>
            <legend>Fotografia obiectivului (opțional, maximum {MAX_POZE})</legend>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePozeSelectate} style={{ display: 'none' }} />
            <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handlePozeSelectate} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button type="button" className="add-row-btn" onClick={() => cameraInputRef.current?.click()} disabled={poze.length >= MAX_POZE}>📷 Fă poză</button>
              <button type="button" className="add-row-btn" onClick={() => galleryInputRef.current?.click()} disabled={poze.length >= MAX_POZE}>🖼️ Alege din galerie</button>
            </div>
            {poze.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {poze.map((p, i) => (
                  <div key={p.id} style={{ position: 'relative' }}>
                    <img src={p.preview} alt={`Poza ${i + 1}`} style={{ width: '140px', height: '105px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <button type="button" onClick={() => handleRemovePoza(p.id)} title="Șterge poza"
                      style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
        </fieldset>

        <div className="signatures-grid">
            <fieldset>
                <legend>Semnătură Agent Intervenție</legend>
                {!signaturesSaved.agent ? (<SignaturePadWrapper onSave={handleSaveAgentSignature} />) : (<div className="signature-display"><p className="signature-saved-text">✓ Semnat</p><img src={formData.agentSignatureDataURL} alt="Semnatura Agent" className="signature-image" /></div>)}
            </fieldset>
            <fieldset>
                <legend>Semnătură Beneficiar</legend>
                {!signaturesSaved.beneficiary ? (<SignaturePadWrapper onSave={handleSaveBeneficiarySignature} />) : (<div className="signature-display"><p className="signature-saved-text">✓ Semnat</p><img src={formData.beneficiarySignatureDataURL} alt="Semnatura Beneficiar" className="signature-image" /></div>)}
            </fieldset>
        </div>
        
        <div className="form-actions">
            <button type="button" className="back-btn" onClick={() => navigate(-1)} disabled={loading}>Anulează</button>
            <button type="submit" className="submit-btn" disabled={loading || !areAllSignaturesSaved}>
              {loading ? 'Se salvează...' : 'Salvează și Generează PDF'}
            </button>
        </div>
      </form>
    </div>
  );
}