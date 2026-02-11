import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from './types';

// Mock types for Session and User
interface User {
  id: string;
  app_metadata: {
    provider?: string;
  };
  user_metadata: {
    role?: UserRole;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
  [key: string]: any;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
  token_type: string;
  expires_in: number;
  expires_at: number;
}


// --- MODO DEMO ---
// Poner en `true` para habilitar un usuario y sesión falsos para desarrollo y demostración.
// Esto evita la necesidad de tener un backend de autenticación real funcionando.
const DEMO_MODE = true;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: () => Promise<any>;
  signUp: () => Promise<any>;
  signOut: () => Promise<any>;
  switchUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para cambiar de rol de usuario (solo para el modo demo).
  // Permite simular la vista de diferentes tipos de usuario sin necesidad de iniciar/cerrar sesión.
  const switchUserRole = (role: UserRole) => {
    if (DEMO_MODE && user) {
      const mockUser: User = {
        ...user,
        id: `demo-${role}-id`,
        user_metadata: { ...user.user_metadata, role: role },
      };
      setUser(mockUser);
    }
  };
  
  // Efecto para inicializar la sesión falsa cuando el modo demo está activado.
  useEffect(() => {
    if (DEMO_MODE) {
      const initialRole: UserRole = 'student';
      const mockUser: User = {
        id: `demo-${initialRole}-id`,
        app_metadata: { provider: 'email' },
        user_metadata: { role: initialRole },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      const mockSession: Session = {
        access_token: 'demo-access-token',
        refresh_token: 'demo-refresh-token',
        user: mockUser,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };
      setSession(mockSession);
      setUser(mockUser);
      setLoading(false);
    }
  }, []);

  const signIn = async () => {
    if (DEMO_MODE) return Promise.resolve({ user: session?.user, session });
    return Promise.resolve({ user: null, session: null });
  };

  const signUp = async () => {
    if (DEMO_MODE) return Promise.resolve({ user: session?.user, session });
    return Promise.resolve({ user: null, session: null });
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      return Promise.resolve();
    }
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, switchUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de autenticación.
// Proporciona una forma limpia y segura de obtener los datos de sesión y usuario en cualquier componente.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
