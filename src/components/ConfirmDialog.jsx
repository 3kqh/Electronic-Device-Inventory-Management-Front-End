import React from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: '24px 28px',
    minWidth: 340,
    maxWidth: 480,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    fontFamily: 'inherit',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: 18,
    fontWeight: 600,
    color: '#212121',
  },
  message: {
    margin: '0 0 24px 0',
    fontSize: 14,
    color: '#555',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    padding: '8px 18px',
    fontSize: 14,
    border: '1px solid #bdbdbd',
    borderRadius: 4,
    backgroundColor: '#fff',
    color: '#424242',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '8px 18px',
    fontSize: 14,
    border: 'none',
    borderRadius: 4,
    backgroundColor: '#d32f2f',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={styles.overlay} data-testid="confirm-dialog-overlay" onClick={onCancel}>
      <div
        style={styles.dialog}
        data-testid="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button
            style={styles.cancelBtn}
            onClick={onCancel}
            data-testid="confirm-dialog-cancel"
          >
            Hủy
          </button>
          <button
            style={styles.confirmBtn}
            onClick={onConfirm}
            data-testid="confirm-dialog-confirm"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
