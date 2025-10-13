Platformă de Management pentru Agenții de Pază
O soluție web full-stack, construită cu stack-ul MERN (MongoDB, Express, React, Node.js), destinată digitalizării și eficientizării operațiunilor unei companii de securitate. Aplicația centralizează managementul personalului, al clienților (beneficiarilor), al incidentelor și al documentației, oferind o interfață modernă și accesibilă pentru fiecare tip de utilizator.
Cuprins
Despre Proiect
Public Țintă
Funcționalități Cheie
Tehnologii Folosite
Ghid de Instalare și Rulare Locală
Cerințe preliminare
Configurare Backend
Configurare Frontend
Ghid de Utilizare
Rolul Administrator
Rolul Admin (Operator Agenție)
Rolul Beneficiar (Client)
Rolul Paznic (Agent de Teren)
Deploy
Despre Proiect
Acest proiect a fost dezvoltat pentru a oferi o alternativă modernă la metodele tradiționale (bazate pe hârtie și telefon) de management în industria de securitate. Platforma reduce birocrația, îmbunătățește timpul de răspuns și oferă o transparență completă între agenție, clienți și agenții din teren.
Principalele fluxuri de lucru includ:
Managementul turelor și pontajul digital al paznicilor.
Urmărirea în timp real a locației agenților activi.
Sistem de ticketing pentru sesizările clienților, cu notificări prin email.
Generarea automată a documentelor oficiale (procese verbale, rapoarte de eveniment) în format PDF.
Un sistem de control al accesului bazat pe roluri, asigurând că fiecare utilizator are acces doar la informațiile relevante pentru el.
Public Țintă
Aplicația este proiectată pentru a servi patru roluri principale, fiecare cu un set specific de permisiuni și funcționalități:
Administrator (Super-Admin): Deține control total asupra platformei, inclusiv crearea și gestionarea conturilor de Admin pentru agenții.
Admin (Operator Agenție): Rolul operațional principal. Gestionează paznicii, beneficiarii, alocările, incidentele și documentele.
Beneficiar (Client): Clientul agenției de pază. Poate vizualiza prezența paznicilor alocați, poate crea solicitări și poate vizualiza incidentele care îl privesc.
Paznic (Agent de Teren): Angajatul din teren. Folosește aplicația pentru pontaj, generarea de rapoarte și procese verbale.
Funcționalități Cheie
🔐 Autentificare și Autorizare Bazată pe Roluri (RBAC): Sistem securizat cu JWT (JSON Web Tokens) care restricționează accesul la rute și acțiuni specifice fiecărui rol.
👤 Management Utilizatori: Creare, vizualizare, actualizare și ștergere de conturi pentru toate rolurile.
📍 Urmărire în Timp Real: Adminii și beneficiarii pot vizualiza pe o hartă interactivă (Leaflet) locația curentă a paznicilor aflați în tură.
🕒 Sistem de Pontaj (Check-in/Check-out): Paznicii pot începe și încheia tura, înregistrând ora și locația.
📝 Sistem de Ticketing (Sesizări): Beneficiarii pot crea solicitări, iar adminii le pot gestiona statusul (preluată, în curs, rezolvată).
📧 Notificări Automate prin Email: Beneficiarii sunt notificați prin email la crearea și la fiecare schimbare de status a unei solicitări, cu email-uri personalizate cu numele agenției.
📄 Generare Automată de PDF-uri:
Proces Verbal de Predare-Primire la finalul turei.
Raport de Eveniment.
Proces Verbal de Intervenție.
Toate documentele sunt generate pe baza unor șabloane și includ semnături digitale capturate direct în aplicație.
⚙️ Management Alocări: Interfață drag-and-drop-style pentru alocarea și dezalocarea paznicilor la punctele de lucru ale beneficiarilor.
🚨 Gestionare Incidente: Adminii pot crea și rezolva incidente, care sunt vizibile și pentru beneficiarii afectați.
🧹 Mentenanță Automată: Un cron job rulează zilnic pentru a șterge automat documentele mai vechi de 60 de zile, menținând baza de date curată.
📱 Design Responsiv: Interfața este optimizată pentru a fi utilizabilă pe desktop, tablete și telefoane mobile.
Tehnologii Folosite
Frontend:
React.js (cu Vite)
React Router
Axios
React Leaflet (pentru hărți)
jsPDF & jsPDF-AutoTable (pentru generare PDF în client)
CSS3
Backend:
Node.js
Express.js
MongoDB cu Mongoose
JSON Web Token (JWT) pentru autentificare
Bcrypt.js pentru hashing-ul parolelor
Nodemailer pentru trimiterea de email-uri
pdf-lib pentru manipularea PDF-urilor pe server
node-cron pentru task-uri programate
Baza de Date:
MongoDB
Ghid de Instalare și Rulare Locală
Pentru a rula acest proiect pe mașina locală, urmați pașii de mai jos.
Cerințe preliminare
Node.js (versiunea 18.x sau mai nouă)
npm sau yarn
MongoDB (o instanță locală sau un cont pe MongoDB Atlas)
Git
Configurare Backend
Clonează repository-ul:
code
Bash
git clone [---URL-UL-TAU-DE-GITHUB---]
cd [---numele-repository-ului---]/backend
Instalează dependențele:
code
Bash
npm install
Configurează variabilele de mediu:
Creează un fișier .env în folderul backend/ și adaugă următoarele variabile:
code
Code
PORT=3000
MONGO_URI=[---STRING-UL-TAU-DE-CONEXIUNE-MONGODB---]
JWT_SECRET=[---O-FRAZA-SECRETA-LUNGA-SI-COMPLEXA---]

# Configurații pentru Nodemailer (Gmail)
EMAIL_USER=[---ADRESA-TA-DE-GMAIL---]
EMAIL_PASS=[---PAROLA-DE-APLICATIE-GENERATA-DE-GMAIL---]
Pornește serverul de backend:
code
Bash
npm run dev
Serverul va rula la http://localhost:3000.
Configurare Frontend
Deschide un nou terminal și navighează în folderul frontend:
code
Bash
cd ../frontend
Instalează dependențele:
code
Bash
npm install
Configurează proxy-ul (deja făcut):
Fișierul vite.config.js este deja configurat să redirecționeze cererile de la /api către http://localhost:3000.
Pornește serverul de frontend:
code
Bash
npm run dev
Aplicația va fi accesibilă la http://localhost:5173 (sau un port similar afișat în terminal).
Ghid de Utilizare
Rolul Administrator
Se autentifică cu contul de administrator.
Din dashboard, poate naviga la "Adaugă Cont Admin" pentru a crea un cont nou pentru un operator al agenției.
Poate naviga la "Gestionează Conturi Admin" pentru a șterge conturi existente.
Poate naviga pentru a vedea aplicația din perspectiva celorlalte roluri.
Rolul Admin (Operator Agenție)
Se autentifică cu contul de admin.
Poate adăuga noi angajați (Adăugare Angajat) și noi clienți (Adăugare Firmă).
Poate aloca paznicii la punctele de lucru ale beneficiarilor din pagina Alocare Paznici.
Vede în timp real cine este în tură din pagina Prezență Angajați și poate urmări locația unui paznic.
Gestionează solicitările venite de la clienți în pagina Solicitări.
Creează și gestionează Incidente.
Vizionează și descarcă toate Documentele generate în sistem.
Rolul Beneficiar (Client)
Se autentifică cu contul de beneficiar.
Din dashboard, poate vizualiza Prezența Angajaților alocați firmei sale și le poate vedea locația.
Poate crea o nouă cerere/problemă din pagina Solicitări -> Adaugă Solicitare.
Poate vizualiza Incidentele care au fost raportate la punctele sale de lucru.
Poate vedea o listă cu toți Angajații care îi sunt alocați.
Rolul Paznic (Agent de Teren)
Se autentifică cu contul de paznic.
Începe și termină tura din pagina Pontare. La finalul turei, trebuie să completeze un Proces Verbal de Predare-Primire.
În cazul unui eveniment special, poate genera un Raport de Eveniment sau un Proces Verbal de Intervenție din paginile dedicate.
Deploy
Aplicația este configurată pentru un deploy facil pe platforme de tip PaaS (Platform as a Service) precum Railway.
Backend-ul este configurat să ruleze cu npm start.
Frontend-ul folosește Vite și este configurat pentru a fi servit ca un site static, conectându-se la backend printr-o variabilă de mediu (VITE_API_BASE_URL).
Configurația CORS din backend este pregătită pentru a accepta cereri de la domeniul de producție al frontend-ului.
