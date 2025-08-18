import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdaugaSolicitare.css"; // Vom crea acest fișier imediat

export default function AdaugaSolicitare({ setSolicitari, currentUser }) {
  const [titlu, setTitlu] = useState("");
  const [descriere, setDescriere] = useState("");
  const navigate = useNavigate();

  const handleAddSolicitare = (e) => {
    e.preventDefault();

    if (!titlu || !descriere) {
      alert("Te rugăm să completezi atât titlul, cât și descrierea!");
      return;
    }

    const newSolicitare = {
      id: Date.now(),
      titlu,
      descriere,
      data: new Date().toLocaleString(),
      status: "inCurs",
      autor: currentUser?.email || "beneficiar",
    };

    // Actualizăm starea din App.jsx
    setSolicitari((prev) => [...prev, newSolicitare]);
    
    // Navigăm înapoi la lista de solicitări
    navigate("/solicitariB");
  };

  return (
    <div className="adauga-solicitare-container">
      <h1>Adaugă o solicitare nouă</h1>
      
      <form className="adauga-solicitare-form" onSubmit={handleAddSolicitare}>
        <input
          type="text"
          placeholder="Titlul solicitării"
          value={titlu}
          onChange={(e) => setTitlu(e.target.value)}
        />
        <textarea
          placeholder="Descrierea detaliată a solicitării"
          value={descriere}
          onChange={(e) => setDescriere(e.target.value)}
        ></textarea>
        
        <div className="form-buttons">
          <button type="button" className="back-btn-form" onClick={() => navigate("/solicitariB")}>
            Înapoi
          </button>
          <button type="submit" className="submit-btn-form">
            Trimite solicitarea
          </button>
        </div>
      </form>
    </div>
  );
}