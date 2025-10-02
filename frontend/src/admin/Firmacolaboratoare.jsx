import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./Firmacolaboratoare.css";

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
    punct_de_lucru: [],
  });
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const fetchBeneficiari = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/users/beneficiari"); // <-- MODIFICARE
      setBeneficiari(data);
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la preluarea beneficiarilor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiari();
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      nume: user.nume || "",
      prenume: user.prenume || "",
      email: user.email || "",
      telefon: user.telefon || "",
      nume_companie: user.profile?.nume_companie || "",
      punct_de_lucru: Array.isArray(user.profile?.punct_de_lucru) ? user.profile.punct_de_lucru : [],
    });
  };

  const handleChangePassword = (user) => {
    setPasswordUser(user);
    setNewPassword("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePunctDeLucruChange = (index, value) => {
    const updated = [...formData.punct_de_lucru];
    updated[index] = value;
    setFormData({ ...formData, punct_de_lucru: updated });
  };

  const addPunctDeLucru = () => {
    setFormData({ ...formData, punct_de_lucru: [...formData.punct_de_lucru, ""] });
  };

  const removePunctDeLucru = (index) => {
    const updated = formData.punct_de_lucru.filter((_, i) => i !== index);
    setFormData({ ...formData, punct_de_lucru: updated });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Sunteți sigur că doriți să ștergeți acest beneficiar?")) return;
    try {
      await apiClient.delete(`/users/${userId}`); // <-- MODIFICARE
      alert("Beneficiar șters cu succes!");
      setBeneficiari((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(`Eroare: ${err.response?.data?.message || "Nu s-a putut șterge beneficiarul."}`);
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = {
        nume: formData.nume,
        prenume: formData.prenume,
        email: formData.email,
        telefon: formData.telefon,
        profile: {
          nume_companie: formData.nume_companie,
          punct_de_lucru: formData.punct_de_lucru.filter(Boolean),
        },
      };
      await apiClient.put(`/users/${editUser._id}`, updatedUser); // <-- MODIFICARE
      alert("Datele au fost salvate!");
      setEditUser(null);
      await fetchBeneficiari();
    } catch (err) {
      alert(`Eroare: ${err.response?.data?.message || "Nu s-au putut salva datele."}`);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      alert("Parola trebuie să aibă minim 6 caractere.");
      return;
    }
    try {
      await apiClient.put(`/users/${passwordUser._id}/password`, { newPassword }); // <-- MODIFICARE
      alert("Parola a fost schimbată cu succes!");
      setPasswordUser(null);
      setNewPassword("");
    } catch (err) {
      alert(`Eroare: ${err.response?.data?.message || "Nu s-a putut schimba parola."}`);
    }
  };

  const handleBack = () => {
    setEditUser(null);
    setPasswordUser(null);
  };

  if (loading) return <div className="loading" style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div className="loading error-message" style={{textAlign: 'center', padding: '50px', color: 'red'}}>Eroare: {error}</div>;

  if (passwordUser) {
    return (
      <div className="beneficiari-container edit-form-container">
        <h1>Schimbare Parolă pentru {passwordUser.nume} {passwordUser.prenume}</h1>
        <div className="form-group">
          <label>Parola nouă (minim 6 caractere)</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button className="save-btn" onClick={handleSavePassword}>💾 Salvează parola</button>
        <button className="back-btn" onClick={handleBack}>⬅ Înapoi</button>
      </div>
    );
  }

  if (editUser) {
    return (
      <div className="beneficiari-container edit-form-container">
        <h1>Editare Beneficiar</h1>
        <div className="form-group"><label>Nume contact</label><input name="nume" value={formData.nume} onChange={handleChange} /></div>
        <div className="form-group"><label>Prenume contact</label><input name="prenume" value={formData.prenume} onChange={handleChange} /></div>
        <div className="form-group"><label>Email</label><input name="email" value={formData.email} onChange={handleChange} /></div>
        <div className="form-group"><label>Telefon</label><input name="telefon" value={formData.telefon} onChange={handleChange} /></div>
        <div className="form-group"><label>Nume Companie</label><input name="nume_companie" value={formData.nume_companie} onChange={handleChange} /></div>
        <div className="form-group">
          <label>Puncte de lucru</label>
          {formData.punct_de_lucru.map((punct, index) => (
            <div key={index} style={{ display: "flex", marginBottom: "5px", gap: "5px" }}>
              <input value={punct} onChange={(e) => handlePunctDeLucruChange(index, e.target.value)} style={{ flex: 1 }} />
              <button type="button" onClick={() => removePunctDeLucru(index)} style={{ backgroundColor: "#dc3545", color: "white" }}>❌</button>
            </div>
          ))}
          <button type="button" onClick={addPunctDeLucru}>➕ Adaugă punct de lucru</button>
        </div>
        <button className="save-btn" onClick={handleSave}>💾 Salvează</button>
        <button className="back-btn" onClick={handleBack}>⬅ Înapoi</button>
      </div>
    );
  }

  return (
    <div className="beneficiari-container">
      <h1>Lista Firmelor Colaboratoare</h1>
      <div className="table-responsive">
        <table className="beneficiari-table">
          <thead>
            <tr><th>Nume Contact</th><th>Companie</th><th>Email</th><th>Acțiuni</th></tr>
          </thead>
          <tbody>
            {beneficiari.length > 0 ? (
              beneficiari.map((user) => (
                <tr key={user._id}>
                  <td>{user.nume} {user.prenume}</td>
                  <td>{user.profile?.nume_companie || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                    <button className="edit-btn" onClick={() => handleEdit(user)}>✏️ Editare</button>
                    <button className="edit-btn" style={{ backgroundColor: "#ffc107" }} onClick={() => handleChangePassword(user)}>🔑 Schimbă parola</button>
                    <button className="edit-btn" style={{ backgroundColor: "#dc3545" }} onClick={() => handleDelete(user._id)}>🗑️ Șterge</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: "center" }}>Nu există beneficiari înregistrați.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="back-bottom-btn" onClick={() => navigate(-1)}>⬅ Înapoi</button>
    </div>
  );
}