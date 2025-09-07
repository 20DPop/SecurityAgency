// // Cale: frontend/src/paznic/PontarePage.jsx (Versiune SIMPLIFICATĂ, fără useEffect)

// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./PontarePage.css";

// export default function PontarePage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const trackingIntervalRef = useRef(null);

//   // Funcțiile de tracking rămân la fel, dar le vom apela diferit
//   const sendLocationUpdate = () => { /* ... codul tău existent pentru sendLocationUpdate ... */ };
//   const stopTracking = () => { /* ... codul tău existent pentru stopTracking ... */ };

//   const startTracking = () => {
//     if (trackingIntervalRef.current) return;
//     sendLocationUpdate();
//     trackingIntervalRef.current = setInterval(sendLocationUpdate, 300000); // 5 minute
//     console.log("Tracking-ul a pornit.");
//   };

//   // --- Handler pentru butonul "Începe Tura" ---
//   const handleIncepeTura = () => {
//     setLoading(true);
//     setMessage('');

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         try {
//           const { latitude, longitude } = position.coords;
//           const userInfo = JSON.parse(localStorage.getItem('currentUser'));
//           const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          
//           // Singura diferență: nu mai trimitem qrCode
//           const { data } = await axios.post('http://localhost:3000/api/pontaj/check-in', { latitude, longitude }, config);
          
//           setMessage(`✅ ${data.message}`);
//           startTracking(); // Pornim tracking-ul doar la succes

//         } catch (err) {
//           console.error("DETALII EROARE DE LA BACKEND:", err.response); 
//           setMessage(`❌ ${err.response?.data?.message || 'Eroare la check-in.'}`);
//         } finally {
//           setLoading(false);
//         }
//       },
//       (error) => {
//         setMessage("❌ Nu se poate începe tura. Permite accesul la locație.");
//         setLoading(false);
//       }
//     );
//   };

//   // --- Handler pentru butonul "Termină Tura" ---
//   const handleTerminaTura = async () => {
//     setLoading(true);
//     setMessage(''); // Resetăm mesajul la fiecare acțiune
//     try {
//         stopTracking(); // Oprim tracking-ul imediat, indiferent de rezultat
//         const userInfo = JSON.parse(localStorage.getItem('currentUser'));
//         const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//         const { data } = await axios.post('http://localhost:3000/api/pontaj/check-out', {}, config);
        
//         setMessage(`✅ ${data.message}`);
//     } catch (err) {
//         setMessage(`❌ ${err.response?.data?.message || 'Eroare la check-out.'}`);
//     } finally {
//         setLoading(false);
//     }
//   };

//   return (
//     <div className="pontare-page">
//       <div className="pontare-container">
//         <h2>Pontare</h2>
        
//         <div className="pontaj-info">
//             <p>Apasă butonul corespunzător pentru a începe sau a termina tura.</p>
//         </div>

//         <div className="buttons">
//             <button className="start-btn" onClick={handleIncepeTura} disabled={loading}>
//                 Începe Tura
//             </button>
//             <button className="end-btn" onClick={handleTerminaTura} disabled={loading}>
//                 Termină Tura
//             </button>
//         </div>

//         {/* Zona unde vor apărea mesajele de la server */}
//         {loading && <p>Se procesează...</p>}
//         {message && <div className="pontaj-info"><p><b>Status:</b> {message}</p></div>}
        
//         <button className="back-btn" onClick={() => navigate('/')}>Înapoi la Dashboard</button>
//       </div>
//     </div>
//   );
// }
// Cale: frontend/src/paznic/PontarePage.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PontarePage.css";

export default function PontarePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const trackingIntervalRef = useRef(null);

  // Trimite locația curentă către backend
  const sendLocationUpdate = async () => {
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      );

      const { latitude, longitude } = position.coords;
      const userInfo = JSON.parse(localStorage.getItem('currentUser'));
      if (!userInfo?.token) return;

      await axios.post(
        'http://localhost:3000/api/pontaj/update-location',
        { latitude, longitude },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

    } catch (err) {
      console.error("Nu s-a putut trimite locația:", err);
    }
  };

  const startTracking = () => {
    if (trackingIntervalRef.current) return;
    sendLocationUpdate(); // trimite imediat prima locație
    trackingIntervalRef.current = setInterval(sendLocationUpdate, 300000); // la fiecare 5 min
    console.log("Tracking-ul a pornit.");
  };

  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
      console.log("Tracking-ul a fost oprit.");
    }
  };

  // --- Check-in ---
  const handleIncepeTura = () => {
    setLoading(true);
    setMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const userInfo = JSON.parse(localStorage.getItem('currentUser'));
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          
          const { data } = await axios.post(
            'http://localhost:3000/api/pontaj/check-in',
            { latitude, longitude },
            config
          );

          setMessage(`✅ ${data.message}`);
          startTracking(); // pornim tracking-ul după check-in reușit

        } catch (err) {
          console.error("DETALII EROARE:", err.response);
          setMessage(`❌ ${err.response?.data?.message || 'Eroare la check-in.'}`);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage("❌ Nu se poate începe tura. Permite accesul la locație.");
        setLoading(false);
      },
      { enableHighAccuracy: true } // locație precisă
    );
  };

  // --- Check-out ---
  const handleTerminaTura = async () => {
    setLoading(true);
    setMessage('');
    stopTracking(); // oprim tracking-ul imediat
    try {
      const userInfo = JSON.parse(localStorage.getItem('currentUser'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('http://localhost:3000/api/pontaj/check-out', {}, config);
      
      setMessage(`✅ ${data.message}`);
    } catch (err) {
      console.error("DETALII EROARE:", err.response);
      setMessage(`❌ ${err.response?.data?.message || 'Eroare la check-out.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pontare-page">
      <div className="pontare-container">
        <h2>Pontare</h2>
        
        <p>Apasă butonul corespunzător pentru a începe sau a termina tura.</p>

        <div className="buttons">
          <button className="start-btn" onClick={handleIncepeTura} disabled={loading}>
            Începe Tura
          </button>
          <button className="end-btn" onClick={handleTerminaTura} disabled={loading}>
            Termină Tura
          </button>
        </div>

        {loading && <p>Se procesează...</p>}
        {message && <div className="pontaj-info"><p><b>Status:</b> {message}</p></div>}

        <button className="back-btn" onClick={() => navigate('/')}>
          ⬅ Înapoi la Dashboard
        </button>
      </div>
    </div>
  );
}
