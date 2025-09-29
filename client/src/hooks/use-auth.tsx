import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser, AuthState, authService } from "@/lib/auth";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setState({
              user,
              token,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { user, token } = await authService.login(username, password);
      setState({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
