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
    width: 40,
    height: 40,
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    animation: 'edims-spin 0.8s linear infinite',
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
