// // frontend/src/pages/Beneficiar/AngajatBDetalii.jsx
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./AngajatBDetalii.css";

// export default function AngajatBDetalii() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [angajat, setAngajat] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchAngajat = async () => {
//       try {
//         const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//         if (!token) {
//           setError("Nu ești autentificat.");
//           setLoading(false);
//           return;
//         }
//         const res = await axios.get(`http://localhost:3000/api/users/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setAngajat(res.data);
//       } catch (err) {
//         console.error("Eroare la încărcarea detaliilor angajatului:", err.response?.data?.message || err.message);
//         setError(err.response?.data?.message || "Eroare la încărcarea detaliilor angajatului.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAngajat();
//   }, [id]);

//   if (loading) return <p>Se încarcă...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;
//   if (!angajat) return <p>Nu s-au găsit detalii pentru acest angajat.</p>;

//   return (
//     <div className="angajatB-detalii">
//       <h1>Detalii angajat</h1>
//       <div className="detalii-box">
//         <p><strong>Nume:</strong> {angajat.nume}</p>
//         <p><strong>Prenume:</strong> {angajat.prenume}</p>
//         <p><strong>Email:</strong> {angajat.email}</p>
//         <p><strong>Telefon:</strong> {angajat.telefon || 'N/A'}</p>
//         <p><strong>Nr. legitimație:</strong> {angajat.profile?.nr_legitimatie || 'N/A'}</p>
//         <p><strong>Punct de lucru:</strong> {angajat.profile?.punct_de_lucru || 'N/A'}</p>
//       </div>

//       <button className="back-btn" onClick={() => navigate(-1)}>Înapoi</button>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AngajatBDetalii.css";

export default function AngajatBDetalii() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [angajat, setAngajat] = useState(null);
  const [punctLucru, setPunctLucru] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAngajat = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
        if (!token) {
          setError("Nu ești autentificat.");
          setLoading(false);
          return;
        }

        // 1. Obții angajatul
        const res = await axios.get(`http://localhost:3000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAngajat(res.data);

        // 2. Obții beneficiarul curent
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const beneficiarRes = await axios.get(`http://localhost:3000/api/users/${currentUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const beneficiar = beneficiarRes.data;

        // 3. Caută punctul la care angajatul este alocat
        const punct = (beneficiar.profile.assignedPaznici || [])
          .find(p => p.paznici.map(pid => pid.toString()).includes(id));

        setPunctLucru(punct ? punct.punct : "N/A");
      } catch (err) {
        console.error("Eroare la încărcarea detaliilor angajatului:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Eroare la încărcarea detaliilor angajatului.");
      } finally {
        setLoading(false);
      }
    };
    fetchAngajat();
  }, [id]);

  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!angajat) return <p>Nu s-au găsit detalii pentru acest angajat.</p>;

  return (
    <div className="angajatB-detalii">
      <h1>Detalii angajat</h1>
      <div className="detalii-box">
        <p><strong>Nume:</strong> {angajat.nume}</p>
        <p><strong>Prenume:</strong> {angajat.prenume}</p>
        <p><strong>Email:</strong> {angajat.email}</p>
        <p><strong>Telefon:</strong> {angajat.telefon || 'N/A'}</p>
        <p><strong>Punct de lucru:</strong> {punctLucru}</p>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>Înapoi</button>
    </div>
  );
}

