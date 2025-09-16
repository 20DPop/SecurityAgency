import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AlocarePaznici.css';

export default function AlocarePaznici() {
  const [beneficiari, setBeneficiari] = useState([]);
  const [paznici, setPaznici] = useState([]);
  const [selectedBeneficiarId, setSelectedBeneficiarId] = useState('');
  const [assignedPaznici, setAssignedPaznici] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const getAuthConfig = useCallback(() => { // Wrap in useCallback
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
  }, []); // No dependencies for getAuthConfig as userInfo is from localStorage

  // Function to fetch ALL data (beneficiaries, paznici, assigned for selected)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const config = getAuthConfig();
      const [beneficiariRes, pazniciRes] = await Promise.all([
        axios.get('http://localhost:3000/api/users/list/beneficiar', config),
        axios.get('http://localhost:3000/api/users/list/paznic', config)
      ]);
      setBeneficiari(beneficiariRes.data);
      setPaznici(pazniciRes.data);

      // If a beneficiary is already selected, re-fetch their assignments
      if (selectedBeneficiarId) {
        const { data: assignedData } = await axios.get(`http://localhost:3000/api/assignments/${selectedBeneficiarId}/paznici`, config);
        setAssignedPaznici(assignedData);
      }
    } catch (err) {
      console.error("Error fetching all data:", err);
      setError('Eroare la preluarea datelor inițiale sau a alocărilor.');
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, selectedBeneficiarId]); // Add selectedBeneficiarId as dependency

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]); // Run fetchAllData whenever it changes (which is rare, but safe)


  // Handler pentru schimbarea beneficiarului selectat
  const handleBeneficiarChange = (e) => {
    const beneficiaryId = e.target.value;
    setSelectedBeneficiarId(beneficiaryId);
    // fetchAllData will now re-run because selectedBeneficiarId changed
    // and automatically fetch assigned paznici for the new selection.
  };

  // Handler pentru ALOCAREA unui paznic
  const handleAssign = async (paznicId) => {
    setLoading(true);
    setError('');
    try {
      const config = getAuthConfig();
      const payload = { beneficiaryId: selectedBeneficiarId, pazniciIds: [paznicId] };
      await axios.post('http://localhost:3000/api/assignments/assign', payload, config);
      // After assignment, re-fetch all data to ensure lists are fully updated
      await fetchAllData();
    } catch (err) {
      console.error("Error assigning paznic:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Eroare la alocarea paznicului.');
    } finally {
      setLoading(false);
    }
  };

  // Handler pentru DEZALOCAREA unui paznic
  const handleUnassign = async (paznicId) => {
    setLoading(true);
    setError('');
    try {
      const config = getAuthConfig();
      const payload = { beneficiaryId: selectedBeneficiarId, pazniciIds: [paznicId] };
      await axios.post('http://localhost:3000/api/assignments/unassign', payload, config);
      // After unassignment, re-fetch all data
      await fetchAllData();
    } catch (err) {
      console.error("Error unassigning paznic:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Eroare la dezalocarea paznicului.');
    } finally {
      setLoading(false);
    }
  };

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
              {b.profile?.nume_companie} ({b.nume} {b.prenume})
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Se încarcă...</p>}

      {selectedBeneficiarId && !loading && ( // Only show columns if a beneficiary is selected and not loading
        <div className="assignment-columns">
          {/* Coloana Paznici Disponibili */}
          <div className="column">
            <h2>Paznici Disponibili</h2>
            <ul className="paznic-list">
              {availablePaznici.length > 0 ? (
                availablePaznici.map(p => (
                  <li key={p._id}>
                    <span>{p.nume} {p.prenume} ({p.profile?.nr_legitimatie || 'N/A'})</span>
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
                    <span>{p.nume} {p.prenume} ({p.profile?.nr_legitimatie || 'N/A'})</span>
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