import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./Documente.css";

export default function Documente() {
  const [documente, setDocumente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 
  const navigate = useNavigate();

  // <-- MODIFICARE: Preluăm URL-ul de bază din variabilele de mediu
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchDocumente = async () => {
      setLoading(true);
      try {
        // <-- MODIFICARE: Folosim apiClient pentru toate cererile
        const [predareRes, interventieRes, rapoarteRes] = await Promise.all([
          apiClient.get("/proces-verbal-predare/documente"),
          apiClient.get("/proces-verbal/documente"),
          apiClient.get("/raport-eveniment/documente")
        ]);

        const predareDocs = predareRes.data.map(doc => ({ ...doc, tip: "Predare-Primire" }));
        const interventieDocs = interventieRes.data.map(doc => ({ ...doc, tip: "Intervenție" }));
        const rapoarteDocs = rapoarteRes.data.map(doc => ({ ...doc, tip: "Raport Eveniment" }));

        const allDocs = [...predareDocs, ...interventieDocs, ...rapoarteDocs];
        // Sortăm documentele după data creării, cele mai noi primele
        allDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDocumente(allDocs);

      } catch (err) {
        console.error("Eroare la preluarea documentelor:", err);
        setMessage("❌ Nu s-au putut încărca documentele.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumente();
  }, []);

  const filteredDocumente = documente.filter((doc) => {
    const nume = doc.nume_reprezentant_primire || doc.reprezentant_beneficiar || doc.numePaznic || "";
    return nume.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <main style={{padding: '20px'}}>
      <h1 className="page-title">Documente Generate</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Caută după nume reprezentant/paznic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <p style={{textAlign: 'center'}}>Se încarcă documentele...</p>}
      {message && <p style={{textAlign: 'center', color: 'red'}}>{message}</p>}
      
      {!loading && filteredDocumente.length === 0 && 
        <p style={{textAlign: 'center'}}>Nu există documente disponibile care să corespundă căutării.</p>
      }

      {!loading && filteredDocumente.length > 0 && (
        <div className="table-responsive">
          <table className="documente-table">
            <thead>
              <tr>
                <th>Tip Document</th>
                <th>Nume / Reprezentant</th>
                <th>Data Creare</th>
                <th>Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocumente.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.tip}</td>
                  <td>{doc.nume_reprezentant_primire || doc.reprezentant_beneficiar || doc.numePaznic || "N/A"}</td>
                  <td>{new Date(doc.createdAt).toLocaleString('ro-RO')}</td>
                  <td>
                    {/* <-- MODIFICARE: Construim link-ul dinamic */}
                    <a href={`${apiBaseUrl}${doc.caleStocarePDF}`} target="_blank" rel="noopener noreferrer">
                      Deschide PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button style={{ position: "fixed", bottom: 20, left: 20 }} onClick={() => navigate(-1)}>
        ⬅ Înapoi
      </button>
    </main>
  );
}