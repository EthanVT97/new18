import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import './i18n/config';

// Components
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/Dashboard';
import ChatInterface from './components/chat/ChatInterface';
import ChatTemplates from './components/admin/ChatTemplates';
import PrivateRoute from './components/auth/PrivateRoute';
import Dashboard from './components/dashboard/Dashboard';

// Loading component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #001F1F 0%, #003333 100%)',
    color: '#00FF66'
  }}>
    <div className="loading"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/login/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatInterface />
              </PrivateRoute>
            } />
            <Route path="/admin/templates" element={
              <PrivateRoute>
                <ChatTemplates />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
