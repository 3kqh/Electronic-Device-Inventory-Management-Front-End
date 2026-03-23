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
  success: { background: 'rgba(233, 252, 241, 0.92)', border: '#2f8f63', text: '#1f6244' },
  error:   { background: 'rgba(255, 235, 232, 0.92)', border: '#d64b3b', text: '#9f3226' },
};

const styles = {
  container: {
    position: 'fixed',
    top: 18,
    right: 18,
    zIndex: 9999,
    minWidth: 280,
    maxWidth: 420,
    padding: '13px 16px',
    borderRadius: 12,
    boxShadow: '0 14px 28px rgba(20, 35, 28, 0.16)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    fontFamily: 'inherit',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    backdropFilter: 'blur(3px)',
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
        border: `1px solid ${colors.border}66`,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      <span>{notification.message}</span>
    </div>
  );
}
