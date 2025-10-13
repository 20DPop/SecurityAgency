# Platformă de Management pentru Agenții de Pază

O aplicație web full‑stack construită cu MERN (MongoDB, Express, React, Node.js) pentru digitalizarea și eficientizarea operațiunilor unei companii de securitate.

[![Status](https://img.shields.io/badge/status-beta-orange)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)]()

Cuprins
- [Despre Proiect](#despre-proiect)
- [Public Țintă](#public-țintă)
- [Funcționalități Cheie](#funcționalități-cheie)
- [Tehnologii Folosite](#tehnologii-folosite)
- [Arhitectură scurtă](#arhitectură-scurtă)
- [Instalare și Rulare Locală](#instalare-și-rulare-locală)
  - [Cerințe preliminare](#cerințe-preliminare)
  - [Configurare Backend](#configurare-backend)
  - [Configurare Frontend](#configurare-frontend)
- [Variabile de mediu (exemplu)](#variabile-de-mediu-exemplu)
- [Ghid de Utilizare — Roluri și Fluxuri](#ghid-de-utilizare---roluri-și-fluxuri)
- [Deploy](#deploy)
- [Contribuire](#contribuire)
- [License](#license)

---

## Despre Proiect

Această platformă înlocuiește procesele tradiționale (hârtie, apeluri telefonice) cu un sistem digital care:
- reduce birocrația,
- oferă trasabilitate completă a turelor și incidentelor,
- automatizează generarea de documente oficiale (PDF),
- permite urmărire în timp real a agenților și notificări automate.

Principalele fluxuri:
- management ture și pontaj digital,
- urmărirea locației în timp real a agenților,
- sistem de ticketing cu notificări prin email,
- generare automată de documente PDF pe șabloane,
- control al accesului pe roluri (RBAC).

---

## Public Țintă

Aplicația servește patru tipuri principale de utilizatori:
- Administrator (Super‑Admin) — gestionare completă a platformei și a conturilor Admin;
- Admin (Operator Agenție) — operațiuni zilnice: gestionare angajați, clienți, incidente, documente;
- Beneficiar (Client) — vizualizare prezență, creare solicitări, vizualizare incidente;
- Paznic (Agent de Teren) — pontaj (check‑in/out), generare procese verbale și rapoarte.

---

## Funcționalități Cheie

- Autentificare și autorizare bazată pe roluri (JWT).
- Management utilizatori: CRUD pentru toate rolurile.
- Urmărire locație în timp real (React Leaflet).
- Pontaj: check‑in / check‑out cu înregistrare oră și locație.
- Sistem de ticketing: creare, urmărire și notificare email la schimbarea statusului.
- Generare automată PDF (procese verbale, rapoarte) cu semnături digitale.
- Management alocări (drag & drop).
- Gestionare incidente.
- Mentenanță automată: cron job pentru curățare documente (>60 zile).
- Design responsiv (desktop / tabletă / mobil).

---

## Tehnologii Folosite

Frontend:
- React (Vite)
- React Router
- Axios
- React Leaflet
- jsPDF & jsPDF‑AutoTable
- CSS3

Backend:
- Node.js, Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcrypt.js
- Nodemailer
- pdf-lib
- node-cron

Bază de date: MongoDB (local sau Atlas)

---

## Arhitectură scurtă

- frontend/ — aplicația React servită de Vite
- backend/ — API REST construit cu Express și MongoDB
- documente generate atât pe client (jsPDF) cât și pe server (pdf-lib)
- autentificare stateless cu JWT, roluri pentru autorizare

---

## Instalare și Rulare Locală

Urmează pașii de mai jos pentru a rula proiectul local.

### Cerințe preliminare
- Node.js v18+ și npm sau yarn
- MongoDB (local sau MongoDB Atlas)
- Git

### Configurare Backend
1. Clonează repository-ul:
```bash
git clone https://github.com/20DPop/SecurityAgency.git
cd SecurityAgency/backend
```

2. Instalează dependențele:
```bash
npm install
```

3. Creează fișierul `.env` în `backend/` (vezi secțiunea Variabile de mediu).

4. Pornește serverul de dezvoltare:
```bash
npm run dev
```
Serverul default: http://localhost:3000

### Configurare Frontend
1. Într-un alt terminal:
```bash
cd SecurityAgency/frontend
npm install
```

2. Frontendul folosește Vite; rulează:
```bash
npm run dev
```
Aplicația va fi accesibilă la http://localhost:5173 (sau portul afișat în terminal).

---

## Variabile de mediu (exemplu)

Creează `backend/.env` cu valorile adaptate:

```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=O_FRAZA_SECRETA_FOARTE_LUNGA
EMAIL_USER=exemplu@gmail.com
EMAIL_PASS=parola_aplicatie_gmail
FRONTEND_URL=http://localhost:5173
```

Pentru frontend, setări Vite (exemplu `.env` în `frontend/`):
```
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Ghid de Utilizare — Roluri și Fluxuri

Rol Administrator (Super‑Admin):
- creare / ștergere conturi Admin
- vizualizare platformă din perspectiva altor roluri

Rol Admin (Operator Agenție):
- adăugare angajați și clienți
- alocare paznici la puncte de lucru (drag & drop)
- vizualizare prezență și urmărire locație
- gestionare solicitări, incidente și documente

Rol Beneficiar (Client):
- vizualizează prezența paznicilor alocați
- creează solicitări (ticketing)
- vede incidentele pentru punctele sale de lucru

Rol Paznic (Agent de Teren):
- pontaj (start/end tură)
- completare Proces Verbal de Predare‑Primire la finalul turei
- generare Raport de Eveniment / Proces Verbal de Intervenție

---

## Deploy

Aplicația poate fi deploy‑ată pe PaaS (ex: Railway, Heroku, Vercel pentru frontend static). Pașii generali:
- Configurează variabilele de mediu în serviciul PaaS.
- Backend: rulează `npm start` în producție.
- Frontend: build cu Vite (`npm run build`) și servește fișierele statice sau folosește platforma care le servește direct.

CORS este configurat pentru a permite conexiuni de la frontendul de producție (setează FRONTEND_URL corespunzător).

---

## Contribuire

1. Fork → Branch feature → Pull Request
2. Descrie clar schimbările și pașii de testare
3. Respectă convențiile de codare și style guide‑ul proiectului

Dacă vrei, poți deschide issue‑uri pentru buguri sau propuneri de funcționalități.

---

## License

Acest proiect este licențiat sub MIT License. Vezi fișierul LICENSE pentru detalii.

---

Notă: Acest README este o versiune clarificată și organizată a informațiilor existente în repository. Pentru detalii tehnice suplimentare (ex: endpointuri API, modele Mongoose, structura directoarelor), recomand să completezi cu secțiuni adiționale sau linkuri către documentația internă din `docs/` dacă le adaugi în repo.
