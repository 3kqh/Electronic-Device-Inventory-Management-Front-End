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
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 24,
    fontWeight: 600,
    color: '#1976d2',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontWeight: 500,
    fontSize: 14,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px 0',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#1976d2',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginTop: 8,
  },
  buttonDisabled: {
    width: '100%',
    padding: '12px 0',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#90caf9',
    border: 'none',
    borderRadius: 4,
    cursor: 'not-allowed',
    marginTop: 8,
  },
  error: {
    backgroundColor: '#fdecea',
    color: '#d32f2f',
    padding: '10px 14px',
    borderRadius: 4,
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
    border: '2px solid rgba(255,255,255,0.4)',
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
        <h1 style={styles.title}>Đăng nhập</h1>

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
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
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
