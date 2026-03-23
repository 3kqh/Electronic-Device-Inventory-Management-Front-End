import React from 'react';

const spinnerKeyframes = `
@keyframes edims-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0',
  },
  spinner: {
    width: 42,
    height: 42,
    border: '4px solid #d7e0d3',
    borderTop: '4px solid var(--accent-2)',
    borderRadius: '50%',
    animation: 'edims-spin 0.8s linear infinite',
    boxShadow: '0 0 0 4px rgba(47, 143, 99, 0.08)',
  },
};

export default function LoadingSpinner() {
  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.spinner} role="status" aria-label="Đang tải" />
    </div>
  );
}
