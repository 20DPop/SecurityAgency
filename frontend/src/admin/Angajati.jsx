import React, { useEffect, useState } from "react";
import "./Angajati.css";
import axios from 'axios';

export default function Angajati() {
  const [paznici, setPaznici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState(null); // utilizator selectat pentru editare
  const [passwordUser, setPasswordUser] = useState(null); // utilizator selectat pentru schimbare parolă
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    telefon: "",
  });
  const [newPassword, setNewPassword] = useState("");

  // Preluarea paznicilor de la backend
  useEffect(() => {
    const fetchPaznici = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/users/list/paznic", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Eroare la preluarea paznicilor");
        }

        const data = await res.json();
        setPaznici(data);
      } catch (err) {
        console.error("Eroare:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaznici();
  }, []);

  // --- FUNCȚII ---
  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      nume: user.nume,
      prenume: user.prenume,
      email: user.email,
      telefon: user.telefon || "",
    });
  };

  const handleChangePassword = (user) => {
    setPasswordUser(user);
    setNewPassword("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      if (!token) throw new Error("Utilizator neautentificat!");

      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(
        `http://localhost:3000/api/users/${editUser._id}`,
        formData,
        config
      );

      alert("Datele au fost salvate!");
      setEditUser(null);

      // Reîncarcă lista paznicilor
      const res = await fetch("http://localhost:3000/api/users/list/paznic", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPaznici(data);
    } catch (err) {
      console.error(err);
      setError("Eroare la salvarea datelor.");
    }
  };

  const handleSavePassword = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
    if (!token) throw new Error("Utilizator neautentificat!");

    await axios.put(
      `http://localhost:3000/api/users/${passwordUser._id}/password`,
      { newPassword }, // trimite exact câmpul așteptat de backend
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Parola a fost schimbată cu succes!");
    setPasswordUser(null);
    setNewPassword("");
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Eroare la schimbarea parolei.");
  }
};

  const handleBack = () => {
    setEditUser(null);
    setPasswordUser(null);
  };

  // --- RENDER ---
  if (loading) return <div className="loading">Se încarcă lista paznicilor...</div>;
  if (error) return <div className="loading">Eroare: {error}</div>;

  // --- FORMULAR SCHIMBARE PAROLĂ ---
  if (passwordUser) {
    return (
      <div className="angajati-container edit-form-container">
        <h1>Schimbare Parolă pentru {passwordUser.nume} {passwordUser.prenume}</h1>
        <div className="form-group">
          <label>Parola nouă</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button className="save-btn" onClick={handleSavePassword}>
          💾 Salvează parola
        </button>
        <button className="back-btn" onClick={handleBack}>⬅ Înapoi</button>
      </div>
    );
  }

  // --- FORMULAR EDITARE ---
  if (editUser) {
    return (
      <div className="angajati-container edit-form-container">
        <h1>Editare Paznic</h1>
        <div className="form-group">
          <label>Nume</label>
          <input name="nume" value={formData.nume} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Prenume</label>
          <input name="prenume" value={formData.prenume} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Telefon</label>
          <input name="telefon" value={formData.telefon} onChange={handleChange} />
        </div>

        <button className="save-btn" onClick={handleSave}>💾 Salvează</button>
        <button className="back-btn" onClick={handleBack}>⬅ Înapoi</button>
      </div>
    );
  }

  // --- TABEL PAZNICI ---
  return (
    <div className="angajati-container">
      <h1>Lista Paznicilor</h1>
      <div className="table-responsive">
        <table className="angajati-table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Email</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {paznici.length > 0 ? (
              paznici.map((user) => (
                <tr key={user._id}>
                  <td>{user.nume}</td>
                  <td>{user.prenume}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(user)}>
                      ✏️ Editare
                    </button>
                    <button
                      className="edit-btn"
                      style={{ backgroundColor: "#ffc107", marginLeft: "5px" }}
                      onClick={() => handleChangePassword(user)}
                    >
                      🔑 Schimbă parola
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nu există paznici înregistrați.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="back-bottom-btn" onClick={() => window.history.back()}>
        ⬅ Înapoi
      </button>
    </div>
  );
}
