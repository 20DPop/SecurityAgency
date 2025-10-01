import React from 'react';
import { Link } from 'react-router-dom';
import '../admin/AdminDashboard.css'; 

export default function AdministratorDashboard() {
  return (
    <div className="admin-dashboard">
      <main>
        <h1 className="page-title">Panou de Control (Administrator)</h1>
        <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 30px' }}>
          Acesta este panoul de control principal. De aici poți crea noi conturi de Admin pentru agenție sau poți naviga pentru a vizualiza aplicația din perspectiva celorlalte roluri.
        </p>
        <div className="cards-container">
          
          <Link 
            to="/administrator/adauga-admin" 
            className="card link-card" 
            style={{ backgroundColor: '#ffcdd2', border: '2px solid #b71c1c' }}
          >
            <span style={{fontSize: '2rem'}}>➕</span>
            <p style={{color: '#b71c1c', fontWeight: 'bold'}}>Adaugă Cont Admin</p>
          </Link>
          
          <Link 
           to="/administrator/gestionare-admini" 
            className="card link-card"
          >
             <span style={{fontSize: '2rem'}}>🗑️</span>
            <p>Gestionează Conturi Admin</p>
          </Link>
          
          <Link 
            to="/admin/dashboard" 
            className="card link-card" 
            style={{ backgroundColor: '#d1c4e9' }}
          >
            <span style={{fontSize: '2rem'}}>👁️</span>
            <p>Vezi ca Admin (Agenție)</p>
          </Link>

          <Link 
            to="/beneficiar/dashboard" 
            className="card link-card" 
            style={{ backgroundColor: '#e0f7fa' }}
          >
            <span style={{fontSize: '2rem'}}>👁️</span>
            <p>Vezi ca Beneficiar</p>
          </Link>

          <Link 
            to="/paznic/dashboard" 
            className="card link-card" 
            style={{ backgroundColor: '#fff9c4' }}
          >
            <span style={{fontSize: '2rem'}}>👁️</span>
            <p>Vezi ca Paznic</p>
          </Link>

        </div>
      </main>
    </div>
  );
}