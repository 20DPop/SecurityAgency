import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PontarePage.css";
import SignaturePadWrapper from '../components/SignaturePad';

// --- START COMPONENTA MODAL ---
const ProcesVerbalModal = ({ pontajId, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    data_incheierii: new Date().toISOString().slice(0, 16),
    nume_reprezentant_primire: "",
    obiecte_predate: "",
    reprezentantBeneficiar: "",
    reprezentantVigilent: "",
    signatureDataURL: '',
  });

  const [beneficiari, setBeneficiari] = useState([]);
  const [paznici, setPaznici] = useState([]);
  const [signatureSaved, setSignatureSaved] = useState(false);

  useEffect(() => {
    const fetchBeneficiari = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:3000/api/users/beneficiari", config);
        setBeneficiari(data);
      } catch (err) {
        console.error("Eroare la încărcarea beneficiarilor:", err);
      }
    };
    fetchBeneficiari();
  }, []);

  useEffect(() => {
    const fetchPaznici = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:3000/api/users/paznici", config);
        setPaznici(data);
      } catch (err) {
        console.error("Eroare la încărcarea paznicilor:", err);
      }
    };
    fetchPaznici();
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
              <input
                id="data_incheierii"
                type="datetime-local"
                name="data_incheierii"
                value={formData.data_incheierii}
                onChange={handleChange}
                required
              />
            </div>

            <div className="modal-form-group">
              <label htmlFor="reprezentantVigilent">Reprezentant Vigilent</label>
              <select
                id="reprezentantVigilent"
                name="reprezentantVigilent"
                value={formData.reprezentantVigilent}
                onChange={handleChange}
                required
              >
                <option value="">-- Selectează un angajat --</option>
                {paznici.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nume} {p.prenume}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label htmlFor="nume_reprezentant_primire">Nume Reprezentant Firmă Beneficiar</label>
              <input
                id="nume_reprezentant_primire"
                type="text"
                name="nume_reprezentant_primire"
                value={formData.nume_reprezentant_primire}
                onChange={handleChange}
                placeholder="Ex: Ionescu Vasile"
                required
              />
            </div>

            <div className="modal-form-group">
              <label htmlFor="reprezentantBeneficiar">Firmă Beneficiar</label>
              <select
                id="reprezentantBeneficiar"
                name="reprezentantBeneficiar"
                value={formData.reprezentantBeneficiar}
                onChange={handleChange}
                required
              >
                <option value="">-- Selectează --</option>
                {beneficiari.map((b) => (
                  <option key={b._id} value={b.profile?.nume_companie}>
                    {b.profile?.nume_companie} - {b.nume} {b.prenume}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label htmlFor="obiecte_predate">Obiecte / Sarcini Predate</label>
              <textarea
                id="obiecte_predate"
                name="obiecte_predate"
                value={formData.obiecte_predate}
                onChange={handleChange}
                rows="5"
                placeholder="Descrieți pe scurt ce se predă..."
                required
              ></textarea>
            </div>
          </fieldset>

          <fieldset>
            <legend>Semnătură Predare</legend>
            {!signatureSaved ? (
              <SignaturePadWrapper onSave={handleSaveSignature} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Semnat</p>
                <img src={formData.signatureDataURL} alt="Semnatura"
                  style={{ border: '1px solid #ccc', borderRadius: '5px', maxWidth: '200px' }} />
              </div>
            )}
          </fieldset>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>
              Anulează
            </button>
            <button type="submit" className="submit-pv-btn" disabled={loading || !signatureSaved}>
              {loading ? "Se procesează..." : "Salvează și Încheie Tura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- FINAL COMPONENTA MODAL ---

// --- START COMPONENTA PRINCIPALĂ ---
export default function PontarePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activePontaj, setActivePontaj] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchActivePontaj = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:3000/api/pontaj/active", config);
        setActivePontaj(data);
      } catch (error) {
        setMessage("Eroare la preluarea statusului turei.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivePontaj();
  }, []);

  const handleIncepeTura = async () => {
    setLoading(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const userInfo = JSON.parse(localStorage.getItem("currentUser"));
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.post(
            "http://localhost:3000/api/pontaj/check-in",
            { latitude, longitude },
            config
          );

          setActivePontaj(data.pontaj);
          setMessage(`✅ ${data.message}`);
        } catch (err) {
          setMessage(`❌ ${err.response?.data?.message || "Eroare la check-in."}`);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage("❌ Nu se poate începe tura. Permite accesul la locație.");
        setLoading(false);
      }
    );
  };

  const handleFinalizeShift = async (procesVerbalData) => {
    setLoading(true);
    setMessage("Se salvează procesul verbal...");

    try {
      const userInfo = JSON.parse(localStorage.getItem("currentUser"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.post("http://localhost:3000/api/proces-verbal-predare/create", procesVerbalData, config);
      setMessage("Proces verbal salvat. Se încheie tura...");

      const { data: checkoutData } = await axios.post("http://localhost:3000/api/pontaj/check-out", {}, config);

      setActivePontaj(null);
      setIsModalOpen(false);
      setMessage(`✅ ${checkoutData.message}`);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || "A apărut o eroare."}`);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE LOCAȚIE AUTOMATĂ ---
  useEffect(() => {
    let interval;

    if (activePontaj) {
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const userInfo = JSON.parse(localStorage.getItem("currentUser"));
              const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

              await axios.post(
                "http://localhost:3000/api/pontaj/update-location",
                { latitude, longitude },
                config
              );
            } catch (err) {
              console.error("Eroare la update location:", err);
            }
          },
          (error) => {
            console.error("Eroare GPS:", error);
          }
        );
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [activePontaj]);

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
          {activePontaj ? (
            <p>
              <b>Tură activă începută la:</b> {new Date(activePontaj.ora_intrare).toLocaleString()}
            </p>
          ) : (
            <p>Nu aveți nicio tură activă.</p>
          )}
        </div>

        <div className="buttons">
          <button
            className="start-btn"
            onClick={handleIncepeTura}
            disabled={loading || activePontaj}
          >
            Începe Tura
          </button>

          <button
            className="end-btn"
            onClick={() => setIsModalOpen(true)}
            disabled={loading || !activePontaj}
          >
            Termină Tura
          </button>
        </div>

        {loading && <p>Se procesează...</p>}
        {message && (
          <div className="pontaj-info">
            <p>
              <b>Status:</b> {message}
            </p>
          </div>
        )}

        <button className="back-btn" onClick={() => navigate("/")}>
          Înapoi la Dashboard
        </button>
      </div>
    </div>
  );
}
