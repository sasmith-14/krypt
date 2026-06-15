import { Link } from 'react-router-dom';
import KryptLogo from '../components/KryptLogo';

export default function Landing() {
  return (
    <div className="landing">

      <nav className="landing-nav">
        <Link to="/" className="landing-nav-logo">
          <KryptLogo size={32} />
          Krypt
        </Link>
        <div className="landing-nav-actions">
          <Link to="/login">
            <button className="btn btn-ghost">Sign in</button>
          </Link>
          <Link to="/register">
            <button className="btn btn-primary">Get started</button>
          </Link>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-badge">
          <div className="hero-badge-dot" aria-hidden="true" />
          End-to-end encrypted
        </div>

        <h1 className="hero-title">
          Messages that stay{' '}
          <span className="hero-title-gradient">between you.</span>
        </h1>

        <p className="hero-sub">
          Krypt is built on a secure Node.js backend with JWT auth, bcrypt password hashing, rate limiting, and XSS and NoSQL injection protection.
        </p>

        <div className="hero-actions">
          <Link to="/register">
            <button className="btn btn-primary">Start whispering →</button>
          </Link>
          <Link to="/login">
            <button className="btn btn-outline">Sign in</button>
          </Link>
        </div>

        <div className="hero-features">
          <div className="hero-feature">
            <span className="hero-feature-icon">🔒</span>
            AES-GCM 256-bit
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">⚡</span>
            Real-time messaging
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">🚫</span>
            Zero plaintext on server
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">🗝️</span>
            Client-side key derivation
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        © 2026 Krypt · Privacy-first messaging
      </footer>
    </div>
  );
}
