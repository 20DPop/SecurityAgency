import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./AdaugaAngajat.css";

export default function AdaugaAngajat() {
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    parola: "",
    telefon: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Angajat adăugat:", formData);
    alert("✅ Angajat adăugat cu succes!");
    setFormData({ nume: "", prenume: "", email: "", parola: "", telefon: "" });
  };

  return (
    <div className="adauga-angajat">
      <h2>Adaugă Angajat</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="nume">Nume:</label>
          <input
            id="nume"
            type="text"
            name="nume"
            value={formData.nume}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prenume">Prenume:</label>
          <input
            id="prenume"
            type="text"
            name="prenume"
            value={formData.prenume}
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

        {/* 🔹 Butoane pe același rând */}
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
