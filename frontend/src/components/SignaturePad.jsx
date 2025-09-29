// Cale: frontend/src/components/SignaturePad.jsx
import React, { useRef } from 'react';
import SignaturePad from 'react-signature-pad-wrapper'; // <-- Importăm noua bibliotecă
import './SignaturePad.css'; // Folosim același CSS

export default function SignaturePadWrapper({ onSave }) {
  const signaturePadRef = useRef(null);

  const clear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const save = () => {
    if (signaturePadRef.current && signaturePadRef.current.isEmpty()) {
      alert("Vă rugăm să semnați înainte de a salva.");
      return;
    }

    if (signaturePadRef.current) {
      // Metoda de a obține imaginea este .toDataURL()
      const signatureData = signaturePadRef.current.toDataURL('image/png');
      onSave(signatureData);
    }
  };

  return (
    <div className="signature-container">
      <p>Semnați în caseta de mai jos:</p>
      <div className="signature-pad-wrapper">
        {/* Componenta se numește la fel, dar are proprietăți ușor diferite */}
        <SignaturePad
          ref={signaturePadRef}
          options={{ penColor: 'black' }} // Proprietățile se trec într-un obiect 'options'
        />
      </div>
      <div className="signature-buttons">
        <button type="button" onClick={clear} className="sig-clear-btn">Șterge</button>
        <button type="button" onClick={save} className="sig-save-btn">Confirmă Semnătura</button>
      </div>
    </div>
  );
}