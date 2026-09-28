import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try{
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  // Register function
  const register = (username, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      return false;
    }
    
    // Create new user
    const newUser = { 
      id: Date.now().toString(),
      username, 
      password,
      createdAt: new Date().toISOString()
    };
    
    // Add to existing list and save
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log in the new user
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return true;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      isLoading,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};