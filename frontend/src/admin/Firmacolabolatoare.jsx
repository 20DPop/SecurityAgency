// import React, { useEffect, useState } from "react";
// import "./Firmacolabolatoare.css";
// import axios from "axios";

// export default function Firmacolabolatoare() {
//   const [firme, setFirme] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [editFirma, setEditFirma] = useState(null);
//   const [formData, setFormData] = useState({
//     numeFirma: "",
//     adresa: "",
//     telefon: "",
//     email: ""
//   });

//   // Preluare firme colaboratoare
//   useEffect(() => {
//     const fetchFirme = async () => {
//       try {
//         const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//         if (!token) throw new Error("Utilizator neautentificat!");

//         const res = await axios.get("http://localhost:3000/api/firme", {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         setFirme(res.data);
//       } catch (err) {
//         console.error(err);
//         setError("Eroare la preluarea firmelor.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFirme();
//   }, []);

//   const handleEdit = (firma) => {
//     setEditFirma(firma);
//     setFormData({
//       numeFirma: firma.numeFirma,
//       adresa: firma.adresa,
//       telefon: firma.telefon,
//       email: firma.email
//     });
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = async () => {
//     try {
//       const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
//       if (!token) throw new Error("Utilizator neautentificat!");

//       await axios.put(`http://localhost:3000/api/firme/${editFirma._id}`, formData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       alert("Datele firmei au fost salvate!");
//       setEditFirma(null);

//       // Reîncarcă lista
//       const res = await axios.get("http://localhost:3000/api/firme", {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setFirme(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Eroare la salvarea firmei.");
//     }
//   };

//   const handleBack = () => setEditFirma(null);

//   if (loading) return <div className="loading">Se încarcă firmele colaboratoare...</div>;
//   if (error) return <div className="loading">Eroare: {error}</div>;

//   if (!editFirma) {
//     return (
//       <div className="firme-container">
//         <h1>Firme Colaboratoare</h1>
//         <div className="table-responsive">
//           <table className="firme-table">
//             <thead>
//               <tr>
//                 <th>Nume Firmă</th>
//                 <th>Adresă</th>
//                 <th>Telefon</th>
//                 <th>Email</th>
//                 <th>Acțiuni</th>
//               </tr>
//             </thead>
//             <tbody>
//               {firme.length > 0 ? (
//                 firme.map((firma) => (
//                   <tr key={firma._id}>
//                     <td>{firma.numeFirma}</td>
//                     <td>{firma.adresa}</td>
//                     <td>{firma.telefon}</td>
//                     <td>{firma.email}</td>
//                     <td>
//                       <button className="edit-btn" onClick={() => handleEdit(firma)}>✏️ Editare</button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" style={{ textAlign: "center" }}>Nu există firme colaboratoare.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         <button className="back-bottom-btn" onClick={() => window.history.back()}>⬅ Înapoi</button>
//       </div>
//     );
//   }

//   return (
//     <div className="firme-container edit-form-container">
//       <h1>Editare Firmă Colaboratoare</h1>
//       <div className="form-group">
//         <label>Nume Firmă</label>
//         <input name="numeFirma" value={formData.numeFirma} onChange={handleChange} />
//       </div>
//       <div className="form-group">
//         <label>Adresă</label>
//         <input name="adresa" value={formData.adresa} onChange={handleChange} />
//       </div>
//       <div className="form-group">
//         <label>Telefon</label>
//         <input name="telefon" value={formData.telefon} onChange={handleChange} />
//       </div>
//       <div className="form-group">
//         <label>Email</label>
//         <input name="email" value={formData.email} onChange={handleChange} />
//       </div>

//       <button className="save-btn" onClick={handleSave}>💾 Salvează</button>
//       <button className="back-btn" onClick={handleBack}>⬅ Înapoi</button>
//     </div>
//   );
// // 
