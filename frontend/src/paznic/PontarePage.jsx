// Cale: frontend/src/paznic/PontarePage.jsx (Versiune SIMPLIFICATĂ, fără useEffect)

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PontarePage.css";

// Componenta pentru Modal (definită în același fișier pentru simplitate)
const ProcesVerbalModal = ({ pontajId, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    data_incheierii: new Date().toISOString().slice(0, 16),
    nume_sef_formatie: '',
    nume_reprezentant_primire: '',
    obiecte_predate: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, pontajId });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Proces Verbal de Predare-Primire</h2>
          
          <div className="modal-form-group">
            <label htmlFor="data_incheierii">Data și Ora Încheierii</label>
            <input id="data_incheierii" type="datetime-local" name="data_incheierii" value={formData.data_incheierii} onChange={handleChange} required />
          </div>
          <div className="modal-form-group">
            <label htmlFor="nume_sef_formatie">Nume Reprezentant Predare (Dvs.)</label>
            <input id="nume_sef_formatie" type="text" name="nume_sef_formatie" value={formData.nume_sef_formatie} onChange={handleChange} placeholder="Ex: Popescu Ion" required />
          </div>
          <div className="modal-form-group">
            <label htmlFor="nume_reprezentant_primire">Nume Reprezentant Primire (Colegul)</label>
            <input id="nume_reprezentant_primire" type="text" name="nume_reprezentant_primire" value={formData.nume_reprezentant_primire} onChange={handleChange} placeholder="Ex: Ionescu Vasile" required />
          </div>
          <div className="modal-form-group">
            <label htmlFor="obiecte_predate">Obiecte / Sarcini Predate</label>
            <textarea id="obiecte_predate" name="obiecte_predate" value={formData.obiecte_predate} onChange={handleChange} rows="5" placeholder="Descrieți pe scurt ce se predă..." required></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>Anulează</button>
            <button type="submit" className="submit-pv-btn" disabled={loading}>
              {loading ? 'Se procesează...' : 'Salvează și Încheie Tura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componenta Principală PontarePage
export default function PontarePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const trackingIntervalRef = useRef(null);

  // Funcțiile de tracking rămân la fel, dar le vom apela diferit
  const sendLocationUpdate = () => { /* ... codul tău existent pentru sendLocationUpdate ... */ };
  const stopTracking = () => { /* ... codul tău existent pentru stopTracking ... */ };

  const startTracking = () => {
    if (trackingIntervalRef.current) return;
    sendLocationUpdate();
    trackingIntervalRef.current = setInterval(sendLocationUpdate, 300000); // 5 minute
    console.log("Tracking-ul a pornit.");
  };

  // --- Handler pentru butonul "Începe Tura" ---
  const handleIncepeTura = () => {
    setLoading(true);
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const userInfo = JSON.parse(localStorage.getItem('currentUser'));
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          
          // Singura diferență: nu mai trimitem qrCode
          const { data } = await axios.post('http://localhost:3000/api/pontaj/check-in', { latitude, longitude }, config);
          
          setMessage(`✅ ${data.message}`);
          startTracking(); // Pornim tracking-ul doar la succes

        } catch (err) {
          console.error("DETALII EROARE DE LA BACKEND:", err.response); 
          setMessage(`❌ ${err.response?.data?.message || 'Eroare la check-in.'}`);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage("❌ Nu se poate începe tura. Permite accesul la locație.");
        setLoading(false);
      },
      { enableHighAccuracy: true } // locație precisă
    );
  };

  // --- Handler pentru butonul "Termină Tura" ---
  const handleTerminaTura = async () => {
    setLoading(true);
    setMessage(''); // Resetăm mesajul la fiecare acțiune
    try {
        stopTracking(); // Oprim tracking-ul imediat, indiferent de rezultat
        const userInfo = JSON.parse(localStorage.getItem('currentUser'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('http://localhost:3000/api/pontaj/check-out', {}, config);
        
        setMessage(`✅ ${data.message}`);
    } catch (err) {
        setMessage(`❌ ${err.response?.data?.message || 'Eroare la check-out.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pontare-page">
      {isModalOpen && activePontaj && (
        <ProcesVerbalModal
          pontajId={activePontaj._id}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleFinalizeShift}
          loading={loading}
        />
      )}

      <div className="pontare-container">
        <h2>Pontare</h2>
        
        <div className="pontaj-info">
            <p>Apasă butonul corespunzător pentru a începe sau a termina tura.</p>
        </div>

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
