/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { NewChatPage } from './pages/NewChatPage';
import { ChatPage } from './pages/ChatPage';
import { TestPage } from './pages/TestPage';
import { KeynotePage } from './pages/KeynotePage';
import { AppSelectionPage } from './pages/AppSelectionPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminProvidersPage } from './pages/admin/AdminProvidersPage';
import { ChatProvider } from './components/ChatProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, AuthGuard, useAuth } from './components/AuthProvider';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/study/new" replace />;
    return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/select-app" element={
                <AdminGuard>
                  <AppSelectionPage />
                </AdminGuard>
              } />

              <Route path="/admin" element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }>
                <Route index element={<Navigate to="users" replace />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="ai-providers" element={<AdminProvidersPage />} />
              </Route>

              {/* Study nested routes - Protected */}
              <Route path="/study/new" element={
                <AuthGuard>
                  <NewChatPage />
                </AuthGuard>
              } />
              <Route path="/study/:conversation_id" element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              } />
              <Route path="/study/:conversation_id/test" element={
                <AuthGuard>
                  <TestPage />
                </AuthGuard>
              } />
              <Route path="/study/:conversation_id/keynotes/:message_id" element={
                <AuthGuard>
                  <KeynotePage />
                </AuthGuard>
              } />
              
              {/* Fallbacks */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
