// frontend/src/admin/Documente.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../apiClient';
import "./Documente.css";

export default function Documente() {
  const [documente, setDocumente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 
  const navigate = useNavigate();

  // --- MODIFICARE APLICATĂ AICI ---
  // Adăugăm un fallback `|| ''` pentru a preveni `undefined` în URL.
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  // --- SFÂRȘIT MODIFICARE ---

  useEffect(() => {
    const fetchDocumente = async () => {
      setLoading(true);
      setMessage("");
      try {
        const [predareRes, interventieRes, rapoarteRes] = await Promise.all([
          apiClient.get("/proces-verbal-predare/documente"),
          apiClient.get("/proces-verbal/documente"),
          apiClient.get("/raport-eveniment/documente")
        ]);

        const predareDocs = predareRes.data.map(doc => ({ ...doc, tip: "Predare-Primire" }));
        const interventieDocs = interventieRes.data.map(doc => ({ ...doc, tip: "Intervenție" }));
        const rapoarteDocs = rapoarteRes.data.map(doc => ({ ...doc, tip: "Raport Eveniment" }));

        const allDocs = [...predareDocs, ...interventieDocs, ...rapoarteDocs];
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

  const getNumeRelevant = (doc) => {
    switch (doc.tip) {
      case "Predare-Primire":
        return doc.paznicPredareId ? `${doc.paznicPredareId.nume} ${doc.paznicPredareId.prenume}` : "N/A";
      case "Intervenție":
        return doc.beneficiaryId?.profile?.nume_companie || "N/A";
      case "Raport Eveniment":
        return doc.paznicId ? `${doc.paznicId.nume} ${doc.paznicId.prenume}` : "N/A";
      default:
        return "N/A";
    }
  };

  const filteredDocumente = documente.filter((doc) => {
    const nume = getNumeRelevant(doc);
    return nume.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <main style={{padding: '20px'}}>
      <h1 className="page-title">Documente Generate</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Caută după nume sau companie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <p style={{textAlign: 'center'}}>Se încarcă documentele...</p>}
      {message && <p style={{textAlign: 'center', color: 'red'}}>{message}</p>}
      
      {!loading && !message && filteredDocumente.length === 0 && 
        <p style={{textAlign: 'center'}}>Nu există documente disponibile care să corespundă căutării.</p>
      }

      {!loading && filteredDocumente.length > 0 && (
        <div className="table-responsive">
          <table className="documente-table">
            <thead>
              <tr>
                <th>Tip Document</th>
                <th>Nume / Companie</th>
                <th>Data Creare</th>
                <th>Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocumente.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.tip}</td>
                  <td>{getNumeRelevant(doc)}</td>
                  <td>{new Date(doc.createdAt).toLocaleString('ro-RO')}</td>
                  <td>
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