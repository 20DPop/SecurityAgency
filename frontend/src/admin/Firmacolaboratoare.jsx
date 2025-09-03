import React, { useEffect, useState } from "react";
import "./Firmacolaboratoare.css";
import axios from "axios";

export default function Firmacolaboratoare() {
  const [beneficiari, setBeneficiari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    telefon: "",
    nume_companie: "",
    punct_de_lucru: "",
  });
  const [newPassword, setNewPassword] = useState("");

  // --- FETCH BENEFICIARI ---
  useEffect(() => {
    const fetchBeneficiari = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) throw new Error("Utilizator neautentificat!");

        const res = await fetch("http://localhost:3000/api/users/beneficiari", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Eroare la preluarea beneficiarilor");

        const data = await res.json();
        setBeneficiari(data);
      } catch (err) {
        console.error("Eroare:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiari();
  }, []);

  // --- FUNCȚII ---
  const handleEdit = (user) => {
    setEditUser(user);

    setFormData({
      nume: user.nume || "",
      prenume: user.prenume || "",
      email: user.email || "",
      telefon: user.telefon || "",
      nume_companie: user.profile?.nume_companie || "",
      punct_de_lucru: user.profile?.punct_de_lucru || "",
    });
  };

  const handleChangePassword = (user) => {
    setPasswordUser(user);
    setNewPassword("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (userId) => {
  if (!window.confirm("Ești sigur că vrei să ștergi acest beneficiar?")) return;

  try {
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
    if (!token) throw new Error("Utilizator neautentificat!");

    await axios.delete(`http://localhost:3000/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Beneficiar șters cu succes!");
    setBeneficiari((prev) => prev.filter((u) => u._id !== userId));
  } catch (err) {
    console.error(err);
    setError("Eroare la ștergerea beneficiarului.");
  }
  };

  const handleSave = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      if (!token) throw new Error("Utilizator neautentificat!");

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // reconstruim structura pentru backend
      const updatedUser = {
        nume: formData.nume,
        prenume: formData.prenume,
        email: formData.email,
        telefon: formData.telefon,
        profile: {
          nume_companie: formData.nume_companie,
          punct_de_lucru: formData.punct_de_lucru,
        },
      };

      await axios.put(
        `http://localhost:3000/api/users/${editUser._id}`,
        updatedUser,
        config
      );

      alert("Datele au fost salvate!");
      setEditUser(null);

      // reîncarcă lista
      const res = await fetch("http://localhost:3000/api/users/beneficiari", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBeneficiari(data);
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
        { newPassword },
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
  if (loading) return <div className="loading">Se încarcă lista beneficiarilor...</div>;
  if (error) return <div className="loading">Eroare: {error}</div>;

  // --- FORMULAR SCHIMBARE PAROLĂ ---
  if (passwordUser) {
    return (
      <div className="beneficiari-container edit-form-container">
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
      <div className="beneficiari-container edit-form-container">
        <h1>Editare Beneficiar</h1>
        <div className="form-group">
          <label>Nume contact</label>
          <input name="nume" value={formData.nume} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Prenume contact</label>
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
        <div className="form-group">
          <label>Nume Companie</label>
          <input name="nume_companie" value={formData.nume_companie} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Punct de lucru</label>
          <input name="punct_de_lucru" value={formData.punct_de_lucru} onChange={handleChange} />
        </div>

        <button className="save-btn" onClick={handleSave}>💾 Salvează</button>
        <button className="back-btn" onClick={handleBack}>⬅ Înapoi</button>
      </div>
    );
  }

  // --- TABEL BENEFICIARI ---
  return (
    <div className="beneficiari-container">
      <h1>Lista Beneficiarilor</h1>
      <div className="table-responsive">
        <table className="beneficiari-table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Email</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {beneficiari.length > 0 ? (
              beneficiari.map((user) => (
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
                    <button
                    className="edit-btn"
                    style={{ backgroundColor: "#dc3545", marginLeft: "5px" }}
                    onClick={() => handleDelete(user._id)}
                  >
                    🗑️ Șterge
                  </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nu există beneficiari înregistrați.
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
