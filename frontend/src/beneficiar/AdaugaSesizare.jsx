import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdaugaSesizare.css";

export default function AdaugaSesizare({ setSesizari, currentUser }) {
  const [titlu, setTitlu] = useState("");
  const [descriere, setDescriere] = useState("");
  const navigate = useNavigate();

  const handleAddSesizare = (e) => {
    e.preventDefault();

    if (!titlu || !descriere) {
      alert("Te rugăm să completezi atât titlul, cât și descrierea!");
      return;
    }

    const newSesizare = {
      id: Date.now(),
      titlu,
      descriere,
      data: new Date().toLocaleString(),
      status: "inCurs",
      autor: currentUser?.email || "beneficiar",
    };

    // Actualizăm starea din App.jsx
    setSesizari((prev) => [...prev, newSesizare]);
    
    // Navigăm înapoi la lista de sesizări
    navigate("/sesizariB");
  };

  return (
    <div className="adauga-sesizare-container">
      <h1>Adaugă o sesizare nouă</h1>
      
      <form className="adauga-sesizare-form" onSubmit={handleAddSesizare}>
        <input
          type="text"
          placeholder="Titlul sesizării"
          value={titlu}
          onChange={(e) => setTitlu(e.target.value)}
        />
        <textarea
          placeholder="Descrierea detaliată a problemei"
          value={descriere}
          onChange={(e) => setDescriere(e.target.value)}
        ></textarea>
        
        <div className="form-buttons">
          <button type="button" className="back-btn-form" onClick={() => navigate("/sesizariB")}>
            Înapoi
          </button>
          <button type="submit" className="submit-btn-form">
            Trimite sesizarea
          </button>
        </div>
      </form>
    </div>
  );
}