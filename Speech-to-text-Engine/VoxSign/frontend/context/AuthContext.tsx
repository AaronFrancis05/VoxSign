"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import api from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  avatar?: string;
  emailVerified?: boolean;
  userType?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const session = await authClient.getSession();
        if (cancelled) return;

        if (session?.data?.user) {
          const naUser = session.data.user;
          const userData: User = {
            id: naUser.id,
            email: naUser.email || "",
            name: naUser.name || undefined,
            fullName: naUser.name || undefined,
            avatar: naUser.image || undefined,
            emailVerified: naUser.emailVerified || false,
          };

          setUser(userData);
          localStorage.setItem("voxsign_user", JSON.stringify(userData));

          api.post("/auth/me", {}).catch(() => {});
        } else {
          setUser(null);
          localStorage.removeItem("voxsign_user");
        }
      } catch {
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSession();

    return () => { cancelled = true; };
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("voxsign_user", JSON.stringify(userData));
    localStorage.setItem("voxsign_token", token);
  };

  const clearAuthCookies = () => {
    const cookies = [
      "__Secure-neon-auth.session_token",
      "__Secure-neon-auth.local.session_data",
      "__Secure-neon-auth.session_challange",
      "neon-auth.session_token",
      "neon-auth.local.session_data",
      "neon-auth.session_challange",
    ];
    cookies.forEach((name) => {
      document.cookie = `${name}=; path=/; Secure; Max-Age=0`;
      document.cookie = `${name}=; path=/; Max-Age=0`;
    });
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // proceed even if sign-out API call fails
    }
    clearAuthCookies();
    setUser(null);
    localStorage.removeItem("voxsign_user");
    localStorage.removeItem("voxsign_token");
    window.location.href = "/login";
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem("voxsign_user", JSON.stringify(updated));
      return updated;
    });
  };

  const refreshSession = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        const naUser = session.data.user;
        const userData: User = {
          id: naUser.id,
          email: naUser.email || "",
          name: naUser.name || undefined,
          fullName: naUser.name || undefined,
          avatar: naUser.image || undefined,
          emailVerified: naUser.emailVerified || false,
        };
        setUser(userData);
        localStorage.setItem("voxsign_user", JSON.stringify(userData));

        api.post("/auth/me", {}).catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
