import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PontarePage.css";

export default function PontarePage() {
  const navigate = useNavigate();

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // La încărcarea paginii, citim din localStorage
  useEffect(() => {
    const savedStart = localStorage.getItem("pontaj_start");
    const savedEnd = localStorage.getItem("pontaj_end");
    if (savedStart) setStartTime(savedStart);
    if (savedEnd) setEndTime(savedEnd);
  }, []);

  const handleStart = () => {
    const now = new Date().toLocaleString("ro-RO");
    setStartTime(now);
    localStorage.setItem("pontaj_start", now);
    localStorage.removeItem("pontaj_end"); // resetăm sfârșitul dacă începe altă tură
    setEndTime(null);
  };

  const handleEnd = () => {
    const now = new Date().toLocaleString("ro-RO");
    setEndTime(now);
    localStorage.setItem("pontaj_end", now);
  };

  return (
    <div className="pontare-page">
      <div className="pontare-container">
        <h2>Pontare</h2>

        <div className="buttons">
          <button className="start-btn" onClick={handleStart}>
            Început de tură
          </button>
          <button className="end-btn" onClick={handleEnd}>
            Sfârșit de tură
          </button>
        </div>

        <div className="pontaj-info">
          {startTime && <p><b>Tura începută:</b> {startTime}</p>}
          {endTime && <p><b>Tura terminată:</b> {endTime}</p>}
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>
          Înapoi
        </button>
      </div>
    </div>
  );
}
