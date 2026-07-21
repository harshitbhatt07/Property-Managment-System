import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { api } from '../api';

export default function AuthForm({ mode, onAuth }) {
  const navigate = useNavigate();
  const login = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
      if (data.pending) {
        setSuccess(data.message);
        setForm({ name: '', email: '', password: '' });
        return;
      }
      onAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page simple-auth">
      <section className="auth-panel">
        <div className="auth-card">
          <h2>{login ? 'Sign in' : 'Agent registration'}</h2>
          <p className="muted">{login ? 'Access your workspace securely.' : 'Your account will be reviewed by the admin before access is granted.'}</p>
          {error && <div className="alert">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={submit}>
            {!login && <Field label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />}
            <Field label="Email address" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
            <button className="primary-btn full" disabled={loading}>
              {loading ? 'Please wait...' : login ? 'Sign in' : 'Send registration request'}
            </button>
          </form>
          <p className="switch-text">
            {login ? "Don't have an account? " : 'Already registered? '}
            <Link to={login ? '/register' : '/login'}>{login ? 'Register' : 'Sign in'}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} min={type === 'number' ? 0 : undefined} />
    </label>
  );
}
