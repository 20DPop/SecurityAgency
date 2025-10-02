import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "../admin/AdaugaAngajat.css"; 
import PasswordInput from '../components/PasswordInput';

export default function AdaugaAdmin() {
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    password: "",
    passwordConfirm: "",
    telefon: "",
    nume_firma: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
        setError("Parolele nu se potrivesc!");
        return;
    }
    if (formData.password.length < 6) {
        setError('Parola trebuie să conțină cel puțin 6 caractere.');
        return;
    }

    setLoading(true);

    try {
        const payload = {
          nume: formData.nume,
          prenume: formData.prenume,
          email: formData.email,
          password: formData.password,
          telefon: formData.telefon,
          profile: {
            nume_firma: formData.nume_firma
          }
        };

        // <-- MODIFICARE: Folosim apiClient
        await apiClient.post('/users/create-admin', payload);

        alert("✅ Cont de Admin adăugat cu succes!");
        navigate(-1);

    } catch (err) {
        setError(err.response?.data?.message || 'A apărut o eroare la crearea contului.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        <h2>Adaugă Cont de Admin (Agenție)</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nume">Nume Contact Admin:</label>
            <input id="nume" type="text" name="nume" value={formData.nume} onChange={handleChange} required className="form-input"/>
          </div>
          <div className="form-group">
            <label htmlFor="prenume">Prenume Contact Admin:</label>
            <input id="prenume" type="text" name="prenume" value={formData.prenume} onChange={handleChange} required className="form-input"/>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input"/>
          </div>
          
          <PasswordInput
            label="Parolă:"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
          <PasswordInput
            label="Confirmă Parola:"
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            className="form-input"
          />
          
          <div className="form-group">
            <label htmlFor="nume_firma">Numele Agenției de Pază:</label>
            <input id="nume_firma" type="text" name="nume_firma" value={formData.nume_firma} onChange={handleChange} required className="form-input" placeholder="Ex: Vigilent Security SRL"/>
          </div>
          
          <div className="form-group">
            <label htmlFor="telefon">Telefon (opțional):</label>
            <input id="telefon" type="tel" name="telefon" value={formData.telefon} onChange={handleChange} className="form-input"/>
          </div>

          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

          <div className="form-actions">
            <button type="button" className="form-button back-btn" onClick={() => navigate(-1)} disabled={loading}>
              ⬅ Înapoi
            </button>
            <button type="submit" className="form-button submit-btn" disabled={loading}>
              {loading ? 'Se salvează...' : 'Salvează Cont Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}