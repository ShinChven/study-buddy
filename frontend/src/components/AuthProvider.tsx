import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UserProfile {
    email: string;
    displayName: string;
    avatarUrl?: string;
    userId: string;
    isAdmin?: boolean;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    login: (email: string, password: string) => Promise<UserProfile>;
    register: (email: string, password: string, displayName: string) => Promise<UserProfile>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const savedUser = localStorage.getItem('auth_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
            apiService.setToken(savedToken);
        }
        return savedToken;
    });

    // No longer need useEffect for initial state as it is handled in useState initializer
    useEffect(() => {
        // This is still useful if we want to add cross-tab sync or token validation logic later
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiService.login(email, password);
        const { token, ...profile } = response;
        setToken(token);
        setUser(profile);
        apiService.setToken(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(profile));
        return profile;
    };

    const register = async (email: string, password: string, displayName: string) => {
        const response = await apiService.register(email, password, displayName);
        const { token, ...profile } = response;
        setToken(token);
        setUser(profile);
        apiService.setToken(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(profile));
        return profile;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        apiService.setToken("");
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            register, 
            logout, 
            isAuthenticated: !!token,
            isAdmin: !!user?.isAdmin
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

import { Navigate } from 'react-router-dom';
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};
