import React from 'react';

const styles = {
  container: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '0.01em',
  },
  required: {
    color: 'var(--danger)',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    padding: '11px 13px',
    fontSize: 14,
    border: '1px solid var(--border-soft)',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fcfdf9',
    color: 'var(--text-primary)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  inputError: {
    borderColor: 'var(--danger)',
    boxShadow: '0 0 0 3px rgba(214, 75, 59, 0.14)',
  },
  select: {
    width: '100%',
    padding: '11px 13px',
    fontSize: 14,
    border: '1px solid var(--border-soft)',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fcfdf9',
    color: 'var(--text-primary)',
  },
  textarea: {
    width: '100%',
    padding: '11px 13px',
    fontSize: 14,
    border: '1px solid var(--border-soft)',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fcfdf9',
    color: 'var(--text-primary)',
    minHeight: 80,
    resize: 'vertical',
  },
  error: {
    marginTop: 7,
    fontSize: 12,
    color: 'var(--danger)',
    fontWeight: 500,
  },
};

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  options = [],
  required = false,
}) {
  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47, 143, 99, 0.14)';
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.boxShadow = 'none';
          }}
          style={{ ...styles.select, ...(error ? styles.inputError : {}) }}
        >
          <option value="">-- Chọn --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--accent-2)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47, 143, 99, 0.14)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--border-soft)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          style={{ ...styles.textarea, ...(error ? styles.inputError : {}) }}
        />
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--accent-2)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47, 143, 99, 0.14)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--border-soft)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
    );
  };

  return (
    <div style={styles.container}>
      {label && (
        <label htmlFor={name} style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
      )}
      {renderInput()}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}
