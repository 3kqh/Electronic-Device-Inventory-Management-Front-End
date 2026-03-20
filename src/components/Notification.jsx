import React, { useState, useEffect, useCallback } from 'react';

// ── Module-level notification state ──────────────────────────────
let _listener = null;

/**
 * Show a toast notification.
 * @param {{ type: 'success' | 'error', message: string }} opts
 */
export function showNotification({ type, message }) {
  if (_listener) {
    _listener({ type, message });
  }
}

// ── Styles ───────────────────────────────────────────────────────
const typeColors = {
  success: { background: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
  error:   { background: '#ffebee', border: '#f44336', text: '#c62828' },
};

const styles = {
  container: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999,
    minWidth: 280,
    maxWidth: 420,
    padding: '14px 20px',
    borderRadius: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    fontFamily: 'inherit',
    transition: 'opacity 0.3s ease',
  },
};

// ── Component ────────────────────────────────────────────────────
export default function Notification() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  const handleNotification = useCallback((n) => {
    setNotification(n);
    setVisible(true);
  }, []);

  // Register as the global listener
  useEffect(() => {
    _listener = handleNotification;
    return () => { _listener = null; };
  }, [handleNotification]);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [visible, notification]);

  if (!visible || !notification) return null;

  const colors = typeColors[notification.type] || typeColors.error;

  return (
    <div
      role="alert"
      data-testid="notification"
      data-type={notification.type}
      style={{
        ...styles.container,
        backgroundColor: colors.background,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      <span>{notification.message}</span>
    </div>
  );
}
