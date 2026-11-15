import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../constants/theme';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial session check on app start
  useEffect(() => {
    let isCancelled = false;

    const initAuth = async () => {
      try {
        // Attempt to fetch current user session via HttpOnly cookie
        const res = await authService.getCurrentUser();
        if (!isCancelled) {
          if (res && res.user) {
            setUser(res.user);
            socketService.connect();
          } else {
            setUser(null);
            socketService.disconnect();
          }
        }
      } catch (err) {
        // Session invalid or not logged in yet (normal for public visitors)
        if (!isCancelled) {
          socketService.disconnect();
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const handleSessionExpired = () => {
      socketService.disconnect();
      setUser(null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("bloodward:session-expired", handleSessionExpired);
    }

    return () => {
      isCancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("bloodward:session-expired", handleSessionExpired);
      }
    };
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    socketService.connect();
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout failed or offline:', err);
    } finally {
      socketService.disconnect();
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };


  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login: loginUser,
    logout: logoutUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;