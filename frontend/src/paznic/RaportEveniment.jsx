import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RaportEveniment.css'; // Vom crea acest fișier

export default function RaportEveniment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numarRaport: '',
    dataRaport: new Date().toISOString().split('T')[0],
    functiePaznic: 'Agent Securitate',
    numarPost: '',
    dataConstatare: new Date().toISOString().split('T')[0],
    oraConstatare: new Date().toTimeString().slice(0, 5),
    numeFaptuitor: '',
    descriereFapta: '',
    cazSesizatLa: '',
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
      const userInfo = JSON.parse(localStorage.getItem('currentUser'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:3000/api/raport-eveniment/create', formData, config);
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
        <div className="form-grid-2-cols">
          <div className="form-group">
            <label htmlFor="numarRaport">Nr. Raport</label>
            <input id="numarRaport" type="text" name="numarRaport" value={formData.numarRaport} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="dataRaport">Data Raportului</label>
            <input id="dataRaport" type="date" name="dataRaport" value={formData.dataRaport} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-grid-2-cols">
            <div className="form-group">
                <label htmlFor="functiePaznic">În calitate de</label>
                <input id="functiePaznic" type="text" name="functiePaznic" value={formData.functiePaznic} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="numarPost">La postul Nr.</label>
                <input id="numarPost" type="text" name="numarPost" value={formData.numarPost} onChange={handleChange} required />
            </div>
        </div>
        <hr/>
        <h4>Am constatat că:</h4>
        <div className="form-grid-3-cols">
            <div className="form-group">
                <label htmlFor="dataConstatare">Astăzi, data</label>
                <input id="dataConstatare" type="date" name="dataConstatare" value={formData.dataConstatare} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="oraConstatare">La ora</label>
                <input id="oraConstatare" type="time" name="oraConstatare" value={formData.oraConstatare} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="numeFaptuitor">Numitul (numiții)</label>
                <input id="numeFaptuitor" type="text" name="numeFaptuitor" value={formData.numeFaptuitor} onChange={handleChange} required />
            </div>
        </div>
        <div className="form-group">
          <label htmlFor="descriereFapta">A fost surprins în timp ce (descrieți fapta, bunurile, măsurile luate):</label>
          <textarea id="descriereFapta" name="descriereFapta" value={formData.descriereFapta} onChange={handleChange} rows="8" required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="cazSesizatLa">Cazul a fost sesizat la (instituția și persoana):</label>
          <input id="cazSesizatLa" type="text" name="cazSesizatLa" value={formData.cazSesizatLa} onChange={handleChange} required />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} disabled={loading}>Înapoi</button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Se salvează...' : 'Salvează Raportul'}
          </button>
        </div>
      </form>
    </div>
  );
}