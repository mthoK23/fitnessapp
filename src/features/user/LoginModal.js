import React from 'react';
import Login from './Login';
import './LoginModal.css';

const LoginModal = ({isOpen, onClose}) =>{

    if (!isOpen) return null;

    return(
       <main className ="login-modal-overlay" aria-label="Login Modal Overlay">

          <section className ="login-modal">
            <section className ="login-modal-content">
              <button
                className="login-modal-close"
                aria-label="Close login modal"
                onClick={onClose}
              >
               &times; 
              </button>
              <section className ="login-welcom">
                <h2 className ="login-title">Welcome to FitTrack</h2>
                <p className ="login-message">
                  To experience the app's full functionality, please log in or create an account. 
                  Get locked in 
                </p>
                <Login onClose={onClose}/>
              </section>
            </section>
          </section>

       </main>
    );
};

export default LoginModal;