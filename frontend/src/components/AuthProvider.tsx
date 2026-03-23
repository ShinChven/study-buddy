import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { getSessions } from '../services/storage';

interface UserProfile {
    email: string;
    displayName: string;
    avatarUrl?: string;
    userId: string;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            apiService.setToken(savedToken);
        }
    }, []);

    const syncLocalHistory = async () => {
        const localSessions = getSessions();
        if (localSessions.length > 0) {
            try {
                await apiService.syncConversations(localSessions);
                console.log('Local history synced successfully');
            } catch (err) {
                console.error('Failed to sync local history', err);
            }
        }
    };

    const login = async (email: string, password: string) => {
        const response = await apiService.login(email, password);
        const { token, ...profile } = response;
        setToken(token);
        setUser(profile);
        apiService.setToken(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(profile));
        await syncLocalHistory();
    };

    const register = async (email: string, password: string, displayName: string) => {
        const response = await apiService.register(email, password, displayName);
        const { token, ...profile } = response;
        setToken(token);
        setUser(profile);
        apiService.setToken(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(profile));
        await syncLocalHistory();
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
            isAuthenticated: !!token 
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
