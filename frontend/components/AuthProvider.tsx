"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi, getAccessToken, setAccessToken } from "../lib/apiClient";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for logout events triggered by API client
    const handleLogoutEvent = () => {
      setIsAuthenticated(false);
      setAccessToken(null);
      if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    };
    window.addEventListener("auth:logout", handleLogoutEvent);

    return () => window.removeEventListener("auth:logout", handleLogoutEvent);
  }, [pathname, router]);

  useEffect(() => {
    // On mount, try to refresh token to see if we're logged in
    async function initAuth() {
      if (pathname.startsWith("/f/")) {
        // Public flow doesn't need admin auth
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchApi("/api/admin/refresh", { method: "POST" });
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
        if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    initAuth();
  }, [pathname, router]);

  const login = (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    try {
      await fetchApi("/api/admin/logout", { method: "POST" });
    } catch (e) {
      // Ignore
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
      router.push("/admin/login");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
