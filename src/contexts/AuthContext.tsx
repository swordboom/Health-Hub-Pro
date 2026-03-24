import React, { createContext, useContext, useEffect, useState } from "react";
import { ApiError, api, authStorage, type AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Something went wrong.");
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.me();
        setUser(response.user);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          authStorage.clearToken();
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.auth.signUp({ email, password, fullName });
      authStorage.setToken(response.token);
      setUser(response.user);
      return { error: null };
    } catch (error) {
      return { error: toError(error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.auth.signIn({ email, password });
      authStorage.setToken(response.token);
      setUser(response.user);
      return { error: null };
    } catch (error) {
      return { error: toError(error) };
    }
  };

  const signOut = async () => {
    authStorage.clearToken();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>;
};
