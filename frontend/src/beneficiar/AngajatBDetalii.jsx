import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import "./AngajatBDetalii.css";

export default function AngajatBDetalii() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [angajat, setAngajat] = useState(null);
  const [punctLucru, setPunctLucru] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetalii = async () => {
      setLoading(true);
      setError('');
      try {
        // Obținem simultan detaliile angajatului și ale beneficiarului logat
        const [angajatRes, beneficiarRes] = await Promise.all([
          apiClient.get(`/users/${id}`),
          apiClient.get('/users/profile') // Ruta pentru profilul utilizatorului curent
        ]);

        const angajatData = angajatRes.data;
        const beneficiarData = beneficiarRes.data;
        
        setAngajat(angajatData);

        // Căutăm punctul de lucru în care este alocat angajatul
        const punctGasit = (beneficiarData.profile.assignedPaznici || [])
          .find(p => p.paznici.includes(id));
          
        setPunctLucru(punctGasit ? punctGasit.punct : "Nespecificat");
      } catch (err) {
        setError(err.response?.data?.message || "Eroare la încărcarea detaliilor.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetalii();
  }, [id]);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>{error}</div>;

  return (
    <div className="angajatB-detalii">
      <h1>Detalii Angajat</h1>
      
      {angajat ? (
        <div className="detalii-box">
          <p><strong>Nume:</strong> {angajat.nume}</p>
          <p><strong>Prenume:</strong> {angajat.prenume}</p>
          <p><strong>Email:</strong> {angajat.email}</p>
          <p><strong>Telefon:</strong> {angajat.telefon || 'N/A'}</p>
          <p><strong>Punct de lucru:</strong> {punctLucru}</p>
        </div>
      ) : (
        <p>Nu s-au găsit detalii pentru acest angajat.</p>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>Înapoi</button>
    </div>
  );
}