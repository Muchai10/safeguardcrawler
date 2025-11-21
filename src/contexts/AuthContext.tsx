import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('demo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - replace with real auth when Lovable Cloud is enabled
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      email,
      role: email.includes('admin') ? 'admin' : 'user',
      name: email.split('@')[0]
    };
    
    setUser(mockUser);
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    return true;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Demo signup - replace with real auth when Lovable Cloud is enabled
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role: 'user',
      name
    };
    
    setUser(mockUser);
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user
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
