import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./PontarePage.css";
import SignaturePadWrapper from '../components/SignaturePad';

// --- Componenta Modal (actualizată) ---
const ProcesVerbalModal = ({ pontajId, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    data_incheierii: new Date().toISOString().slice(0, 16),
    nume_reprezentant_primire: "",
    obiecte_predate: "",
    reprezentantBeneficiar: "",
    signatureDataURL: '',
  });

  const [beneficiari, setBeneficiari] = useState([]);
  const [signatureSaved, setSignatureSaved] = useState(false);

  useEffect(() => {
    const fetchBeneficiari = async () => {
      try {
        // <-- MODIFICARE: Folosim apiClient
        const { data } = await apiClient.get("/users/beneficiari");
        setBeneficiari(data);
      } catch (err) {
        console.error("Eroare la încărcarea beneficiarilor:", err);
      }
    };
    fetchBeneficiari();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSaveSignature = (signature) => {
    setFormData(prev => ({ ...prev, signatureDataURL: signature }));
    setSignatureSaved(true);
    alert('Semnătura a fost salvată. Puteți încheia tura.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.signatureDataURL) {
      alert("EROARE: Trebuie să semnați procesul verbal înainte de a încheia tura!");
      return;
    }
    onSubmit({ ...formData, pontajId });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Proces Verbal de Predare-Primire</h2>
          <fieldset disabled={signatureSaved}>
            <div className="modal-form-group">
              <label htmlFor="data_incheierii">Data și Ora Încheierii</label>
              <input id="data_incheierii" type="datetime-local" name="data_incheierii" value={formData.data_incheierii} onChange={handleChange} required />
            </div>
            <div className="modal-form-group">
              <label htmlFor="nume_reprezentant_primire">Nume Reprezentant Firmă Beneficiar</label>
              <input id="nume_reprezentant_primire" type="text" name="nume_reprezentant_primire" value={formData.nume_reprezentant_primire} onChange={handleChange} placeholder="Ex: Ionescu Vasile" required />
            </div>
            <div className="modal-form-group">
              <label htmlFor="reprezentantBeneficiar">Firmă Beneficiar</label>
              <select id="reprezentantBeneficiar" name="reprezentantBeneficiar" value={formData.reprezentantBeneficiar} onChange={handleChange} required>
                <option value="">-- Selectează --</option>
                {beneficiari.map((b) => (<option key={b._id} value={b.profile?.nume_companie}>{b.profile?.nume_companie} - {b.nume} {b.prenume}</option>))}
              </select>
            </div>
            <div className="modal-form-group">
              <label htmlFor="obiecte_predate">Obiecte / Sarcini Predate</label>
              <textarea id="obiecte_predate" name="obiecte_predate" value={formData.obiecte_predate} onChange={handleChange} rows="5" placeholder="Descrieți pe scurt ce se predă..." required></textarea>
            </div>
          </fieldset>
          <fieldset>
            <legend>Semnătură Predare</legend>
            {!signatureSaved ? (
                <SignaturePadWrapper onSave={handleSaveSignature} />
            ) : (
                <div style={{textAlign: 'center'}}><p style={{color: 'green', fontWeight: 'bold'}}>✓ Semnat</p><img src={formData.signatureDataURL} alt="Semnatura" style={{border: '1px solid #ccc', borderRadius: '5px', maxWidth: '200px'}} /></div>
            )}
          </fieldset>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>Anulează</button>
            <button type="submit" className="submit-pv-btn" disabled={loading || !signatureSaved}>{loading ? "Se procesează..." : "Salvează și Încheie Tura"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componenta Principală PontarePage (actualizată) ---
export default function PontarePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activePontaj, setActivePontaj] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchActivePontaj = async () => {
      setLoading(true);
      try {
        // <-- MODIFICARE: Folosim apiClient
        const { data } = await apiClient.get("/pontaj/active");
        setActivePontaj(data);
      } catch (error) {
        setMessage("Eroare la preluarea statusului turei.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivePontaj();
  }, []);

  const handleIncepeTura = () => {
    setLoading(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // <-- MODIFICARE: Folosim apiClient
          const { data } = await apiClient.post("/pontaj/check-in", { latitude, longitude });
          setActivePontaj(data.pontaj);
          setMessage(`✅ ${data.message}`);
        } catch (err) {
          setMessage(`❌ ${err.response?.data?.message || "Eroare la check-in."}`);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage("❌ Nu se poate începe tura. Permiteți accesul la locație.");
        setLoading(false);
      }
    );
  };

  const handleFinalizeShift = async (procesVerbalData) => {
    setLoading(true);
    setMessage("Se salvează procesul verbal...");
    try {
      // <-- MODIFICARE: Folosim apiClient
      await apiClient.post("/proces-verbal-predare/create", procesVerbalData);
      setMessage("Proces verbal salvat. Se încheie tura...");

      // <-- MODIFICARE: Folosim apiClient
      const { data: checkoutData } = await apiClient.post("/pontaj/check-out");

      setActivePontaj(null);
      setIsModalOpen(false);
      setMessage(`✅ ${checkoutData.message}`);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || "A apărut o eroare."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pontare-page">
      {isModalOpen && activePontaj && (
        <ProcesVerbalModal pontajId={activePontaj._id} onCancel={() => setIsModalOpen(false)} onSubmit={handleFinalizeShift} loading={loading} />
      )}
      <div className="pontare-container">
        <h2>Pontare</h2>
        <div className="pontaj-info">
          {activePontaj ? (
            <p><b>Tură activă începută la:</b> {new Date(activePontaj.ora_intrare).toLocaleString('ro-RO')}</p>
          ) : (
            <p>Nu aveți nicio tură activă.</p>
          )}
        </div>
        <div className="buttons">
          <button className="start-btn" onClick={handleIncepeTura} disabled={loading || activePontaj}>Începe Tura</button>
          <button className="end-btn" onClick={() => setIsModalOpen(true)} disabled={loading || !activePontaj}>Termină Tura</button>
        </div>
        {loading && !isModalOpen && <p>Se procesează...</p>}
        {message && (<div className="pontaj-info"><p><b>Status:</b> {message}</p></div>)}
        <button className="back-btn" onClick={() => navigate("/")}>Înapoi la Dashboard</button>
      </div>
    </div>
  );
}