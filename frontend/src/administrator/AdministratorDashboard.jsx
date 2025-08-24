
import React from 'react';
import { Link } from 'react-router-dom';
// Poți crea un CSS nou sau poți refolosi stilurile de la AdminDashboard
import '../admin/AdminDashboard.css'; 
import '../beneficiar/BeneficiarDashboard.css'
import'../paznic/PaznicDashboard.css'


export default function AdministratorDashboard() {
  return (
    <div className="admin-dashboard">
      <main>
        <h1 className="page-title">Panou Developer (Administrator)</h1>
        <p style={{ margin: '0 30px 30px' }}>
          De aici poți naviga pentru a vizualiza aplicația din perspectiva fiecărui rol.
        </p>
        <div className="cards-container">
          {/* Link către Dashboard-ul de Admin (Agenție) */}
          <Link to="/admin/dashboard" className="card link-card" style={{ backgroundColor: '#d1c4e9' }}>
            👁️
            <p>Vezi ca Admin (Agenția de Pază)</p>
          </Link>
          
          {/* Link către Dashboard-ul de Beneficiar */}
          <Link to="/beneficiar/dashboard" className="card link-card" style={{ backgroundColor: '#e0f7fa' }}>
            👁️
            <p>Vezi ca Beneficiar</p>
          </Link>

          {/* Link către Dashboard-ul de Paznic */}
          <Link to="/paznic/dashboard" className="card link-card" style={{ backgroundColor: '#fff9c4' }}>
            👁️
            <p>Vezi ca Paznic</p>
          </Link>
        </div>
      </main>
    </div>
  );
}