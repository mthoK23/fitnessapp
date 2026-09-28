import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Login = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    let success;
    if (isLogin) {
      success = login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } else {
      success = register(username, password);
      if (!success) {
        setError('Username already exists');
      }
    }
    
    if (success && onClose) {
       setTimeout(() => onClose(), 100);
    }
  };

  return (
    <main className="login-container" aria-label="Login Form">
      <section className="login-tabs" aria-label="Login/Sign Up Tabs">
        <button
          type="button"
          className={`login-tab${isLogin ? ' active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          type="button"
          className={`login-tab${!isLogin ? ' active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>
      </section>
      <h2 className="login-title">
        {isLogin ? 'Login' : 'Create Account'}
      </h2>
      
      {error && (
        <section className="login-error">
          {error}
        </section>
      )}
      
      <form className="login-form" onSubmit={handleSubmit}>
        <section className="form-group">
          <label className="form-label">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            autoComplete="username"
          />
        </section>
        
        <section className="form-group">
          <label className="form-label">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </section>
        
        <button
          type="submit"
          className="login-button"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <section className="login-footer">
        {isLogin ? (
          <>
            Don't have an account?{' '}
            <button
              type="button"
              className="login-switch"
              onClick={() => setIsLogin(false)}
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              className="login-switch"
              onClick={() => setIsLogin(true)}
            >
              Log in
            </button>
          </>
        )}
      </section>
    </main>
  );
};

export default Login;