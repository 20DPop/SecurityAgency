import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient
import './ProcesVerbal.css';
import SignaturePadWrapper from '../components/SignaturePad';

export default function ProcesVerbal() {
  const navigate = useNavigate();
  const { pontajId } = useParams(); // Preluăm ID-ul pontajului din URL, dacă e necesar
  
  const [formData, setFormData] = useState({
    reprezentant_beneficiar: '',
    ora_declansare_alarma: '',
    ora_prezentare_echipaj: '',
    ora_incheiere_misiune: '',
    evenimente: [
      { 
        dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', 
        oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' 
      }
    ],
    agentSignatureDataURL: '',
    beneficiarySignatureDataURL: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signaturesSaved, setSignaturesSaved] = useState({
    agent: false,
    beneficiary: false
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleEventChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEvenimente = [...formData.evenimente];
    updatedEvenimente[index][name] = value;
    setFormData(prev => ({ ...prev, evenimente: updatedEvenimente }));
  };
  
  const handleAddRow = () => {
    setFormData(prev => ({
      ...prev,
      evenimente: [
        ...prev.evenimente,
        { dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' }
      ]
    }));
  };
  
  const handleRemoveRow = (index) => {
    if (formData.evenimente.length <= 1) return; 
    const updatedEvenimente = formData.evenimente.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, evenimente: updatedEvenimente }));
  };

  const handleSaveAgentSignature = (signature) => {
    setFormData(prev => ({ ...prev, agentSignatureDataURL: signature }));
    setSignaturesSaved(prev => ({ ...prev, agent: true }));
    alert('Semnătura agentului a fost salvată.');
  };

  const handleSaveBeneficiarySignature = (signature) => {
    setFormData(prev => ({ ...prev, beneficiarySignatureDataURL: signature }));
    setSignaturesSaved(prev => ({ ...prev, beneficiary: true }));
    alert('Semnătura beneficiarului a fost salvată.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!signaturesSaved.agent || !signaturesSaved.beneficiary) {
      setError('EROARE: Atât agentul, cât și beneficiarul trebuie să semneze documentul.');
      return;
    }
    
    setLoading(true);

    try {
      // <-- MODIFICARE: Folosim apiClient, care se ocupă de token și URL
      await apiClient.post(`/proces-verbal/create`, formData);
      
      alert('✅ Proces verbal salvat și PDF generat cu succes!');
      navigate('/'); // Redirecționăm la dashboard-ul paznicului
    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare la salvarea documentului.');
    } finally {
      setLoading(false);
    }
  };

  const areAllSignaturesSaved = signaturesSaved.agent && signaturesSaved.beneficiary;

  return (
    <div className="pv-container">
      <h1>Completare Proces Verbal de Intervenție</h1>
      <p className="pv-subtitle">Documentul va fi generat automat pe baza datelor introduse.</p>
      
      <form onSubmit={handleSubmit} className="pv-form">
        <fieldset disabled={areAllSignaturesSaved}>
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
                  <label htmlFor="reprezentant_beneficiar">Nume Reprezentant Beneficiar</label>
                  <input id="reprezentant_beneficiar" type="text" name="reprezentant_beneficiar" value={formData.reprezentant_beneficiar} onChange={handleChange} placeholder="Ex: Popescu Ion" />
                </div>
            </div>
        </fieldset>

        <fieldset disabled={areAllSignaturesSaved}>
            <legend>Tabel Evenimente Detaliate</legend>
            <p className="fieldset-description">Completați un rând pentru fiecare eveniment important.</p>
            {formData.evenimente.map((event, index) => (
              <div key={index} className="event-row">
                <span className="event-row-number">{index + 1}.</span>
                <div className="event-grid">
                  <input type="datetime-local" name="dataOraReceptionarii" value={event.dataOraReceptionarii} onChange={(e) => handleEventChange(index, e)} required title="Data și Ora Recepționării"/>
                  <input type="text" name="tipulAlarmei" value={event.tipulAlarmei} onChange={(e) => handleEventChange(index, e)} placeholder="Tipul alarmei" required />
                  <input type="text" name="echipajAlarmat" value={event.echipajAlarmat} onChange={(e) => handleEventChange(index, e)} placeholder="Echipaj alarmat" required />
                  <input type="datetime-local" name="oraSosirii" value={event.oraSosirii} onChange={(e) => handleEventChange(index, e)} required title="Ora Sosirii"/>
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
        
        <div className="signatures-grid">
            <fieldset>
                <legend>Semnătură Agent Intervenție</legend>
                {!signaturesSaved.agent ? (
                    <SignaturePadWrapper onSave={handleSaveAgentSignature} />
                ) : (
                    <div className="signature-display">
                        <p className="signature-saved-text">✓ Semnat</p>
                        <img src={formData.agentSignatureDataURL} alt="Semnatura Agent" className="signature-image" />
                    </div>
                )}
            </fieldset>

            <fieldset>
                <legend>Semnătură Beneficiar</legend>
                {!signaturesSaved.beneficiary ? (
                    <SignaturePadWrapper onSave={handleSaveBeneficiarySignature} />
                ) : (
                    <div className="signature-display">
                        <p className="signature-saved-text">✓ Semnat</p>
                        <img src={formData.beneficiarySignatureDataURL} alt="Semnatura Beneficiar" className="signature-image" />
                    </div>
                )}
            </fieldset>
        </div>
        
        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
            <button type="button" className="back-btn" onClick={() => navigate(-1)} disabled={loading}>Anulează</button>
            <button type="submit" className="submit-btn" disabled={loading || !areAllSignaturesSaved}>
              {loading ? 'Se salvează...' : 'Salvează și Generează PDF'}
            </button>
        </div>
      </form>
    </div>
  );
}