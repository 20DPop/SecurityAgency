import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdaugaSolicitare.css";

export default function AdaugaSolicitare() {
  const [formData, setFormData] = useState({ titlu: "", descriere: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = currentUser?.token;
      if (!token) throw new Error("Utilizator neautentificat!");

      const res = await fetch("http://localhost:3000/api/sesizari", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titlu: formData.titlu,
          descriere: formData.descriere,
        }),
      });

      if (!res.ok) throw new Error("Eroare la adăugarea solicitării!");

      navigate("/solicitariB");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adauga-solicitare-container">
      <h1>Adaugă Solicitare</h1>

      {error && <div className="error">{error}</div>}

      <form className="adauga-solicitare-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="titlu"
          placeholder="Titlul solicitării"
          value={formData.titlu}
          onChange={handleChange}
          required
        />
        <textarea
          name="descriere"
          placeholder="Descrierea detaliată a solicitării"
          value={formData.descriere}
          onChange={handleChange}
          required
          rows="4"
        ></textarea>

        <div className="form-buttons">
          <button
            type="button"
            className="back-btn-form"
            onClick={() => navigate("/solicitariB")}
          >
            Înapoi
          </button>
          <button type="submit" className="submit-btn-form" disabled={loading}>
            {loading ? "Se trimite..." : "Trimite solicitarea"}
          </button>
        </div>
      </form>
    </div>
  );
}
