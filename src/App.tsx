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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Study nested routes */}
        <Route path="/study/new" element={<NewChatPage />} />
        <Route path="/study/:conversation_id" element={<ChatPage />} />
        <Route path="/study/:conversation_id/test" element={<TestPage />} />
        
        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
