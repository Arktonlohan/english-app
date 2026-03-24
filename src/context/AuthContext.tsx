import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthStatus } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setStatus(user ? 'authenticated' : 'unauthenticated');
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    await authService.updatePreferences(preferences);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      status, 
      login, 
      signUp, 
      loginWithGoogle, 
      logout, 
      forgotPassword,
      updatePreferences,
      isReady
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
