import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px',
  },
  code: {
    fontSize: '96px',
    fontWeight: 'bold',
    color: '#ccc',
    margin: '0',
  },
  message: {
    fontSize: '24px',
    color: '#333',
    margin: '16px 0',
  },
  link: {
    fontSize: '16px',
    color: '#1976d2',
    textDecoration: 'none',
    marginTop: '12px',
  },
};

function NotFoundPage() {
  return (
    <div style={styles.container}>
      <p style={styles.code}>404</p>
      <p style={styles.message}>Trang không tồn tại</p>
      <Link to="/dashboard" style={styles.link}>
        Quay về trang chủ
      </Link>
    </div>
  );
}

export default NotFoundPage;
