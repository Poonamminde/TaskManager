import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api from '../api/axios';
import type { User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // true while checking session

  // ── Re-hydrate session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get<{ success: true; user: User }>('/auth/me');
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ success: true; user: User }>('/auth/login', {
      email,
      password,
    });
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ success: true; user: User }>('/auth/register', {
      name,
      email,
      password,
    });
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
