import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import apiClient from '../apiClient'; // <-- MODIFICARE: Importăm apiClient

// --- Bloc pentru corectarea iconiței default din Leaflet ---
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl,
    shadowUrl: iconShadowUrl,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// --- Sfârșit bloc ---

export default function UrmarireAngajat() {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId = null;

    const fetchLocation = async () => {
      try {
        // <-- MODIFICARE: Folosim apiClient
        const { data } = await apiClient.get(`/pontaj/locatie/${id}`);
        setError(''); // Resetează eroarea dacă cererea are succes
        setLocation({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });
      } catch (err) {
        console.error(err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Eroare la preluarea locației.");
        if (intervalId) clearInterval(intervalId); // Oprește intervalul dacă apare o eroare
      }
    };

    fetchLocation(); // Apel inițial
    intervalId = setInterval(fetchLocation, 5000); // Setează actualizarea la 5 secunde

    return () => clearInterval(intervalId); // Curăță intervalul la demontarea componentei
  }, [id]);

  if (error && !location) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>{error}</h2>
        <button onClick={() => navigate(-1)} style={{padding: '10px 20px', cursor: 'pointer'}}>
          ⬅ Înapoi
        </button>
      </div>
    );
  }

  if (!location) {
    return <div style={{textAlign: 'center', padding: '50px'}}>Se încarcă locația...</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        ⬅ Înapoi
      </button>

      <h2 style={{ textAlign: "center", margin: "10px 0" }}>Urmărire Angajat</h2>

      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={17}
        style={{ height: "calc(100% - 50px)", width: "100%" }}
        key={`${location.latitude}-${location.longitude}`} // Forțează re-randarea hărții dacă se schimbă centrul
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>Angajatul este aici. 📍<br /> Ultima actualizare: {new Date().toLocaleTimeString('ro-RO')}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}