import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient'; // <-- MODIFICARE 1: Importăm apiClient
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

  // <-- MODIFICARE 2: Funcția getAuthConfig nu mai este necesară, poate fi ștearsă.
  // apiClient se ocupă automat de token.

  // Fetch inițial + reîncărcare date
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // <-- MODIFICARE 3: Folosim apiClient, fără a mai trimite 'config'
      const [beneficiariRes, pazniciRes] = await Promise.all([
        apiClient.get('/users/list/beneficiar'),
        apiClient.get('/users/list/paznic')
      ]);
      setBeneficiari(beneficiariRes.data);
      setPaznici(pazniciRes.data);

      // Dacă există beneficiar și punct selectat → aducem paznicii alocați
      if (selectedBeneficiarId && selectedPunct) {
        // <-- MODIFICARE 4: Folosim apiClient
        const { data: assignedData } = await apiClient.get(
          `/assignments/${selectedBeneficiarId}/paznici?punct=${encodeURIComponent(selectedPunct)}`
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
  }, [selectedBeneficiarId, selectedPunct]); // Am scos getAuthConfig din dependențe

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
      const payload = { beneficiaryId: selectedBeneficiarId, punct: selectedPunct, pazniciIds: [paznicId] };
      // <-- MODIFICARE 5: Folosim apiClient
      await apiClient.post('/assignments/assign', payload);
      await fetchAllData();
    } catch (err) {
      console.error("Error assigning agent de securitate:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Eroare la alocarea agentului de securitate.');
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
      const payload = { beneficiaryId: selectedBeneficiarId, punct: selectedPunct, pazniciIds: [paznicId] };
      // <-- MODIFICARE 6: Folosim apiClient
      await apiClient.post('/assignments/unassign', payload);
      await fetchAllData();
    } catch (err) {
      console.error("Error unassigning agentului de securitate:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Eroare la dezalocarea agentului de securitate.');
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
        <h1>Alocare Agenți de Securitate la Beneficiari</h1>
        <button onClick={() => navigate(-1)} className="back-btn-assignment">⬅ Înapoi</button>
      </div>

      {error && <p className="error-message" style={{color: 'red', textAlign: 'center'}}>{error}</p>}

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

      {loading && <p style={{textAlign: 'center'}}>Se încarcă...</p>}

      {/* Listele de paznici doar dacă avem firmă + punct selectat */}
      {selectedBeneficiarId && selectedPunct && !loading && (
        <div className="assignment-columns">
          {/* Coloana Paznici Disponibili */}
          <div className="column">
            <h2>Agenți de Securitate Disponibili</h2>
            <ul className="paznic-list">
              {availablePaznici.length > 0 ? (
                availablePaznici.map(p => (
                  <li key={p._id}>
                    <span>{p.nume} {p.prenume} ({p.profile?.nr_legitimatie || 'N/A'})</span>
                    <button onClick={() => handleAssign(p._id)} className="assign-btn">Alocă ➡</button>
                  </li>
                ))
              ) : <p>Toți agenții de securitate sunt alocați.</p>}
            </ul>
          </div>

          {/* Coloana Paznici Alocați */}
          <div className="column">
            <h2>Agenți de Securitate Alocați</h2>
            <ul className="paznic-list">
              {assignedPaznici.length > 0 ? (
                assignedPaznici.map(p => (
                  <li key={p._id}>
                    <span>{p.nume} {p.prenume} ({p.profile?.nr_legitimatie || 'N/A'})</span>
                    <button onClick={() => handleUnassign(p._id)} className="unassign-btn">⬅ Dezalocă</button>
                  </li>
                ))
              ) : <p>Niciun agent de securitate alocat.</p>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}