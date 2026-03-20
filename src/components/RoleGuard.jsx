import { useAuth } from '../context/AuthContext';

function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();

  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: '#e74c3c',
        fontSize: '1.2rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
        Truy cập bị từ chối
      </h2>
      <p style={{ color: '#666', fontSize: '1rem' }}>
        Bạn không có quyền truy cập trang này.
      </p>
    </div>
  );
}

export default RoleGuard;
