import React, { useRef } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import './SignaturePad.css'; // Asigură-te că acest fișier CSS există în același folder

/**
 * O componentă wrapper pentru librăria de semnături.
 * Oferă butoane pentru a șterge și a salva semnătura.
 * @param {object} props - Props-urile componentei.
 * @param {function(string): void} props.onSave - O funcție callback care este apelată
 *   cu semnătura în format base64 (dataURL) atunci când se apasă pe "Confirmă".
 */
export default function SignaturePadWrapper({ onSave }) {
  const signaturePadRef = useRef(null);

  // Funcție pentru a goli pânza de desen
  const clear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  // Funcție pentru a prelua și a trimite datele semnăturii
  const save = () => {
    // Verifică dacă pânza este goală înainte de a salva
    if (signaturePadRef.current && signaturePadRef.current.isEmpty()) {
      alert("Vă rugăm să semnați înainte de a salva.");
      return;
    }

    if (signaturePadRef.current) {
      // Obține semnătura ca imagine PNG în format base64
      const signatureData = signaturePadRef.current.toDataURL('image/png');
      // Apelează funcția onSave primită ca prop cu datele semnăturii
      onSave(signatureData);
    }
  };

  return (
    <div className="signature-container">
      <p>Semnați în caseta de mai jos:</p>
      <div className="signature-pad-wrapper">
        <SignaturePad
          ref={signaturePadRef}
          // Opțiuni pentru stiloul de desen
          options={{ penColor: 'black', backgroundColor: 'rgba(255, 255, 255, 0)' }}
        />
      </div>
      <div className="signature-buttons">
        <button type="button" onClick={clear} className="sig-clear-btn">Șterge</button>
        <button type="button" onClick={save} className="sig-save-btn">Confirmă Semnătura</button>
      </div>
    </div>
  );
}