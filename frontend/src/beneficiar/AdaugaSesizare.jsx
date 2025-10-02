import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./AdaugaSesizare.css";

export default function AdaugaSesizare() {
  const [titlu, setTitlu] = useState("");
  const [descriere, setDescriere] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titlu || !descriere) {
      setError("Titlul și descrierea sunt obligatorii.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      // <-- MODIFICARE: Folosim apiClient pentru a trimite datele la server
      await apiClient.post('/sesizari', { titlu, descriere });
      
      alert("✅ Sesizarea a fost trimisă cu succes!");
      navigate("/sesizariB");
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la trimiterea sesizării.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adauga-sesizare-container">
      <h1>Adaugă o Sesizare Nouă</h1>

      {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
      
      <form className="adauga-sesizare-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Subiectul sesizării"
          value={titlu}
          onChange={(e) => setTitlu(e.target.value)}
          required
        />
        <textarea
          placeholder="Descrieți în detaliu problema întâmpinată..."
          value={descriere}
          onChange={(e) => setDescriere(e.target.value)}
          required
          rows="5"
        ></textarea>
        
        <div className="form-buttons">
          <button type="button" className="back-btn-form" onClick={() => navigate("/sesizariB")} disabled={loading}>
            Înapoi
          </button>
          <button type="submit" className="submit-btn-form" disabled={loading}>
            {loading ? 'Se trimite...' : 'Trimite Sesizarea'}
          </button>
        </div>
      </form>
    </div>
  );
}