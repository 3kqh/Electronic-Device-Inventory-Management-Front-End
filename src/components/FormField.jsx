import React from 'react';

const styles = {
  container: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
  },
  required: {
    color: '#d32f2f',
    marginLeft: 2,
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: 80,
    resize: 'vertical',
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: '#d32f2f',
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
