import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos carga inicial (en una app real, verificaríamos token en localStorage o cookies)
    const checkAuth = async () => {
      // En una implementación real, aquí verificaríamos el token de autenticación
      // Por ahora, simulamos un retraso y luego establecemos un estado no autenticado
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      // Comentamos la línea siguiente para iniciar sin autenticación
      // setIsAuthenticated(true);
      // setUser({ email: 'usuario@ejemplo.com', name: 'Usuario Ejemplo' });
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada real a tu API de autenticación
      // Por ahora, simulamos un login exitoso después de un retraso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulamos respuesta exitosa
      setIsAuthenticated(true);
      setUser({ email, name: email.split('@')[0] });
      
      // En una app real, guardaríamos el token en localStorage o cookies
      // localStorage.setItem('token', 'fake-jwt-token');
    } catch (error) {
      throw new Error('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // localStorage.removeItem('token');
  };

  if (isLoading) {
    return (
      <AuthContext.Provider value={{ isAuthenticated: false, user: null, login, logout, isLoading: true }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
};