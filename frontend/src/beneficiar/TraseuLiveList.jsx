// Cale: frontend/src/beneficiar/TraseuLiveList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

export default function TraseuLiveList() {
  const [paznici, setPaznici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaznici = async () => {
      try {
        const { data } = await apiClient.get('/pontaj/angajati-activi-beneficiar');
        setPaznici(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Eroare la preluarea datelor.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaznici();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', fontSize: '16px' }}>
      Se încarcă...
    </div>
  );

  return (
    <div style={{
      maxWidth: '700px',
      margin: '40px auto',
      padding: '0 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header pagină */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 14px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ⬅ Înapoi
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>
          🗺️ Urmărire Traseu Live
        </h1>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#ffeaea',
          borderRadius: '8px',
          color: '#e74c3c',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Lista paznicilor activi */}
      {paznici.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          color: '#888'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#555' }}>
            Niciun paznic activ momentan
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Traseul live este disponibil doar în timpul turei active.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>
            {paznici.length} paznic{paznici.length > 1 ? 'i' : ''} activ{paznici.length > 1 ? 'i' : ''} acum:
          </p>

          {paznici.map((p) => (
            <div
              key={p._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #eee',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              {/* Info paznic */}
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a1a2e' }}>
                  👤 {p.paznicId?.nume} {p.paznicId?.prenume}
                </div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                  🕐 Check-in: {new Date(p.ora_intrare).toLocaleTimeString('ro-RO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Indicator activ + buton */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Punct verde animat */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#2ecc71',
                    boxShadow: '0 0 6px #2ecc71',
                    animation: 'pulse 1.5s infinite'
                  }} />
                  <span style={{ fontSize: '12px', color: '#2ecc71', fontWeight: 'bold' }}>
                    ACTIV
                  </span>
                </div>

                {/* Buton Vezi Traseu */}
                <button
                  onClick={() => navigate(`/traseu-live/${p.paznicId?._id}`)}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🗺️ Vezi Traseu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Animație pulse */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}