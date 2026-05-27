"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  defaultRole: string;
  phone?: string | null;
  avatarUrl?: string | null;
  memberships?: { organizationId: string; role: string; status: string }[];
};

type AuthContextType = {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Schedule silent refresh before token expires
  const scheduleRefresh = useCallback((expiresInSeconds: number) => {
    // Refresh 1 minute before expiration (or half time if expiry is very short)
    const refreshDelayMs = Math.max((expiresInSeconds - 60) * 1000, 10000);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          scheduleRefresh(data.expiresIn || 900);
        } else {
          // Token compromised or expired
          handleLogoutCleanup();
        }
      } catch (err) {
        console.error("Silent refresh error:", err);
      }
    }, refreshDelayMs);

    return () => clearTimeout(timer);
  }, []);

  const handleLogoutCleanup = () => {
    setUser(null);
    setAccessToken(null);
    setIsLoading(false);
  };

  // Bootstrap session on app mount
  useEffect(() => {
    let activeTimerClearup: (() => void) | undefined;

    async function bootstrapSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAccessToken(data.accessToken);
          activeTimerClearup = scheduleRefresh(data.expiresIn || 900);
        }
      } catch (err) {
        console.error("Session bootstrap failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapSession();

    return () => {
      if (activeTimerClearup) activeTimerClearup();
    };
  }, [scheduleRefresh]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      scheduleRefresh(data.expiresIn || 900);
      router.push("/dashboard");
    } catch (error) {
      handleLogoutCleanup();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch (err) {
      console.error("Logout failed on server:", err);
    } finally {
      handleLogoutCleanup();
      router.push("/");
    }
  };

  // Fetch wrapper that automatically appends Bearer token and handles 401 retries
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response = await fetch(url, { ...options, headers });

    // Handle token expired (401) on the fly
    if (response.status === 401) {
      try {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAccessToken(data.accessToken);
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          // Retry the request with new token
          response = await fetch(url, { ...options, headers });
        } else {
          handleLogoutCleanup();
        }
      } catch (err) {
        console.error("Fetch auth token auto-refresh failed:", err);
        handleLogoutCleanup();
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, fetchWithAuth }}>
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
