// Cale: src/documente/ProcesVerbal.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProcesVerbal.css'; // Vom crea acest fișier CSS imediat

export default function ProcesVerbal() {
  const { pontajId } = useParams(); // Preluăm ID-ul pontajului din URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reprezentant_beneficiar: '',
    ora_declansare_alarma: '',
    ora_prezentare_echipaj: '',
    ora_incheiere_misiune: '',
    observatii_generale: "In timpul interventiei echipajul de interventie a actionat conform procedurilor in vigoare, neexistand observatii din partea beneficiarului privind calitatea prestatiei.",
    evenimente: [ // Începem cu un rând gol în tabel
      { 
        dataOraReceptionarii: '', 
        tipulAlarmei: '', 
        echipajAlarmat: '', 
        oraSosirii: '', 
        cauzeleAlarmei: '', 
        modulDeSolutionare: '', 
        observatii: '' 
      }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Handler pentru câmpurile simple (nu cele din tabel)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler special pentru câmpurile DIN TABEL
  const handleEventChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEvenimente = [...formData.evenimente];
    updatedEvenimente[index][name] = value;
    setFormData(prev => ({ ...prev, evenimente: updatedEvenimente }));
  };

  // Funcție pentru a adăuga un rând nou în tabel
  const handleAddRow = () => {
    setFormData(prev => ({
      ...prev,
      evenimente: [
        ...prev.evenimente,
        { dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' }
      ]
    }));
  };
  
  // Funcție pentru a șterge un rând din tabel
  const handleRemoveRow = (index) => {
    const updatedEvenimente = formData.evenimente.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, evenimente: updatedEvenimente }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('currentUser'));
      if (!userInfo || !userInfo.token) {
        throw new Error("Utilizator neautentificat!");
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(`http://localhost:3000/api/proces-verbal/${pontajId}`, formData, config);

      alert('✅ Proces verbal salvat și PDF generat cu succes!');
      navigate('/'); // Redirecționăm către dashboard după succes

    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare la salvarea documentului.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pv-container">
      <h1>Completare Proces Verbal</h1>
      <form onSubmit={handleSubmit} className="pv-form">
        
        {/* --- Secțiunea 1: Detalii Generale --- */}
        <fieldset>
          <legend>Detalii Intervenție</legend>
          <div className="form-grid">
            <div className="form-group">
              <label>Ora declanșare alarmă</label>
              <input type="datetime-local" name="ora_declansare_alarma" value={formData.ora_declansare_alarma} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Ora prezentare echipaj</label>
              <input type="datetime-local" name="ora_prezentare_echipaj" value={formData.ora_prezentare_echipaj} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Ora încheiere misiune</label>
              <input type="datetime-local" name="ora_incheiere_misiune" value={formData.ora_incheiere_misiune} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Reprezentant Beneficiar (Opțional)</label>
              <input type="text" name="reprezentant_beneficiar" value={formData.reprezentant_beneficiar} onChange={handleChange} placeholder="Numele persoanei" />
            </div>
          </div>
           <div className="form-group">
              <label>Observații Generale</label>
              <textarea name="observatii_generale" value={formData.observatii_generale} onChange={handleChange} rows="4"></textarea>
            </div>
        </fieldset>

        {/* --- Secțiunea 2: Tabelul Dinamic de Evenimente --- */}
        <fieldset>
          <legend>Tabel Evenimente</legend>
          {formData.evenimente.map((event, index) => (
            <div key={index} className="event-row">
              <span className="event-row-number">{index + 1}.</span>
              <div className="event-grid">
                <input type="datetime-local" name="dataOraReceptionarii" value={event.dataOraReceptionarii} onChange={(e) => handleEventChange(index, e)} placeholder="Data/Ora Rec." required title="Data și Ora Recepționării"/>
                <input type="text" name="tipulAlarmei" value={event.tipulAlarmei} onChange={(e) => handleEventChange(index, e)} placeholder="Tipul alarmei" required />
                <input type="text" name="echipajAlarmat" value={event.echipajAlarmat} onChange={(e) => handleEventChange(index, e)} placeholder="Echipaj alarmat" required />
                <input type="datetime-local" name="oraSosirii" value={event.oraSosirii} onChange={(e) => handleEventChange(index, e)} placeholder="Ora sosirii" required title="Ora Sosirii"/>
                <input type="text" name="cauzeleAlarmei" value={event.cauzeleAlarmei} onChange={(e) => handleEventChange(index, e)} placeholder="Cauzele alarmei" required />
                <input type="text" name="modulDeSolutionare" value={event.modulDeSolutionare} onChange={(e) => handleEventChange(index, e)} placeholder="Mod de soluționare" required />
                <input type="text" name="observatii" value={event.observatii} onChange={(e) => handleEventChange(index, e)} placeholder="Observații (opțional)" />
              </div>
              <button type="button" className="remove-row-btn" onClick={() => handleRemoveRow(index)}>Șterge</button>
            </div>
          ))}
          <button type="button" className="add-row-btn" onClick={handleAddRow}>+ Adaugă Rând</button>
        </fieldset>
        
        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="button" className="back-btn" onClick={() => navigate('/')}>Anulează</button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Se salvează...' : 'Salvează și Generează PDF'}
          </button>
        </div>
      </form>
    </div>
  );
}