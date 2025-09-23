import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AlocarePaznici.css';

export default function AlocarePaznici() {
  const [beneficiari, setBeneficiari] = useState([]);
  const [paznici, setPaznici] = useState([]);
  const [selectedBeneficiarId, setSelectedBeneficiarId] = useState('');
  const [selectedPunct, setSelectedPunct] = useState('');
  const [assignedPaznici, setAssignedPaznici] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const getAuthConfig = useCallback(() => {
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
  }, []);

  // Fetch inițial + reîncărcare date
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

      // Dacă există beneficiar și punct selectat → aducem paznicii alocați
      if (selectedBeneficiarId && selectedPunct) {
        const { data: assignedData } = await axios.get(
          `http://localhost:3000/api/assignments/${selectedBeneficiarId}/paznici?punct=${encodeURIComponent(selectedPunct)}`,
          config
        );
        setAssignedPaznici(assignedData);
      } else {
        setAssignedPaznici([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Eroare la preluarea datelor.');
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, selectedBeneficiarId, selectedPunct]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Când schimbăm beneficiarul → resetăm punctul și alocările
  const handleBeneficiarChange = (e) => {
    const beneficiaryId = e.target.value;
    setSelectedBeneficiarId(beneficiaryId);
    setSelectedPunct('');
    setAssignedPaznici([]);
  };

  // Când schimbăm punctul → reîncărcăm paznicii alocați
  const handlePunctChange = async (e) => {
    const punct = e.target.value;
    setSelectedPunct(punct);
  };

  // ALOCARE
  const handleAssign = async (paznicId) => {
    if (!selectedBeneficiarId || !selectedPunct) {
      setError("Selectează mai întâi beneficiarul și punctul de lucru.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const config = getAuthConfig();
      const payload = { beneficiaryId: selectedBeneficiarId, punct: selectedPunct, pazniciIds: [paznicId] };
      await axios.post('http://localhost:3000/api/assignments/assign', payload, config);
      await fetchAllData();
    } catch (err) {
      console.error("Error assigning paznic:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Eroare la alocarea paznicului.');
    } finally {
      setLoading(false);
    }
  };

  // DEZALOCARE
  const handleUnassign = async (paznicId) => {
    if (!selectedBeneficiarId || !selectedPunct) {
      setError("Selectează mai întâi beneficiarul și punctul de lucru.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const config = getAuthConfig();
      const payload = { beneficiaryId: selectedBeneficiarId, punct: selectedPunct, pazniciIds: [paznicId] };
      await axios.post('http://localhost:3000/api/assignments/unassign', payload, config);
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

      {/* Selectare beneficiar */}
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

      {/* Selectare punct de lucru */}
      {selectedBeneficiarId && (
        <div className="punct-selector">
          <label htmlFor="punct">Selectează punct de lucru:</label>
          <select id="punct" value={selectedPunct} onChange={handlePunctChange} disabled={loading}>
            <option value="">-- Alege un punct de lucru --</option>
            {beneficiari.find(b => b._id === selectedBeneficiarId)?.profile?.punct_de_lucru.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <p>Se încarcă...</p>}

      {/* Listele de paznici doar dacă avem firmă + punct selectat */}
      {selectedBeneficiarId && selectedPunct && !loading && (
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
