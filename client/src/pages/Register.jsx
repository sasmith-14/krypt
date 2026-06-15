import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import KryptLogo from '../components/KryptLogo';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { username, email, password } = form;

    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { username, email, password });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <KryptLogo size={38} />
          <span className="auth-logo-text">Krypt</span>
        </div>

        <h1 className="auth-heading">Create an account</h1>
        <p className="auth-sub">Join Krypt — your messages stay private.</p>

        {error   && <div className="alert alert-error"  role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              className="form-input"
              type="text"
              name="username"
              placeholder="choose a username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              name="password"
              placeholder="min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
