import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AlocarePaznici.css'; // Vom crea acest fișier CSS imediat

export default function AlocarePaznici() {
  const [beneficiari, setBeneficiari] = useState([]);
  const [paznici, setPaznici] = useState([]);
  const [selectedBeneficiarId, setSelectedBeneficiarId] = useState('');
  const [assignedPaznici, setAssignedPaznici] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Funcție pentru a prelua token-ul de autentificare
  const getAuthConfig = () => {
    const userInfo = JSON.parse(localStorage.getItem('currentUser'));
    if (!userInfo || !userInfo.token) {
      throw new Error("Utilizator neautentificat!");
    }
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
  };

  // Preluăm lista de beneficiari și paznici la încărcarea componentei
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = getAuthConfig();
        const [beneficiariRes, pazniciRes] = await Promise.all([
          axios.get('http://localhost:3000/api/users/list/beneficiar', config),
          axios.get('http://localhost:3000/api/users/list/paznic', config)
        ]);
        setBeneficiari(beneficiariRes.data);
        setPaznici(pazniciRes.data);
      } catch (err) {
        setError('Eroare la preluarea datelor inițiale.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Funcție pentru a prelua paznicii alocați unui beneficiar
  const fetchAssignedPaznici = async (beneficiaryId) => {
    if (!beneficiaryId) {
      setAssignedPaznici([]);
      return;
    }
    setLoading(true);
    try {
      const config = getAuthConfig();
      const { data } = await axios.get(`http://localhost:3000/api/assignments/${beneficiaryId}/paznici`, config);
      setAssignedPaznici(data);
    } catch (err) {
      setError('Eroare la preluarea paznicilor alocați.');
      setAssignedPaznici([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler pentru schimbarea beneficiarului selectat
  const handleBeneficiarChange = (e) => {
    const beneficiaryId = e.target.value;
    setSelectedBeneficiarId(beneficiaryId);
    fetchAssignedPaznici(beneficiaryId);
  };
  
  // Handler pentru ALOCAREA unui paznic
  const handleAssign = async (paznicId) => {
    try {
      const config = getAuthConfig();
      const payload = { beneficiaryId: selectedBeneficiarId, pazniciIds: [paznicId] };
      await axios.post('http://localhost:3000/api/assignments/assign', payload, config);
      // Re-actualizăm lista de paznici alocați pentru a reflecta schimbarea
      fetchAssignedPaznici(selectedBeneficiarId);
    } catch (err) {
      setError('Eroare la alocarea paznicului.');
    }
  };
  
  // Handler pentru DEZALOCAREA unui paznic
  const handleUnassign = async (paznicId) => {
     try {
      const config = getAuthConfig();
      const payload = { beneficiaryId: selectedBeneficiarId, pazniciIds: [paznicId] };
      await axios.post('http://localhost:3000/api/assignments/unassign', payload, config);
      // Re-actualizăm lista
      fetchAssignedPaznici(selectedBeneficiarId);
    } catch (err) {
      setError('Eroare la dezalocarea paznicului.');
    }
  };
  
  // Filtrăm paznicii care nu sunt deja alocați
  const availablePaznici = paznici.filter(paznic => 
    !assignedPaznici.some(assigned => assigned._id === paznic._id)
  );

  return (
    <div className="assignment-page">
      <div className="assignment-header">
        <h1>Alocare Paznici la Beneficiari</h1>
        <button onClick={() => navigate(-1)} className="back-btn-assignment">⬅ Înapoi</button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="beneficiary-selector">
        <label htmlFor="beneficiar">Selectează un Beneficiar:</label>
        <select id="beneficiar" value={selectedBeneficiarId} onChange={handleBeneficiarChange} disabled={loading}>
          <option value="">-- Alege o firmă --</option>
          {beneficiari.map(b => (
            <option key={b._id} value={b._id}>
              {b.profile.nume_companie} ({b.nume} {b.prenume})
            </option>
          ))}
        </select>
      </div>
      
      {loading && <p>Se încarcă...</p>}

      {selectedBeneficiarId && !loading && (
        <div className="assignment-columns">
          {/* Coloana Paznici Disponibili */}
          <div className="column">
            <h2>Paznici Disponibili</h2>
            <ul className="paznic-list">
              {availablePaznici.length > 0 ? (
                availablePaznici.map(p => (
                  <li key={p._id}>
                    <span>{p.nume} {p.prenume} ({p.profile.nr_legitimatie})</span>
                    <button onClick={() => handleAssign(p._id)} className="assign-btn">Alocă ➡</button>
                  </li>
                ))
              ) : <p>Toți paznicii sunt alocați.</p>}
            </ul>
          </div>

          {/* Coloana Paznici Alocați */}
          <div className="column">
            <h2>Paznici Alocați</h2>
            <ul className="paznic-list">
              {assignedPaznici.length > 0 ? (
                assignedPaznici.map(p => (
                   <li key={p._id}>
                    <span>{p.nume} {p.prenume} ({p.profile.nr_legitimatie})</span>
                    <button onClick={() => handleUnassign(p._id)} className="unassign-btn">⬅ Dezalocă</button>
                  </li>
                ))
              ) : <p>Niciun paznic alocat.</p>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}