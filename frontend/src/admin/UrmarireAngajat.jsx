// Cale: frontend/src/pages/UrmarireAngajat.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function UrmarireAngajat() {
  const { id } = useParams(); // id-ul paznicului
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

    const fetchLocation = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/pontaj/locatie/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Eroare la preluarea locației!");

        const data = await res.json();
        setLocation(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000); // update la 5 secunde
    return () => clearInterval(interval);
  }, [id]);

  if (!location) return <div>Se încarcă locația...</div>;

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Buton Înapoi */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ⬅ Înapoi
      </button>

      <h2 style={{ textAlign: "center", marginTop: "10px" }}>Urmărire angajat</h2>
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={16}
        style={{ height: "90%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>Angajatul se află aici 📍</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
