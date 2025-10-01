import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // Importăm instanța centralizată
import "./AdaugaFirma.css";
import PasswordInput from '../components/PasswordInput';

export default function AdaugaFirma() {
  const [formData, setFormData] = useState({
    nume: "", 
    prenume: "", 
    email: "",
    password: "",
    passwordConfirm: "",
    telefon: "",
    nume_companie: "",
    punct_de_lucru: ""
  });

  const [adaugPunct, setAdaugPunct] = useState(false);
  const [companii, setCompanii] = useState([]);
  const [selectedCompanie, setSelectedCompanie] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanii = async () => {
      try {
        const { data } = await apiClient.get("/users/beneficiari");
        setCompanii(data);
      } catch (err) {
        console.error("Eroare la încărcarea companiilor:", err);
      }
    };
    if (adaugPunct) {
      fetchCompanii();
    }
  }, [adaugPunct]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (adaugPunct) {
        if (!selectedCompanie) throw new Error("Trebuie să selectați o companie.");
        await apiClient.put(`/users/${selectedCompanie}`, { profile: { punct_de_lucru: formData.punct_de_lucru } });
        alert("✅ Punct de lucru adăugat cu succes!");
      } else {
        if (formData.password !== formData.passwordConfirm) throw new Error("Parolele nu se potrivesc!");
        if (formData.password.length < 6) throw new Error('Parola trebuie să conțină cel puțin 6 caractere.');
        
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
          }
        };
        await apiClient.post('/users/create', payload);
        alert("✅ Firmă (Beneficiar) adăugată cu succes!");
      }
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'A apărut o eroare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        <h2>Adaugă Firmă Beneficiar</h2>
        <div className="form-group" style={{ textAlign: 'center' }}>
          <label>
            <input type="checkbox" checked={adaugPunct} onChange={() => setAdaugPunct(!adaugPunct)} />
            Doresc să adaug un punct de lucru la o firmă existentă
          </label>
        </div>
        <hr />
        
        <form onSubmit={handleSubmit}>
          {!adaugPunct ? (
            <>
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
              
              <PasswordInput label="Parolă:" id="password" name="password" value={formData.password} onChange={handleChange} required className="form-input" />
              <PasswordInput label="Confirmă Parola:" id="passwordConfirm" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} required className="form-input" />

              <div className="form-group">
                <label htmlFor="telefon">Telefon:</label>
                <input id="telefon" type="tel" name="telefon" value={formData.telefon} onChange={handleChange} className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="nume_companie">Nume Companie:</label>
                <input id="nume_companie" type="text" name="nume_companie" value={formData.nume_companie} onChange={handleChange} required className="form-input"/>
              </div>
              <div className="form-group">
                <label htmlFor="punct_de_lucru">Punct de lucru inițial (opțional):</label>
                <input id="punct_de_lucru" type="text" name="punct_de_lucru" value={formData.punct_de_lucru} onChange={handleChange} className="form-input"/>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="companieSelect">Selectează compania existentă:</label>
                <select id="companieSelect" value={selectedCompanie} onChange={(e) => setSelectedCompanie(e.target.value)} required className="form-input">
                  <option value="">-- Alege compania --</option>
                  {companii.map((c) => (<option key={c._id} value={c._id}>{c.profile?.nume_companie}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="punct_de_lucru">Adaugă punct de lucru nou:</label>
                <input id="punct_de_lucru" type="text" name="punct_de_lucru" value={formData.punct_de_lucru} onChange={handleChange} required className="form-input"/>
              </div>
            </>
          )}

          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

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