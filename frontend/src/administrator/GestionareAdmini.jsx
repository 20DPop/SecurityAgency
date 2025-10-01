import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../admin/Angajati.css"; // Refolosim stilurile

export default function GestionareAdmini() {
  const [admini, setAdmini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Preluare admini
  useEffect(() => {
    const fetchAdmini = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        if (!userInfo || !userInfo.token) throw new Error("Utilizator neautentificat!");
        
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:3000/api/users/list/admin", config);
        setAdmini(data);
      } catch (err) {
        setError(err.response?.data?.message || "Eroare la preluarea listei de admini.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmini();
  }, []);

  // Funcția de ștergere
  const handleDelete = async (userId) => {
    if (!window.confirm("Sunteți sigur că doriți să ștergeți acest cont de admin? Acțiunea este ireversibilă.")) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("currentUser"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:3000/api/users/${userId}`, config);

      alert("Cont de admin șters cu succes!");
      // Actualizăm lista locală pentru a reflecta ștergerea
      setAdmini(prev => prev.filter(user => user._id !== userId));
    } catch (err) {
      alert(`❌ Eroare: ${err.response?.data?.message || "Nu s-a putut șterge contul."}`);
      setError(err.response?.data?.message || "Eroare la ștergerea contului.");
    }
  };

  if (loading) return <div className="loading">Se încarcă...</div>;
  if (error) return <div className="loading error-message">{error}</div>;

  return (
    <div className="angajati-container">
      <h1>Gestionare Conturi Admin</h1>
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
            {admini.length > 0 ? (
              admini.map((user) => (
                <tr key={user._id}>
                  <td>{user.nume}</td>
                  <td>{user.prenume}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className="edit-btn"
                      style={{ backgroundColor: "#dc3545" }}
                      onClick={() => handleDelete(user._id)}
                    >
                      🗑️ Șterge
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">Nu există alte conturi de admin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="back-bottom-btn" onClick={() => navigate(-1)}>
        ⬅ Înapoi
      </button>
    </div>
  );
}