import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signIn } from '../../api/authService';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '24px',
    background:
      'radial-gradient(circle at 15% 8%, rgba(212, 185, 61, 0.28) 0, rgba(212, 185, 61, 0) 35%), radial-gradient(circle at 85% 88%, rgba(47, 143, 99, 0.3) 0, rgba(47, 143, 99, 0) 35%), var(--bg-app)',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    boxShadow: '0 18px 42px rgba(25, 43, 33, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(3px)',
    padding: 34,
    width: '100%',
    maxWidth: 430,
  },
  badge: {
    display: 'inline-block',
    marginBottom: 10,
    padding: '5px 10px',
    borderRadius: 999,
    backgroundColor: 'rgba(47, 143, 99, 0.12)',
    color: 'var(--accent-2)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  title: {
    margin: '0 0 6px',
    fontSize: 29,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '0.01em',
  },
  subtitle: {
    margin: '0 0 24px',
    color: 'var(--text-secondary)',
    fontSize: 14,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: 500,
    fontSize: 13,
    color: 'var(--text-primary)',
  },
  input: {
    width: '100%',
    padding: '12px 13px',
    fontSize: 14,
    border: '1px solid var(--border-soft)',
    borderRadius: 12,
    backgroundColor: '#fcfdf9',
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  button: {
    width: '100%',
    padding: '12px 0',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: 'var(--accent-2)',
    boxShadow: '0 8px 20px rgba(47, 143, 99, 0.3)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    marginTop: 8,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  buttonDisabled: {
    width: '100%',
    padding: '12px 0',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#98b8a9',
    border: 'none',
    borderRadius: 12,
    cursor: 'not-allowed',
    marginTop: 8,
  },
  error: {
    backgroundColor: 'rgba(214, 75, 59, 0.12)',
    color: '#a6372a',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(214, 75, 59, 0.25)',
    marginBottom: 16,
    fontSize: 14,
  },
  spinnerWrapper: {
    display: 'inline-block',
    marginRight: 8,
    verticalAlign: 'middle',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.45)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'edims-spin 0.8s linear infinite',
    display: 'inline-block',
  },
};

const spinnerKeyframes = `
@keyframes edims-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn(email, password);
      const { accessToken, user } = res.data;
      login(accessToken, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.card}>
        <span style={styles.badge}>INVENTORY HUB</span>
        <h1 style={styles.title}>Đăng nhập</h1>
        <p style={styles.subtitle}>Quản lý thiết bị điện tử tập trung, nhanh và chính xác.</p>

        {error && <div style={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-2)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47, 143, 99, 0.14)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-soft)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-2)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47, 143, 99, 0.14)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-soft)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 22px rgba(47, 143, 99, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(47, 143, 99, 0.3)';
              }
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinnerWrapper}>
                  <span style={styles.spinner} />
                </span>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
