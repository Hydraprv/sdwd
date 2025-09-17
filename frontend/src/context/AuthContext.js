import React, { createContext, useContext, useState } from 'react';
import { mockUser } from '../mock';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({ ...mockUser, isAuthenticated: true });
      setIsLoading(false);
    }, 1000);
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({ 
        ...mockUser, 
        username, 
        email, 
        isAuthenticated: true 
      });
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser({ ...mockUser, isAuthenticated: false });
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: user.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};