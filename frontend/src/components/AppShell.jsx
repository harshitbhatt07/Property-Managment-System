import React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from '../api';
import AuthForm from './AuthForm';
import DashboardView from './DashboardView';

export default function AppShell() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChecking(false);
      return;
    }

    api('/auth/me')
      .then((profile) => {
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (checking) {
    return <div className="page-loader"><div className="spinner" /></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <AuthForm mode="login" onAuth={login} />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <AuthForm mode="register" onAuth={login} />} />
      <Route path="/" element={user ? <DashboardView user={user} onLogout={logout} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
    </Routes>
  );
}
