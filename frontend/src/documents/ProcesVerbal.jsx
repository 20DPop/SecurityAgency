// Cale: frontend/src/documente/ProcesVerbal.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProcesVerbal.css';

export default function ProcesVerbal() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    reprezentant_beneficiar: '',
    ora_declansare_alarma: '',
    ora_prezentare_echipaj: '',
    ora_incheiere_misiune: '',
    evenimente: [
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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleEventChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEvenimente = [...formData.evenimente];
    updatedEvenimente[index][name] = value;
    setFormData(prev => ({ ...prev, evenimente: updatedEvenimente }));
  };
  
  // 🔥 AICI ESTE CORECȚIA
  const handleAddRow = () => {
    setFormData(prev => ({
      ...prev,
      evenimente: [
        ...prev.evenimente, // ✅ CORECT: Copiem doar array-ul de evenimente anterior
        { dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' }
      ]
    }));
  };
  
  const handleRemoveRow = (index) => {
    // Prevenim ștergerea ultimului rând pentru a avea mereu cel puțin unul
    if (formData.evenimente.length <= 1) return; 
    const updatedEvenimente = formData.evenimente.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, evenimente: updatedEvenimente }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('currentUser'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.post(`http://localhost:3000/api/proces-verbal/create`, formData, config);
      
      alert('✅ Proces verbal salvat și PDF generat cu succes!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare la salvarea documentului.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pv-container">
      <h1>Completare Proces Verbal</h1>
      <p className="pv-subtitle">Documentul va fi generat automat pe baza datelor introduse.</p>
      
      <form onSubmit={handleSubmit} className="pv-form">
        <fieldset>
          <legend>Detalii Principale Intervenție</legend>
          <div className="form-grid">
             <div className="form-group">
                <label htmlFor="ora_declansare_alarma">Alarma declanșată la ora</label>
                <input id="ora_declansare_alarma" type="datetime-local" name="ora_declansare_alarma" value={formData.ora_declansare_alarma} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="ora_prezentare_echipaj">Echipaj prezent la ora</label>
                <input id="ora_prezentare_echipaj" type="datetime-local" name="ora_prezentare_echipaj" value={formData.ora_prezentare_echipaj} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="ora_incheiere_misiune">Misiune încheiată la ora</label>
                <input id="ora_incheiere_misiune" type="datetime-local" name="ora_incheiere_misiune" value={formData.ora_incheiere_misiune} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="reprezentant_beneficiar">Nume Reprezentant Beneficiar (Opțional)</label>
                <input id="reprezentant_beneficiar" type="text" name="reprezentant_beneficiar" value={formData.reprezentant_beneficiar} onChange={handleChange} placeholder="Ex: Popescu Ion" />
              </div>
          </div>
        </fieldset>

        <fieldset>
            <legend>Tabel Evenimente Detaliate</legend>
            <p className="fieldset-description">Completați un rând pentru fiecare eveniment important petrecut în timpul intervenției.</p>
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
                {formData.evenimente.length > 1 && (
                  <button type="button" className="remove-row-btn" onClick={() => handleRemoveRow(index)}>Șterge</button>
                )}
              </div>
            ))}
            <button type="button" className="add-row-btn" onClick={handleAddRow}>+ Adaugă Rând</button>
        </fieldset>
        
        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
            <button type="button" className="back-btn" onClick={() => navigate(-1)}>Anulează</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Se salvează...' : 'Salvează și Generează PDF'}
            </button>
        </div>
      </form>
    </div>
  );
}