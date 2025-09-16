import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; 
import "./AdaugaFirma.css";

export default function AdaugaFirma() {
  const [formData, setFormData] = useState({
    nume: "", 
    prenume: "", 
    email: "",
    password: "", 
    telefon: "",
    nume_companie: "",
    punct_de_lucru: ""
  });

  const [adaugPunct, setAdaugPunct] = useState(false); // 🔥 checkbox state
  const [companii, setCompanii] = useState([]); // lista firmelor existente
  const [selectedCompanie, setSelectedCompanie] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanii = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('currentUser'));
        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:3000/api/users/beneficiari", config);
        setCompanii(data);
      } catch (err) {
        console.error("Eroare la încărcarea companiilor:", err);
      }
    };

    if (adaugPunct) fetchCompanii();
  }, [adaugPunct]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const userInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!userInfo || !userInfo.token) throw new Error("Utilizator neautentificat!");

    const config = {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
    };

    if (adaugPunct) {
      // Adaugă punct de lucru la firma EXISTENTĂ
      if (!selectedCompanie) throw new Error("Trebuie să selectezi o companie.");

      await axios.put(
        `http://localhost:3000/api/users/${selectedCompanie}`,
        { profile: { punct_de_lucru: formData.punct_de_lucru } }, // trimite stringul direct
        config
      );

      alert("✅ Punct de lucru adăugat cu succes!");
    } else {
      // Adaugă firmă NOUĂ
      const payload = {
        nume: formData.nume,
        prenume: formData.prenume,
        email: formData.email,
        password: formData.password,
        telefon: formData.telefon,
        role: 'beneficiar',
        profile: {
          nume_companie: formData.nume_companie,
          punct_de_lucru: formData.punct_de_lucru ? [formData.punct_de_lucru] : [],
          assignedPazniciIds: []
        }
      };

      await axios.post('http://localhost:3000/api/users/create', payload, config);
      alert("✅ Firmă (Beneficiar) adăugată cu succes!");
    }

    navigate(-1);

  } catch (err) {
    setError(err.response?.data?.message || 'A apărut o eroare. Vă rugăm să încercați din nou.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="form-page-container">
      <div className="form-card">
        <h2>
          Adaugă Firmă
          <label style={{ marginLeft: "20px", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={adaugPunct}
              onChange={() => setAdaugPunct(!adaugPunct)}
            />{" "}
            Adaugă punct de lucru
          </label>
        </h2>

        <form onSubmit={handleSubmit}>
          {!adaugPunct ? (
            <>
              {/* FORMULAR ADAUGARE FIRMA NOUA */}
              <div className="form-group">
                <label htmlFor="nume">Nume contact:</label>
                <input id="nume" type="text" name="nume" value={formData.nume} onChange={handleChange} required className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="prenume">Prenume contact:</label>
                <input id="prenume" type="text" name="prenume" value={formData.prenume} onChange={handleChange} required className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="password">Parolă:</label>
                <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="telefon">Telefon:</label>
                <input id="telefon" type="tel" name="telefon" value={formData.telefon} onChange={handleChange} className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="nume_companie">Nume Companie:</label>
                <input id="nume_companie" type="text" name="nume_companie" value={formData.nume_companie} onChange={handleChange} required className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="punct_de_lucru">Punct de lucru:</label>
                <input id="punct_de_lucru" type="text" name="punct_de_lucru" value={formData.punct_de_lucru} onChange={handleChange} className="form-input"/>
              </div>
            </>
          ) : (
            <>
              {/* FORMULAR ADAUGARE PUNCT DE LUCRU */}
              <div className="form-group">
                <label htmlFor="companieSelect">Selectează compania:</label>
                <select
                  id="companieSelect"
                  value={selectedCompanie}
                  onChange={(e) => setSelectedCompanie(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">-- Alege compania --</option>
                  {companii.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.profile?.nume_companie}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="punct_de_lucru">Punct de lucru nou:</label>
                <input id="punct_de_lucru" type="text" name="punct_de_lucru" value={formData.punct_de_lucru} onChange={handleChange} required className="form-input"/>
              </div>
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" className="form-button back-btn" onClick={() => navigate(-1)} disabled={loading}>
              ⬅ Înapoi
            </button>
            <button type="submit" className="form-button submit-btn" disabled={loading}>
              {loading ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
