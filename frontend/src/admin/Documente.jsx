// Cale: frontend/src/admin/Documente.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Documente.css";
import { useNavigate } from "react-router-dom";

export default function Documente() {
  const [documente, setDocumente] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocumente = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        // 🔹 Preluăm toate tipurile de documente
        const [predareRes, interventieRes, rapoarteRes] = await Promise.all([
          axios.get("http://localhost:3000/api/proces-verbal-predare/documente", config),
          axios.get("http://localhost:3000/api/proces-verbal/documente", config),
          axios.get("http://localhost:3000/api/raport-eveniment/documente", config)
        ]);

        // Adăugăm un câmp "tip" pentru diferențiere
        const predareDocs = predareRes.data.map(doc => ({ ...doc, tip: "Predare-Primire" }));
        const interventieDocs = interventieRes.data.map(doc => ({ ...doc, tip: "Intervenție" }));
        const rapoarteDocs = rapoarteRes.data.map(doc => ({ ...doc, tip: "Raport Eveniment" }));

        setDocumente([...predareDocs, ...interventieDocs, ...rapoarteDocs]);
      } catch (err) {
        console.error("Eroare la preluarea documentelor:", err);
        setMessage("❌ Nu s-au putut încărca documentele.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumente();
  }, []);

  // Filtrare după nume (include toate tipurile de documente)
  const filteredDocumente = documente.filter((doc) => {
    const nume =
      doc.nume_reprezentant_primire || 
      doc.reprezentant_beneficiar || 
      doc.numePaznic || "";
    return nume.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="admin-dashboard">
      <main>
        <h1 className="page-title">Documente</h1>

        {/* 🔎 Bara de căutare */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Caută după nume..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading && <p>Se încarcă documentele...</p>}
        {message && <p>{message}</p>}
        {!loading && filteredDocumente.length === 0 && <p>Nu există documente disponibile.</p>}

        {!loading && filteredDocumente.length > 0 && (
          <table className="documente-table">
            <thead>
              <tr>
                <th>Tip Document</th>
                <th>Nume / Reprezentant</th>
                <th>Data</th>
                <th>Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocumente.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.tip}</td>
                  <td>{doc.nume_reprezentant_primire || doc.reprezentant_beneficiar || doc.numePaznic || "N/A"}</td>
                  <td>
                    {doc.data_incheierii || doc.dataRaport
                      ? new Date(doc.data_incheierii || doc.dataRaport).toLocaleDateString()
                      : new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <a
                      href={`http://localhost:3000${doc.caleStocarePDF}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Deschide PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          style={{ position: "fixed", bottom: 20, left: 20 }}
          onClick={() => navigate(-1)}
        >
          ⬅ Înapoi
        </button>
      </main>
    </div>
  );
}
