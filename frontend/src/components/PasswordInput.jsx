import React, { useState } from 'react';
import './PasswordInput.css'; // Asigură-te că acest fișier CSS există în același folder

/**
 * O componentă reutilizabilă pentru un câmp de parolă cu un buton de "toggle visibility".
 * Acceptă toate props-urile standard ale unui input (name, value, onChange, etc.)
 * plus un `label` pentru etichetă.
 */
export default function PasswordInput({ label, id, ...props }) {
  // Stare internă pentru a controla dacă parola este vizibilă sau nu
  const [showPassword, setShowPassword] = useState(false);

  // Funcție pentru a schimba starea de vizibilitate
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  return (
    // Folosim clasa 'form-group' pentru a menține consistența stilului cu celelalte câmpuri
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrapper">
        <input
          id={id}
          // Tipul input-ului se schimbă dinamic: 'text' (vizibil) sau 'password' (ascuns)
          type={showPassword ? 'text' : 'password'}
          // ...props pasează toate celelalte atribute (name, value, onChange, required, etc.)
          {...props}
        />
        <button
          type="button" // Important pentru a preveni trimiterea formularului la click
          className="password-toggle-btn"
          onClick={togglePasswordVisibility}
          title={showPassword ? "Ascunde parola" : "Arată parola"}
        >
          {/* Afișează un emoji diferit în funcție de starea de vizibilitate */}
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}