import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './shared/styles/global.css';
import { AppProvider } from './features/user/AppContext';
import { AuthProvider } from './features/user/AuthContext';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();