import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const DEMO_CREDS = [
  { role: 'Admin', email: 'admin@enterprise.com', password: 'admin123', badge: 'ADMIN', color: '' },
  { role: 'Host', email: 'host1@enterprise.com', password: 'host123', badge: 'HOST', color: '' },
  { role: 'Visitor', email: 'visitor1@gmail.com', password: 'visitor123', badge: 'VISITOR', color: 'linear-gradient(135deg, #10b981, #3b82f6)' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        const role = localStorage.getItem('vms_role');
        const dest = role === 'admin' ? '/admin/dashboard' : role === 'host' ? '/host/dashboard' : '/visitor/dashboard';
        navigate(dest, { replace: true });
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  const fillCred = (cred: typeof DEMO_CREDS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🏢</div>
        <h1 className="login-title">Enterprise VMS</h1>
        <p className="login-subtitle">Visitor Management & Access Control Platform</p>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-bar">
              <Mail size={14} color="var(--text-muted)" />
              <input
                type="email"
                placeholder="you@enterprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-bar">
              <Lock size={14} color="var(--text-muted)" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner"></span> : '🔐'} {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="demo-creds">
          <div className="demo-creds-title">Demo Credentials</div>
          {DEMO_CREDS.map((cred, i) => (
            <div key={i} className="demo-cred-item" onClick={() => fillCred(cred)}>
              <div className="demo-cred-role-badge">{cred.badge}</div>
              <div className="demo-cred-info">
                <div className="demo-cred-email">{cred.email}</div>
                <div className="demo-cred-pass">Password: {cred.password}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to fill →</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
          © 2026 Enterprise VMS · Frontend Demo
        </div>
      </div>
    </div>
  );
};

export default Login;
