import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./AdaugaSolicitare.css";

export default function AdaugaSolicitare() {
  const [formData, setFormData] = useState({ titlu: "", descriere: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titlu || !formData.descriere) {
      setError("Titlul și descrierea sunt obligatorii.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // <-- MODIFICARE: Folosim apiClient, care gestionează automat token-ul
      await apiClient.post("/sesizari", {
        titlu: formData.titlu,
        descriere: formData.descriere,
      });

      alert("✅ Solicitarea a fost trimisă cu succes!");
      navigate("/solicitariB");
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la adăugarea solicitării!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adauga-solicitare-container">
      <h1>Adaugă o Solicitare Nouă</h1>

      {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

      <form className="adauga-solicitare-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="titlu"
          placeholder="Subiectul solicitării"
          value={formData.titlu}
          onChange={handleChange}
          required
        />
        <textarea
          name="descriere"
          placeholder="Descrieți în detaliu solicitarea dumneavoastră..."
          value={formData.descriere}
          onChange={handleChange}
          required
          rows="5"
        ></textarea>

        <div className="form-buttons">
          <button type="button" className="back-btn-form" onClick={() => navigate("/solicitariB")} disabled={loading}>
            Înapoi
          </button>
          <button type="submit" className="submit-btn-form" disabled={loading}>
            {loading ? "Se trimite..." : "Trimite Solicitarea"}
          </button>
        </div>
      </form>
    </div>
  );
}