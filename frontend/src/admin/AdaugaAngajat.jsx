import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; 

// Importăm stilurile pentru formular
import "./AdaugaAngajat.css"; 
// Importăm componenta reutilizabilă pentru câmpul de parolă
import PasswordInput from '../components/PasswordInput';

export default function AdaugaAngajat() {
  // Starea pentru a ține datele din formular
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    password: "",
    passwordConfirm: "", // Câmp pentru confirmarea parolei
    telefon: "",
    nr_legitimatie: "" 
  });

  // Stări pentru a gestiona interfața (încărcare și erori)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Hook pentru a naviga între pagini
  const navigate = useNavigate();

  // Funcție generică pentru a actualiza starea formularului la orice modificare
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Funcția principală care se execută la trimiterea formularului
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne reîncărcarea paginii
    setError(''); // Resetează mesajele de eroare anterioare

    // --- Validări în frontend înainte de a trimite datele ---
    if (formData.password !== formData.passwordConfirm) {
        setError('Parolele introduse nu se potrivesc!');
        return; // Oprește trimiterea formularului
    }
    
    if (formData.password.length < 6) {
        setError('Parola trebuie să conțină cel puțin 6 caractere.');
        return; // Oprește trimiterea formularului
    }

    setLoading(true); // Se afișează starea de încărcare (ex: "Se salvează...")

    try {
        // Preluăm informațiile utilizatorului logat din localStorage
        const userInfo = JSON.parse(localStorage.getItem('currentUser'));
        if (!userInfo || !userInfo.token) {
            throw new Error("Utilizator neautentificat! Vă rugăm să vă relogați.");
        }

        // Configurăm headerele pentru cererea API, incluzând token-ul de autorizare
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        // Pregătim datele care vor fi trimise la server
        // Nu includem 'passwordConfirm', deoarece serverul nu are nevoie de el
        const payload = {
            nume: formData.nume,
            prenume: formData.prenume,
            email: formData.email,
            password: formData.password,
            telefon: formData.telefon,
            role: 'paznic', 
            profile: {
                nr_legitimatie: formData.nr_legitimatie
            }
        };

        // Facem cererea POST către backend pentru a crea noul utilizator
        await axios.post('http://localhost:3000/api/users/create', payload, config);

        // Dacă totul a mers bine, afișăm un mesaj de succes și navigăm înapoi
        alert("✅ Angajat (Paznic) adăugat cu succes!");
        navigate(-1); 

    } catch (err) {
        // Dacă apare o eroare, o afișăm utilizatorului
        setError(err.response?.data?.message || 'A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
        // Oprim starea de încărcare, indiferent dacă a fost succes sau eroare
        setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        <h2>Adaugă Angajat</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nume">Nume:</label>
            <input id="nume" type="text" name="nume" value={formData.nume} onChange={handleChange} required className="form-input"/>
          </div>
          <div className="form-group">
            <label htmlFor="prenume">Prenume:</label>
            <input id="prenume" type="text" name="prenume" value={formData.prenume} onChange={handleChange} required className="form-input"/>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input"/>
          </div>
          
          {/* Folosim componenta reutilizabilă pentru parolă */}
          <PasswordInput
            label="Parolă:"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />

          {/* Folosim componenta reutilizabilă pentru confirmarea parolei */}
          <PasswordInput
            label="Confirmă Parola:"
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            className="form-input"
          />
          
          <div className="form-group">
            <label htmlFor="telefon">Telefon (opțional):</label>
            <input id="telefon" type="tel" name="telefon" value={formData.telefon} onChange={handleChange} className="form-input"/>
          </div>
          <div className="form-group">
            <label htmlFor="nr_legitimatie">Nr. legitimație (opțional):</label>
            <input id="nr_legitimatie" type="text" name="nr_legitimatie" value={formData.nr_legitimatie} onChange={handleChange} className="form-input"/>
          </div>

          {/* Afișăm mesajul de eroare dacă există unul */}
          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" className="form-button back-btn" onClick={() => navigate(-1)} disabled={loading}>
              ⬅ Înapoi
            </button>
            <button type="submit" className="form-button submit-btn" disabled={loading}>
              {loading ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}