import React, { useState } from 'react';
import './PasswordInput.css'; // Vom crea acest fișier CSS imediat
export default function PasswordInput({ label, id, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrapper">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          {...props} // Pasează toate celelalte props (name, value, onChange, required etc.)
        />
        <button
          type="button" // Important pentru a nu trimite formularul la click
          className="password-toggle-btn"
          onClick={togglePasswordVisibility}
          title={showPassword ? "Ascunde parola" : "Arată parola"}
        >
          {/* Afișăm un emoji diferit în funcție de stare */}
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}