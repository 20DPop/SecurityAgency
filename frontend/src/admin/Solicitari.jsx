// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import "./Solicitari.css";

// export default function Solicitari({ solicitari, setSolicitari }) {
//   const [termenCautare, setTermenCautare] = useState("");

//   const mutaSesizare = (id, from, to) => {
//     const item = solicitari[from].find(s => s.id === id);
//     setSolicitari(prev => ({
//       ...prev,
//       [from]: prev[from].filter(s => s.id !== id),
//       [to]: [...prev[to], item]
//     }));
//   };

//   const coloane = [
//     { key: "preluată", label: "Prelucrată" },
//     { key: "inCurs", label: "În curs de rezolvare" },
//     { key: "rezolvata", label: "Rezolvată" }
//   ];

//   const solicitariFiltrate = {};
//   for (const key in solicitari) {
//     solicitariFiltrate[key] = solicitari[key].filter(s =>
//       s.firma.toLowerCase().includes(termenCautare.toLowerCase())
//     );
//   }

//   return (
//     <div className="solicitari-container">
//       {/* Buton Înapoi */}
//       <div style={{ marginBottom: "15px" }}>
//         <Link to="/" className="back-btn">
//           ⬅ Înapoi
//         </Link>
//       </div>

//       <h1>Solicitări</h1>
//       <div className="search-section">
//         <input
//           type="text"
//           placeholder="Caută după firmă..."
//           value={termenCautare}
//           onChange={(e) => setTermenCautare(e.target.value)}
//         />
//       </div>
//       <div className="solicitari-grid">
//         {coloane.map((col, index) => (
//           <div className="solicitari-column" key={col.key}>
//             <h2>{col.label}</h2>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Titlu</th>
//                   <th>Data</th>
//                   <th>Firma</th>
//                   <th>Acțiuni</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {solicitariFiltrate[col.key].map(s => (
//                   <tr key={s.id}>
//                     <td>{s.titlu}</td>
//                     <td>{s.data}</td>
//                     <td>{s.firma}</td>
//                     <td>
//                       <div className="actiuni-container">
//                         <div className="butoane-mutare">
//                           {index > 0 && (
//                             <button onClick={() => mutaSesizare(s.id, col.key, coloane[index - 1].key)}>
//                               ⬅
//                             </button>
//                           )}
//                           {index < coloane.length - 1 && (
//                             <button onClick={() => mutaSesizare(s.id, col.key, coloane[index + 1].key)}>
//                               ➡
//                             </button>
//                           )}
//                         </div>
//                         <Link to={`/solicitari/${s.id}`} className="detalii-btn">
//                           Detalii
//                         </Link>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// frontend/src/admin/Solicitari.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Solicitari.css";

export default function Solicitari() {
  const [solicitari, setSolicitari] = useState({
    preluată: [],
    inCurs: [],
    rezolvata: []
  });
  const [termenCautare, setTermenCautare] = useState("");

  // Preia toate sesizările de la backend
  useEffect(() => {
    axios.get("http://localhost:3000/api/sesizari")
    .then(res => {
      console.log(res.data); // verifică structura
      const toate = res.data.map(s => ({
        id: s._id,
        titlu: s.titlu,
        descriere: s.descriere,
        firma: s.createdByBeneficiaryId?.profile?.nume_companie || "—", // aici luăm nume_firma
        status: s.status,
        pasi: s.pasiRezolvare || "",
        data: s.createdAt ? s.createdAt.slice(0,10) : "—",
        dataFinalizare: s.dataFinalizare
      }));


    const grouped = {
      preluată: toate.filter(s => s.status === "preluată"),
      inCurs: toate.filter(s => s.status === "inCurs"),
      rezolvata: toate.filter(s => s.status === "rezolvata")
    };

    setSolicitari(grouped);
  });
  }, []);

  // Funcție pentru mutarea unei sesizări între coloane
  const mutaSesizare = async (id, from, to) => {
    // mesaj de confirmare
    const confirm = window.confirm("Ești sigur că vrei să schimbi statusul sesizării?");
    if (!confirm) return; // dacă apasă Nu, ieșim

    const item = solicitari[from].find(s => s._id === id || s.id === id);
    if (!item) return;

    const newStatus = to; // cheia coloanei devine noul status

    try {
      // 1. Trimite update la backend
      await axios.patch(`http://localhost:3000/api/sesizari/${id}/status`, { status: newStatus });

      // 2. Actualizează starea locală
      setSolicitari(prev => ({
        ...prev,
        [from]: prev[from].filter(s => s._id !== id && s.id !== id),
        [to]: [
          ...prev[to],
          { 
            ...item, 
            status: newStatus, 
            dataFinalizare: newStatus === 'rezolvata' ? new Date().toISOString().slice(0,10) : item.dataFinalizare
          }
        ]
      }));

      alert("Statusul a fost actualizat cu succes!"); // mesaj de succes
    } catch (error) {
      console.error("Eroare la actualizarea statusului:", error);
      alert("Nu s-a putut actualiza statusul în baza de date!");
    }
  };

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
                {solicitariFiltrate[col.key].map(s => (
                  <tr key={s._id || s.id}>
                    <td>{s.titlu}</td>
                    <td>{s.data || s.createdAt?.slice(0,10)}</td>
                    <td>{s.firma}</td>
                    <td>
                      <div className="actiuni-container">
                        <div className="butoane-mutare">
                          {/* {index > 0 && (
                            <button onClick={() => mutaSesizare(s._id || s.id, col.key, coloane[index - 1].key)}>⬅</button>
                          )} */}
                          {index < coloane.length - 1 && (
                            <button 
                              className="btn-mic mutare"
                              onClick={() => mutaSesizare(s._id || s.id, col.key, coloane[index + 1].key)}
                            >
                              ➡
                            </button>
                          )}
                        </div>

                        <Link to={`/solicitari/${s._id || s.id}`} className="detalii-btn">Detalii</Link>

                        {col.key === 'rezolvata' && (
                          <button
                            className="sterge-btn"
                            onClick={async () => {
                              const confirm = window.confirm("Sigur vrei să ștergi această solicitare?");
                              if (!confirm) return;

                              const id = s._id || s.id;
                              try {
                                await axios.delete(`http://localhost:3000/api/sesizari/${id}`);
                                setSolicitari(prev => ({
                                  ...prev,
                                  [col.key]: prev[col.key].filter(item => item._id !== id && item.id !== id)
                                }));
                                alert("Solicitarea a fost ștearsă!");
                              } catch (error) {
                                console.error(error);
                                alert("Nu s-a putut șterge solicitarea.");
                              }
                            }}
                          >
                            Șterge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
