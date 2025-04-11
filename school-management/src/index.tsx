import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DataInitializer } from './utils/DataInitializer';

// Initialiser les données de test avant de rendre l'application
const initializeApp = async () => {
  // Initialiser les données de test
  await DataInitializer.initializeTestData();
  
  // Rendre l'application
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Lancer l'initialisation
initializeApp().catch(error => {
  console.error('Erreur lors de l\'initialisation de l\'application:', error);
  
  // En cas d'erreur, rendre quand même l'application
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
