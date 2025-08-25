import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./AdaugaFirma.css";

export default function AdaugaFirma() {
  const [formData, setFormData] = useState({
    nume_companie: "",
    email: "",
    parola: "",
    punct_de_lucru: "",
    telefon: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Firmă adăugată:", formData);
    alert("✅ Firmă adăugată cu succes!");
    setFormData({ nume_companie: "", email: "", parola: "", punct_de_lucru: "", telefon: "" });
  };

  return (
    <div className="adauga-angajat">
      <h2>Adaugă Firmă</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="nume_companie">Nume Companie:</label>
          <input
            id="nume_companie"
            type="text"
            name="nume_companie"
            value={formData.nume_companie}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="parola">Parola:</label>
          <input
            id="parola"
            type="password"
            name="parola"
            value={formData.parola}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="punct_de_lucru">Punct de lucru:</label>
          <input
            id="punct_de_lucru"
            type="text"
            name="punct_de_lucru"
            value={formData.punct_de_lucru}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefon">Telefon:</label>
          <input
            id="telefon"
            type="tel"
            name="telefon"
            value={formData.telefon}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {/* Butoane pe același rând */}
        <div className="buttons">
          <button 
            type="button" 
            className="back-btn" 
            onClick={() => navigate(-1)}
          >
            ⬅ Înapoi
          </button>
          <button type="submit" className="save-btn">Salvează</button>
        </div>
      </form>
    </div>
  );
}
