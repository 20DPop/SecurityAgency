import React, { useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";

export default function UrmarireAngajat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const olMap = useRef(null);
  const markerLayer = useRef(null);
  const [initialized, setInitialized] = useState(false);

  // Inițializare hartă cu callback ref
  const mapRef = useCallback((node) => {
    if (node && !olMap.current) {
      markerLayer.current = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            scale: 0.07,
          }),
        }),
      });

      olMap.current = new Map({
        target: node,
        layers: [new TileLayer({ source: new OSM() }), markerLayer.current],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });

      setTimeout(() => olMap.current.updateSize(), 100);
      setInitialized(true);
    }
  }, []);

  // Fetch locație cu React Query
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  const { data: location, isLoading } = useQuery({
    queryKey: ["locatie", id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/pontaj/locatie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Eroare la preluarea locației!");
      const data = await res.json();
      return {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      };
    },
    refetchInterval: 5000, // update la 5 secunde
    enabled: !!id && !!token && initialized, // rulează doar când harta e inițializată
  });

  // Actualizare marker când se schimbă locația
  if (location && olMap.current && markerLayer.current) {
    const coords = fromLonLat([location.longitude, location.latitude]);
    olMap.current.getView().animate({ center: coords, zoom: 16, duration: 1000 });
    markerLayer.current.getSource().clear();
    markerLayer.current.getSource().addFeature(new Feature({ geometry: new Point(coords) }));
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
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

      <div ref={mapRef} style={{ height: "calc(100% - 60px)", width: "100%" }}></div>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          Se încarcă locația...
        </div>
      )}
    </div>
  );
}
