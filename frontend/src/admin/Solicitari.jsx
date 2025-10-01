// frontend/src/admin/Solicitari.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Solicitari.css";

export default function Solicitari() {
  // --- STATE MANAGEMENT ---
  // Am adăugat stări pentru 'loading' și 'error' pentru o experiență mai bună
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solicitari, setSolicitari] = useState({
    preluată: [],
    inCurs: [],
    rezolvata: []
  });
  const [termenCautare, setTermenCautare] = useState("");

  // --- DATA FETCHING ---
  // Am rescris `useEffect` folosind async/await pentru claritate și am adăugat
  // trimiterea token-ului de autentificare, care lipsea.
  useEffect(() => {
    const fetchSolicitari = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        
        // **CORECTURĂ CRITICĂ**: Verificăm dacă utilizatorul este logat înainte de a face cererea.
        if (!userInfo || !userInfo.token) {
          setError("Acces neautorizat. Vă rugăm să vă autentificați.");
          setLoading(false);
          return;
        }

        // **CORECTURĂ CRITICĂ**: Adăugăm token-ul de autorizare în headerele cererii.
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get("http://localhost:3000/api/sesizari", config);

        // Procesăm datele primite de la backend
        const toate = data.map(s => ({
          id: s._id,
          titlu: s.titlu,
          descriere: s.descriere,
          firma: s.createdByBeneficiaryId?.profile?.nume_companie || "—",
          status: s.status,
          pasi: s.pasiRezolvare || "",
          data: s.createdAt ? new Date(s.createdAt).toLocaleDateString('ro-RO') : "—",
          dataFinalizare: s.dataFinalizare
        }));

        // Grupăm solicitările pe coloane în funcție de status
        const grouped = {
          preluată: toate.filter(s => s.status === "preluată"),
          inCurs: toate.filter(s => s.status === "inCurs"),
          rezolvata: toate.filter(s => s.status === "rezolvata")
        };

        setSolicitari(grouped);

      } catch (err) {
        console.error("Eroare la preluarea solicitărilor:", err);
        setError(err.response?.data?.message || "Nu s-au putut încărca datele de pe server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitari();
  }, []); // Se execută o singură dată la încărcarea componentei

  // --- LOGICĂ ACȚIUNI ---
  // Funcție pentru mutarea unei sesizări între coloane (schimbarea statusului)
  const mutaSesizare = async (id, from, to) => {
    if (!window.confirm("Sunteți sigur că doriți să schimbați statusul acestei solicitări?")) return;

    const newStatus = to; // Noul status este cheia coloanei destinație

    try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        if (!userInfo || !userInfo.token) throw new Error("Utilizator neautentificat!");

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // **CORECTURĂ CRITICĂ**: Trimitem token-ul la cererea de actualizare
        await axios.patch(`http://localhost:3000/api/sesizari/${id}/status`, { status: newStatus }, config);

        // Actualizăm starea locală DOAR după ce backend-ul a confirmat succesul
        setSolicitari(prev => {
            const itemToMove = prev[from].find(s => s.id === id);
            if (!itemToMove) return prev;

            return {
                ...prev,
                [from]: prev[from].filter(s => s.id !== id),
                [to]: [...prev[to], { ...itemToMove, status: newStatus }]
            };
        });
        alert("Statusul a fost actualizat cu succes!");

    } catch (err) {
      console.error("Eroare la actualizarea statusului:", err);
      alert("Eroare: Nu s-a putut actualiza statusul. Încercați din nou.");
    }
  };

  // Funcție pentru ștergerea unei solicitări
  const handleDelete = async (id, statusColoana) => {
    if (!window.confirm("Sunteți sigur că doriți să ștergeți definitiv această solicitare?")) return;
    
    try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        if (!userInfo || !userInfo.token) throw new Error("Utilizator neautentificat!");

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // **CORECTURĂ CRITICĂ**: Trimitem token-ul la cererea de ștergere
        await axios.delete(`http://localhost:3000/api/sesizari/${id}`, config);
        
        // Actualizăm starea locală pentru a reflecta ștergerea
        setSolicitari(prev => ({
          ...prev,
          [statusColoana]: prev[statusColoana].filter(item => item.id !== id)
        }));
        alert("Solicitarea a fost ștearsă cu succes!");

    } catch (error) {
        console.error("Eroare la ștergerea solicitării:", error);
        alert("Eroare: Nu s-a putut șterge solicitarea.");
    }
  };


  // --- LOGICĂ RENDER ---
  const coloane = [
    { key: "preluată", label: "Preluată" },
    { key: "inCurs", label: "În curs de rezolvare" },
    { key: "rezolvata", label: "Rezolvată" }
  ];

  // Filtrare după firmă
  const solicitariFiltrate = {};
  for (const key in solicitari) {
    solicitariFiltrate[key] = solicitari[key].filter(s =>
      s.firma && s.firma.toLowerCase().includes(termenCautare.toLowerCase())
    );
  }

  // Afișăm mesaje de încărcare sau eroare
  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>Se încarcă solicitările...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>Eroare: {error}</div>;

  return (
    <div className="solicitari-container">
      <div style={{ marginBottom: "15px" }}>
        <Link to="/" className="back-btn">
          ⬅ Înapoi
        </Link>
      </div>

      <h1>Solicitări</h1>
      <div className="search-section">
        <input
          type="text"
          placeholder="Caută după firmă..."
          value={termenCautare}
          onChange={(e) => setTermenCautare(e.target.value)}
        />
      </div>

      <div className="solicitari-grid">
        {coloane.map((col, index) => (
          <div className="solicitari-column" key={col.key}>
            <h2>{col.label}</h2>
            <table>
              <thead>
                <tr>
                  <th>Titlu</th>
                  <th>Data</th>
                  <th>Firma</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {solicitariFiltrate[col.key].length > 0 ? (
                  solicitariFiltrate[col.key].map(s => (
                    <tr key={s.id}>
                      <td>{s.titlu}</td>
                      <td>{s.data}</td>
                      <td>{s.firma}</td>
                      <td>
                        <div className="actiuni-container">
                          {/* Butonul de mutare este vizibil doar dacă nu e ultima coloană */}
                          {index < coloane.length - 1 && (
                            <button 
                              className="btn-mic mutare"
                              title={`Mută la "${coloane[index + 1].label}"`}
                              onClick={() => mutaSesizare(s.id, col.key, coloane[index + 1].key)}
                            >
                              ➡
                            </button>
                          )}

                          <Link to={`/solicitari/${s.id}`} className="detalii-btn">Detalii</Link>

                          {/* Butonul de ștergere este vizibil doar în coloana "Rezolvată" */}
                          {col.key === 'rezolvata' && (
                            <button
                              className="sterge-btn"
                              title="Șterge definitiv"
                              onClick={() => handleDelete(s.id, col.key)}
                            >
                              Șterge
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">Nicio solicitare aici.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}