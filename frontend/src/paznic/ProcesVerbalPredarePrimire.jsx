import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import './ProcesVerbalPredarePrimire.css';

export default function ProcesVerbalPredarePrimire() {
  const navigate = useNavigate();
  const { pontajId } = useParams();

  const [formData, setFormData] = useState({
    data_incheierii: new Date().toISOString().slice(0, 16),
    nume_sef_formatie: '',
    nume_reprezentant_primire: '',
    obiecte_predate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData, pontajId };
      // <-- MODIFICARE: Folosim apiClient
      await apiClient.post('/proces-verbal-predare/create', payload);

      alert('✅ Proces verbal de predare-primire salvat cu succes!');
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare la salvare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pv-predare-container">
      <form onSubmit={handleSubmit} className="pv-predare-form">
        <h2>Proces Verbal de Predare-Primire</h2>
        <div className="form-group">
          <label htmlFor="data_incheierii">Data și Ora Încheierii</label>
          <input id="data_incheierii" type="datetime-local" name="data_incheierii" value={formData.data_incheierii} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="nume_sef_formatie">Nume Reprezentant Predare (Dvs.)</label>
          <input id="nume_sef_formatie" type="text" name="nume_sef_formatie" value={formData.nume_sef_formatie} onChange={handleChange} placeholder="Ex: Popescu Ion" required />
        </div>
        <div className="form-group">
          <label htmlFor="nume_reprezentant_primire">Nume Reprezentant Firma Beneficiar</label>
          <input id="nume_reprezentant_primire" type="text" name="nume_reprezentant_primire" value={formData.nume_reprezentant_primire} onChange={handleChange} placeholder="Ex: Ionescu Vasile" required />
        </div>
        <div className="form-group">
          <label htmlFor="obiecte_predate">Obiecte / Sarcini / Observații Predate</label>
          <textarea id="obiecte_predate" name="obiecte_predate" value={formData.obiecte_predate} onChange={handleChange} rows="6" placeholder="Descrieți pe scurt..." required></textarea>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} disabled={loading}>Înapoi</button>
          <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Se salvează...' : 'Salvează Proces Verbal'}</button>
        </div>
      </form>
    </div>
  );
}