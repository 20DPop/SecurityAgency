import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProcesVerbal.css';

export default function ProcesVerbal() {
  const navigate = useNavigate();
  
  // State-uri
  const [posts, setPosts] = useState([]);
  const [arePostsLoaded, setArePostsLoaded] = useState(false); // Stare nouă pentru a controla vizibilitatea formularului
  
  const [formData, setFormData] = useState({
    postId: '',
    reprezentant_beneficiar: '',
    ora_declansare_alarma: '',
    ora_prezentare_echipaj: '',
    ora_incheiere_misiune: '',
    observatii_generale: "In timpul interventiei echipajul de interventie a actionat conform procedurilor in vigoare, neexistand observatii din partea beneficiarului privind calitatea prestatiei.",
    evenimente: [
      { dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Funcția care înlocuiește useEffect. Va fi apelată de un buton.
  const handleLoadPosts = async () => {
    setLoading(true);
    setError(''); // Resetăm erorile
    try {
      const userInfo = JSON.parse(localStorage.getItem('currentUser'));
      if (!userInfo || !userInfo.token) throw new Error("Utilizator neautentificat");
      
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:3000/api/posts/my-posts', config);
      
      if (data && data.length > 0) {
        setPosts(data);
        setFormData(prev => ({ ...prev, postId: data[0]._id })); // Pre-selectăm primul post
        setArePostsLoaded(true); // Marcăm că posturile au fost încărcate
      } else {
        setError('Nu ești alocat la niciun post. Nu poți completa un proces verbal.');
      }
    } catch (err) {
      setError('Eroare la încărcarea posturilor. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Handlerele pentru formular rămân la fel
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const updatedEvenimente = formData.evenimente.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, evenimente: updatedEvenimente }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.postId) {
      setError('Te rog selectează un post înainte de a salva.');
      return;
    }
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
      
      {/* Afișăm formularul doar după ce posturile au fost încărcate */}
      {!arePostsLoaded ? (
        <div className="load-posts-section">
          <p>Pentru a completa un proces verbal, trebuie mai întâi să încarci posturile la care ești alocat.</p>
          <button onClick={handleLoadPosts} disabled={loading} className="load-btn">
            {loading ? 'Se încarcă...' : 'Încarcă Posturile'}
          </button>
          {error && <p className="error-message" style={{marginTop: '1rem'}}>{error}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pv-form">
          <fieldset>
            <legend>Detalii Intervenție</legend>
            <div className="form-group">
              <label htmlFor="post-select">Selectează Postul</label>
              <select 
                id="post-select" 
                name="postId" 
                value={formData.postId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {/* Nu mai avem nevoie de opțiunea "Alege un post" deoarece pre-selectăm */}
                {posts.map(post => (
                  <option key={post._id} value={post._id}>
                    {post.nume_post} ({post.adresa_post})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Ora declanșare alarmă</label>
                <input type="datetime-local" name="ora_declansare_alarma" value={formData.ora_declansare_alarma} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="form-group">
                <label>Ora prezentare echipaj</label>
                <input type="datetime-local" name="ora_prezentare_echipaj" value={formData.ora_prezentare_echipaj} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="form-group">
                <label>Ora încheiere misiune</label>
                <input type="datetime-local" name="ora_incheiere_misiune" value={formData.ora_incheiere_misiune} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="form-group">
                <label>Reprezentant Beneficiar (Opțional)</label>
                <input type="text" name="reprezentant_beneficiar" value={formData.reprezentant_beneficiar} onChange={handleChange} placeholder="Numele persoanei" disabled={loading} />
              </div>
            </div>
             <div className="form-group">
                <label>Observații Generale</label>
                <textarea name="observatii_generale" value={formData.observatii_generale} onChange={handleChange} rows="4" disabled={loading}></textarea>
              </div>
          </fieldset>

          <fieldset>
            <legend>Tabel Evenimente</legend>
            {formData.evenimente.map((event, index) => (
              <div key={index} className="event-row">
                <span className="event-row-number">{index + 1}.</span>
                <div className="event-grid">
                   {/* Am adăugat 'disabled={loading}' la toate input-urile */}
                  <input type="datetime-local" name="dataOraReceptionarii" value={event.dataOraReceptionarii} onChange={(e) => handleEventChange(index, e)} required title="Data și Ora Recepționării" disabled={loading}/>
                  <input type="text" name="tipulAlarmei" value={event.tipulAlarmei} onChange={(e) => handleEventChange(index, e)} placeholder="Tipul alarmei" required disabled={loading}/>
                  <input type="text" name="echipajAlarmat" value={event.echipajAlarmat} onChange={(e) => handleEventChange(index, e)} placeholder="Echipaj alarmat" required disabled={loading}/>
                  <input type="datetime-local" name="oraSosirii" value={event.oraSosirii} onChange={(e) => handleEventChange(index, e)} required title="Ora Sosirii" disabled={loading}/>
                  <input type="text" name="cauzeleAlarmei" value={event.cauzeleAlarmei} onChange={(e) => handleEventChange(index, e)} placeholder="Cauzele alarmei" required disabled={loading}/>
                  <input type="text" name="modulDeSolutionare" value={event.modulDeSolutionare} onChange={(e) => handleEventChange(index, e)} placeholder="Mod de soluționare" required disabled={loading}/>
                  <input type="text" name="observatii" value={event.observatii} onChange={(e) => handleEventChange(index, e)} placeholder="Observații (opțional)" disabled={loading}/>
                </div>
                <button type="button" className="remove-row-btn" onClick={() => handleRemoveRow(index)} disabled={loading}>Șterge</button>
              </div>
            ))}
            <button type="button" className="add-row-btn" onClick={handleAddRow} disabled={loading}>+ Adaugă Rând</button>
          </fieldset>
          
          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" className="back-btn" onClick={() => navigate('/')} disabled={loading}>Anulează</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Se salvează...' : 'Salvează și Generează PDF'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}