// frontend/src/paznic/RaportEveniment.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import './RaportEveniment.css';
import SignaturePadWrapper from '../components/SignaturePad';

export default function RaportEveniment() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    numarRaport: '',
    dataRaport: new Date().toISOString().split('T')[0],
    functiePaznic: 'Agent Securitate',
    beneficiaryId: '',
    punctDeLucru: '',
    numarPost: '', // Câmpul text pentru PDF
    dataConstatare: new Date().toISOString().split('T')[0],
    oraConstatare: new Date().toTimeString().slice(0, 5),
    numeFaptuitor: '',
    descriereFapta: '',
    cazSesizatLa: '',
    signatureDataURL: '', 
  });
  
  const [beneficiariCuPuncte, setBeneficiariCuPuncte] = useState([]);
  const [puncteFiltrate, setPuncteFiltrate] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signatureSaved, setSignatureSaved] = useState(false);

  useEffect(() => {
    const fetchAssignedData = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/posts/my-assigned-workpoints');
        setBeneficiariCuPuncte(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Nu s-au putut încărca datele de alocare.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedData();
  }, []);

  const handleBeneficiarChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, beneficiaryId: selectedId, punctDeLucru: '' }));
    
    const beneficiarSelectat = beneficiariCuPuncte.find(b => b.beneficiarId === selectedId);
    setPuncteFiltrate(beneficiarSelectat ? beneficiarSelectat.puncteDeLucru : []);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSignature = (signature) => {
    setFormData(prev => ({ ...prev, signatureDataURL: signature }));
    setSignatureSaved(true);
    alert('Semnătura a fost salvată.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.beneficiaryId || !formData.punctDeLucru) {
      setError('EROARE: Trebuie să selectați un beneficiar și un punct de lucru.');
      return;
    }
    if (!formData.numarPost.trim()) {
        setError('EROARE: Trebuie să completați câmpul "La postul Nr."');
        return;
    }
    if (!formData.signatureDataURL) {
      setError('EROARE: Raportul trebuie semnat.');
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post('/raport-eveniment/create', formData);
      alert('✅ Raport de eveniment salvat cu succes!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'A apărut o eroare la salvare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h2>Completare Raport de Eveniment</h2>
        {error && <p className="error-message">{error}</p>}
        
        <fieldset disabled={signatureSaved}>
            <div className="form-grid-2-cols">
                <div className="form-group">
                    <label htmlFor="beneficiaryId">Selectează Beneficiarul</label>
                    <select id="beneficiaryId" name="beneficiaryId" value={formData.beneficiaryId} onChange={handleBeneficiarChange} required disabled={loading}>
                        <option value="">-- Alege o firmă --</option>
                        {beneficiariCuPuncte.map(b => (
                            <option key={b.beneficiarId} value={b.beneficiarId}>{b.numeCompanie}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="punctDeLucru">Selectează Punctul de Lucru</label>
                    <select id="punctDeLucru" name="punctDeLucru" value={formData.punctDeLucru} onChange={handleChange} required disabled={!formData.beneficiaryId}>
                        <option value="">-- Alege un punct --</option>
                        {puncteFiltrate.map((p, index) => (
                            <option key={index} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>
            <hr/>
            
            <div className="form-grid-2-cols">
              <div className="form-group"><label htmlFor="numarRaport">Nr. Raport</label><input id="numarRaport" type="text" name="numarRaport" value={formData.numarRaport} onChange={handleChange} /></div>
              <div className="form-group"><label htmlFor="dataRaport">Data Raportului</label><input id="dataRaport" type="date" name="dataRaport" value={formData.dataRaport} onChange={handleChange} required /></div>
            </div>

            <div className="form-grid-2-cols">
                <div className="form-group"><label htmlFor="functiePaznic">În calitate de</label><input id="functiePaznic" type="text" name="functiePaznic" value={formData.functiePaznic} onChange={handleChange} required /></div>
                <div className="form-group">
                    <label htmlFor="numarPost">La postul Nr.</label>
                    <input id="numarPost" type="text" name="numarPost" value={formData.numarPost} onChange={handleChange} required placeholder="Ex: P2, Poarta Nord, etc." />
                </div>
            </div>
            
            <h4>Am constatat că:</h4>
            <div className="form-grid-3-cols">
                <div className="form-group"><label htmlFor="dataConstatare">Data</label><input id="dataConstatare" type="date" name="dataConstatare" value={formData.dataConstatare} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="oraConstatare">Ora</label><input id="oraConstatare" type="time" name="oraConstatare" value={formData.oraConstatare} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="numeFaptuitor">Numitul</label><input id="numeFaptuitor" type="text" name="numeFaptuitor" value={formData.numeFaptuitor} onChange={handleChange} required /></div>
            </div>
            <div className="form-group"><label htmlFor="descriereFapta">A fost surprins în timp ce:</label><textarea id="descriereFapta" name="descriereFapta" value={formData.descriereFapta} onChange={handleChange} rows="8" required></textarea></div>
            <div className="form-group"><label htmlFor="cazSesizatLa">Cazul a fost sesizat la:</label><input id="cazSesizatLa" type="text" name="cazSesizatLa" value={formData.cazSesizatLa} onChange={handleChange} required /></div>
        </fieldset>
        
        <fieldset>
            <legend>Semnătură</legend>
            {!signatureSaved ? ( <SignaturePadWrapper onSave={handleSaveSignature} /> ) : (
                <div><p style={{color: 'green', fontWeight: 'bold'}}>✓ Semnat</p><img src={formData.signatureDataURL} alt="Semnatura" style={{border: '1px solid #ccc', borderRadius: '5px', maxWidth: '250px'}} /></div>
            )}
        </fieldset>
        
        <div className="form-actions">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} disabled={loading}>Înapoi</button>
          <button type="submit" className="submit-btn" disabled={loading || !signatureSaved}>
            {loading ? 'Se salvează...' : 'Salvează Raportul'}
          </button>
        </div>
      </form>
    </div>
  );
}