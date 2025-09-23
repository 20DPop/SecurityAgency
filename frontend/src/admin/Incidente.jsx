// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./Incidente.css";

// export default function Incidente() {
//   const [firme, setFirme] = useState([]);
//   const [incidente, setIncidente] = useState([]);
//   const [selectedFirma, setSelectedFirma] = useState("");
//   const [selectedPunct, setSelectedPunct] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // --- FETCH FIRME ---
//   useEffect(() => {
//     const fetchFirme = async () => {
//       try {
//         const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//         if (!token) throw new Error("Utilizator neautentificat!");

//         const res = await axios.get("http://localhost:3000/api/users/beneficiari", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setFirme(res.data);
//       } catch (err) {
//         console.error("Eroare la încărcarea firmelor:", err);
//         setError("Nu s-au putut încărca firmele.");
//       }
//     };
//     fetchFirme();
//   }, []);

//   // --- FETCH INCIDENTE ---
//   useEffect(() => {
//     const fetchIncidente = async () => {
//       try {
//         const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//         if (!token) throw new Error("Utilizator neautentificat!");

//         const res = await axios.get("http://localhost:3000/api/incidente", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setIncidente(res.data);
//       } catch (err) {
//         console.error("Eroare la încărcarea incidentelor:", err);
//       }
//     };
//     fetchIncidente();
//   }, []);

//   // --- SALVARE INCIDENT ---
//   const handleSave = async () => {
//     if (!selectedFirma || !selectedPunct) {
//       alert("Selectează compania și punctul de lucru!");
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//       if (!token) throw new Error("Utilizator neautentificat!");

//       const firmaObj = firme.find(f => f.profile?.nume_companie === selectedFirma);
//       const userId = firmaObj?._id;
//       if (!firmaObj) throw new Error("Firma selectată nu există!");

//       const payload = {
//         titlu: `Incident la ${selectedFirma}`,
//         descriere: "Buton panică activat",
//         companieId: userId,
//         punctDeLucru: selectedPunct,
//       };

//       const res = await axios.post("http://localhost:3000/api/incidente", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setIncidente(prev => [...prev, res.data]);
//       setShowForm(false);
//       setSelectedFirma("");
//       setSelectedPunct("");
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Eroare la salvarea incidentului.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- RESTABILIRE INCIDENT ---
//   const handleRestabilire = async (id) => {
//     try {
//       const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//       if (!token) throw new Error("Utilizator neautentificat!");

//       const res = await axios.post(`http://localhost:3000/api/incidente/${id}/restabilire`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Nu schimbăm cardul original, adăugăm doar noul incident verde
//       setIncidente(prev => [...prev, res.data]);
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Eroare la restabilirea incidentului.");
//     }
//   };

//   // --- ȘTERGERE INCIDENT ---
//   const handleDelete = async (id) => {
//     if (!window.confirm("Ești sigur că vrei să ștergi acest incident?")) return;

//     try {
//       const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//       if (!token) throw new Error("Utilizator neautentificat!");

//       await axios.delete(`http://localhost:3000/api/incidente/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setIncidente(prev => prev.filter(inc => inc._id !== id));
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Eroare la ștergerea incidentului.");
//     }
//   };

//   const puncteLucru = firme.find(f => f.profile?.nume_companie === selectedFirma)?.profile?.punct_de_lucru || [];

//   return (
//     <div className="incidente-container">
//       <h1>Incidente</h1>
//       {error && <p className="error-message">{error}</p>}

//       <button className="add-btn" onClick={() => setShowForm(true)}>➕ Adaugă incident</button>

//       {showForm && (
//         <div className="incident-form">
//           <div className="form-group">
//             <label>Companie</label>
//             <select value={selectedFirma} onChange={(e) => setSelectedFirma(e.target.value)}>
//               <option value="">-- Selectează compania --</option>
//               {firme.map(firma => (
//                 <option key={firma._id} value={firma.profile?.nume_companie}>
//                   {firma.profile?.nume_companie}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Punct de lucru</label>
//             <select
//               value={selectedPunct}
//               onChange={(e) => setSelectedPunct(e.target.value)}
//               disabled={!selectedFirma}
//             >
//               <option value="">-- Selectează punctul de lucru --</option>
//               {Array.isArray(puncteLucru)
//                 ? puncteLucru.map((punct, i) => <option key={i} value={punct}>{punct}</option>)
//                 : <option value={puncteLucru}>{puncteLucru}</option>
//               }
//             </select>
//           </div>

//           <button className="save-btn" onClick={handleSave} disabled={loading}>
//             {loading ? "Se salvează..." : "💾 Salvează"}
//           </button>
//         </div>
//       )}

//       <div className="incidente-list">
//         {incidente.map((inc, i) => {
//           const firma = firme.find(f => f._id === inc.companieId);
//           return (
//             <div
//               key={i}
//               className="incident-card"
//               style={{ backgroundColor: inc.restabilit ? "#d4edda" : "#f8d7da" }} // verde doar pentru restabilit
//             >
//               {inc.restabilit ? inc.titlu : inc.titlu} - <b>{inc.punctDeLucru}</b> - <b>{firma?.profile?.nume_companie || "Necunoscut"}</b>

//               <div style={{ marginTop: "5px" }}>
//                 {!inc.restabilit && (
//                   <button
//                     className="restabilire-btn"
//                     onClick={() => handleRestabilire(inc._id)}
//                   >
//                     ♻ Restabilire
//                   </button>
//                 )}
//                 <button
//                   className="delete-btn"
//                   onClick={() => handleDelete(inc._id)}
//                   style={{ marginLeft: "5px", backgroundColor: "#dc3545", color: "white" }}
//                 >
//                   🗑️ Șterge
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <button className="back-bottom-btn" onClick={() => window.history.back()}>
//         ⬅ Înapoi
//       </button>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ pentru redirect
import "./Incidente.css";

export default function Incidente() {
  const [firme, setFirme] = useState([]);
  const [incidente, setIncidente] = useState([]);
  const [selectedFirma, setSelectedFirma] = useState("");
  const [selectedPunct, setSelectedPunct] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingRestabilire, setPendingRestabilire] = useState(null); // ✅ stocăm ce e în proces

  const navigate = useNavigate();

  // --- FETCH FIRME ---
  useEffect(() => {
    const fetchFirme = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await axios.get("http://localhost:3000/api/users/beneficiari", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFirme(res.data);
      } catch (err) {
        console.error("Eroare la încărcarea firmelor:", err);
        setError("Nu s-au putut încărca firmele.");
      }
    };
    fetchFirme();
  }, []);

  // --- FETCH INCIDENTE ---
  useEffect(() => {
  const fetchIncidente = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      if (!token) throw new Error("Utilizator neautentificat!");

      const res = await axios.get("http://localhost:3000/api/incidente", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ filtrăm cele care nu sunt în istoric
      setIncidente(res.data.filter(inc => !inc.istoric));
    } catch (err) {
      console.error("Eroare la încărcarea incidentelor:", err);
    }
  };
    fetchIncidente();
  }, []);

  // --- SALVARE INCIDENT ---
  const handleSave = async () => {
    if (!selectedFirma || !selectedPunct) {
      alert("Selectează compania și punctul de lucru!");
      return;
    }

    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      if (!token) throw new Error("Utilizator neautentificat!");

      const firmaObj = firme.find(f => f.profile?.nume_companie === selectedFirma);
      const userId = firmaObj?._id;
      if (!firmaObj) throw new Error("Firma selectată nu există!");

      const payload = {
        titlu: `Incident la ${selectedFirma}`,
        descriere: "Buton panică activat",
        companieId: userId,
        punctDeLucru: selectedPunct,
      };

      const res = await axios.post("http://localhost:3000/api/incidente", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIncidente(prev => [...prev, res.data]);
      setShowForm(false);
      setSelectedFirma("");
      setSelectedPunct("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Eroare la salvarea incidentului.");
    } finally {
      setLoading(false);
    }
  };

  // --- RESTABILIRE INCIDENT ---
  const handleRestabilire = async (id) => {
  try {
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
    if (!token) throw new Error("Utilizator neautentificat!");

    const res = await axios.post(`http://localhost:3000/api/incidente/${id}/restabilire`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const incidentNou = res.data;

    // Adăugăm pe ecranul principal (verde) împreună cu originalul (roșu)
    setIncidente(prev => [...prev, incidentNou]);

    // După 10 secunde le scoatem de pe ecranul principal
    setTimeout(() => {
      setIncidente(prev =>
        prev.filter(inc => inc._id !== id && inc._id !== incidentNou._id)
      );
      navigate("/istoric-incidente");
    }, 10000);
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Eroare la restabilirea incidentului.");
  }
};


  // --- ȘTERGERE INCIDENT ---
  const handleDelete = async (id) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest incident?")) return;

    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      if (!token) throw new Error("Utilizator neautentificat!");

      await axios.delete(`http://localhost:3000/api/incidente/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIncidente(prev => prev.filter(inc => inc._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Eroare la ștergerea incidentului.");
    }
  };

  const puncteLucru = firme.find(f => f.profile?.nume_companie === selectedFirma)?.profile?.punct_de_lucru || [];

  return (
    <div className="incidente-container">
      <h1>Incidente</h1>
      {error && <p className="error-message">{error}</p>}

      <div style={{ display: "flex", gap: "10px" }}>
        <button className="add-btn" onClick={() => setShowForm(true)}>➕ Adaugă incident</button>
        <button className="history-btn" onClick={() => navigate("/istoric-incidente")}>📜 Istoric incidente</button>
      </div>

      {showForm && (
        <div className="incident-form">
          <div className="form-group">
            <label>Companie</label>
            <select value={selectedFirma} onChange={(e) => setSelectedFirma(e.target.value)}>
              <option value="">-- Selectează compania --</option>
              {firme.map(firma => (
                <option key={firma._id} value={firma.profile?.nume_companie}>
                  {firma.profile?.nume_companie}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Punct de lucru</label>
            <select
              value={selectedPunct}
              onChange={(e) => setSelectedPunct(e.target.value)}
              disabled={!selectedFirma}
            >
              <option value="">-- Selectează punctul de lucru --</option>
              {Array.isArray(puncteLucru)
                ? puncteLucru.map((punct, i) => <option key={i} value={punct}>{punct}</option>)
                : <option value={puncteLucru}>{puncteLucru}</option>
              }
            </select>
          </div>

          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Se salvează..." : "💾 Salvează"}
          </button>
        </div>
      )}

      <div className="incidente-list">
        {incidente.map((inc, i) => {
          const firma = firme.find(f => f._id === inc.companieId);
          return (
            <div
              key={i}
              className="incident-card"
              style={{ backgroundColor: inc.restabilit ? "#d4edda" : "#f8d7da" }}
            >
              {inc.titlu} - <b>{inc.punctDeLucru}</b> - <b>{firma?.profile?.nume_companie || "Necunoscut"}</b>

              <div style={{ marginTop: "5px" }}>
                {!inc.restabilit && (
                  <button
                    className="restabilire-btn"
                    onClick={() => handleRestabilire(inc._id)}
                  >
                    ♻ Restabilire
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(inc._id)}
                  style={{ marginLeft: "5px", backgroundColor: "#dc3545", color: "white" }}
                >
                  🗑️ Șterge
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button className="back-bottom-btn" onClick={() => window.history.back()}>
        ⬅ Înapoi
      </button>
    </div>
  );
}
