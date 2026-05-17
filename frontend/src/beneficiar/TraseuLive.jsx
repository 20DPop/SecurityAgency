// Cale: frontend/src/beneficiar/TraseuLive.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';
import apiClient from '../apiClient';

// Fix iconițe Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Iconița verde pentru START
const startIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ============================================================
// Sub-componentă: mută harta automat la ultima poziție
// ============================================================
function MapFollower({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

// ============================================================
// COMPONENTA PRINCIPALĂ
// ============================================================
export default function TraseuLive() {
  const { paznicId } = useParams(); // string din URL
  const navigate = useNavigate();

  const [puncte, setPuncte] = useState([]);
  const [ultimulPunct, setUltimulPunct] = useState(null);
  const [oraIntrare, setOraIntrare] = useState(null);
  const [totalPuncte, setTotalPuncte] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [numePaznic, setNumePaznic] = useState('');
  const [esteOnline, setEsteOnline] = useState(false);

  const socketRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // ============================================================
  // VERIFICARE FEATURE FLAG
  // ============================================================
  if (currentUser.seeUpdates !== 1) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: '16px'
      }}>
        <h2 style={{ color: '#e74c3c' }}>⚠️ Funcție indisponibilă</h2>
        <p style={{ color: '#666' }}>Această funcție nu este disponibilă momentan.</p>
        <button onClick={() => navigate(-1)} style={{
          padding: '10px 20px', cursor: 'pointer', borderRadius: '6px',
          border: 'none', backgroundColor: '#007bff', color: '#fff'
        }}>
          ⬅ Înapoi
        </button>
      </div>
    );
  }

  useEffect(() => {
    // ============================================================
    // 1. PRELUĂM TRASEUL EXISTENT
    // ============================================================
    const fetchTraseu = async () => {
      try {
        const { data } = await apiClient.get(`/pontaj/traseu/${paznicId}`);

        if (data.puncte && data.puncte.length > 0) {
          const coordonate = data.puncte.map(p => [p.latitude, p.longitude]);
          setPuncte(coordonate);
          setUltimulPunct(coordonate[coordonate.length - 1]);
          setTotalPuncte(data.totalPuncte);
          setOraIntrare(data.oraIntrare);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Eroare la preluarea traseului.');
        setLoading(false);
      }
    };

    fetchTraseu();

    // ============================================================
    // 2. SOCKET.IO - actualizări live
    // ============================================================
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    socketRef.current = io(backendUrl, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      setEsteOnline(true);
      // Intrăm în room-ul beneficiarului
      socketRef.current.emit('join_room', currentUser._id);
    });

    socketRef.current.on('disconnect', () => {
      setEsteOnline(false);
    });

    socketRef.current.on('guard_moved', (data) => {
      // ✅ FIX MULTI-PAZNIC: ambele sunt string-uri acum
      // data.paznicId vine ca string din backend (.toString())
      // paznicId vine ca string din useParams()
      // Fără acest fix, când ai 2+ paznici activi, harta unui paznic
      // ar fi putut afișa punctele altuia!
      if (data.paznicId === paznicId) {
        const punctNou = [data.lat, data.lng];
        setPuncte(prev => [...prev, punctNou]);
        setUltimulPunct(punctNou);
        setTotalPuncte(prev => prev + 1);
        if (data.numePaznic) setNumePaznic(data.numePaznic);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [paznicId]);

  // ============================================================
  // LOADING / ERROR
  // ============================================================
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Se încarcă traseul...</div>;
  }

  if (error && puncte.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>{error}</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Paznicul nu a început tura sau nu are GPS activ.
        </p>
        <button onClick={() => navigate(-1)} style={{
          marginTop: '16px', padding: '10px 20px', cursor: 'pointer',
          borderRadius: '6px', border: 'none', backgroundColor: '#007bff', color: '#fff'
        }}>
          ⬅ Înapoi
        </button>
      </div>
    );
  }

  const pozitieInitiala = puncte.length > 0 ? puncte[0] : [45.9432, 24.9668];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>

      {/* Buton Înapoi */}
      <button onClick={() => navigate(-1)} style={{
        position: 'absolute', top: '20px', left: '20px', zIndex: 1000,
        padding: '10px 15px', backgroundColor: '#007bff', color: '#fff',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)', fontWeight: 'bold',
      }}>
        ⬅ Înapoi
      </button>

      {/* Card info */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
        backgroundColor: '#fff', borderRadius: '10px', padding: '14px 18px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)', minWidth: '200px',
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#333' }}>
          🗺️ Traseu Live
        </h3>
        {numePaznic && (
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
            👤 {numePaznic}
          </p>
        )}
        {oraIntrare && (
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
            🕐 Check-in: {new Date(oraIntrare).toLocaleTimeString('ro-RO', {
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        )}
        <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
          📍 Puncte GPS: <strong>{totalPuncte}</strong>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: esteOnline ? '#2ecc71' : '#e74c3c',
            boxShadow: esteOnline ? '0 0 6px #2ecc71' : 'none',
            animation: esteOnline ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{
            fontSize: '12px',
            color: esteOnline ? '#2ecc71' : '#e74c3c',
            fontWeight: 'bold'
          }}>
            {esteOnline ? 'LIVE' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Legendă */}
      <div style={{
        position: 'absolute', bottom: '30px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 1000,
        backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px',
        padding: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex', gap: '20px', fontSize: '12px', color: '#555',
      }}>
        <span>🟢 Start</span>
        <span style={{ color: '#e74c3c' }}>━━</span>
        <span>Traseu parcurs</span>
        <span>📍 Poziție curentă</span>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* HARTA */}
      <MapContainer
        center={pozitieInitiala}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {ultimulPunct && <MapFollower position={ultimulPunct} />}

        {/* Linia roșie a traseului */}
        {puncte.length > 1 && (
          <Polyline positions={puncte} color="#e74c3c" weight={4} opacity={0.85} />
        )}

        {/* Marker START verde */}
        {puncte.length > 0 && (
          <Marker position={puncte[0]} icon={startIcon}>
            <Popup>
              🟢 <strong>Punct de start</strong><br />
              {oraIntrare && `Check-in: ${new Date(oraIntrare).toLocaleTimeString('ro-RO')}`}
            </Popup>
          </Marker>
        )}

        {/* Marker POZIȚIE CURENTĂ */}
        {ultimulPunct && (
          <Marker position={ultimulPunct}>
            <Popup>
              📍 <strong>Poziție curentă</strong><br />
              {new Date().toLocaleTimeString('ro-RO')}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}