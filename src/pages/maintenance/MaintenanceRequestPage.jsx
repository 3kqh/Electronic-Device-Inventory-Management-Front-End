import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestMaintenance } from '../../api/maintenanceService';
import { getAllDevices } from '../../api/deviceService';
import { showNotification } from '../../components/Notification';

const styles = {
  container: { padding: '24px', maxWidth: '600px' },
  title: { fontSize: '24px', fontWeight: 600, color: '#333', marginBottom: '24px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#333' },
  input: {
    width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #ccc',
    borderRadius: '4px', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #ccc',
    borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fff',
  },
  textarea: {
    width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #ccc',
    borderRadius: '4px', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical',
  },
  actions: { display: 'flex', gap: '10px', marginTop: '20px' },
  submitBtn: {
    padding: '10px 24px', backgroundColor: '#1976d2', color: '#fff',
    border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 24px', backgroundColor: '#fff', color: '#333',
    border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', cursor: 'pointer',
  },
  error: { color: '#d32f2f', fontSize: '12px', marginTop: '4px' },
};

const typeOptions = [
  { value: 'corrective', label: 'Sửa chữa' },
  { value: 'preventive', label: 'Phòng ngừa' },
  { value: 'other', label: 'Khác' },
];

export default function MaintenanceRequestPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ deviceId: '', type: 'corrective', description: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllDevices()
      .then((res) => {
        const data = res.data;
        setDevices(data.devices || data.data || data || []);
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.deviceId) errs.deviceId = 'Vui lòng chọn thiết bị';
    if (!form.description.trim()) errs.description = 'Mô tả là bắt buộc';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await requestMaintenance({
        deviceId: form.deviceId,
        type: form.type,
        description: form.description.trim(),
        notes: form.notes.trim() || undefined,
      });
      showNotification({ type: 'success', message: 'Yêu cầu bảo trì đã được gửi' });
      navigate('/maintenance');
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi gửi yêu cầu' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Yêu cầu bảo trì</h1>

      <div style={styles.field}>
        <label style={styles.label}>Thiết bị *</label>
        <select name="deviceId" value={form.deviceId} onChange={handleChange} style={styles.select}>
          <option value="">-- Chọn thiết bị --</option>
          {devices.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} {d.serialNumber ? `(${d.serialNumber})` : ''}
            </option>
          ))}
        </select>
        {errors.deviceId && <div style={styles.error}>{errors.deviceId}</div>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Loại bảo trì</label>
        <select name="type" value={form.type} onChange={handleChange} style={styles.select}>
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Mô tả *</label>
        <textarea name="description" value={form.description} onChange={handleChange} style={styles.textarea} placeholder="Mô tả vấn đề cần bảo trì..." />
        {errors.description && <div style={styles.error}>{errors.description}</div>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Ghi chú</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} style={styles.textarea} placeholder="Ghi chú thêm (tùy chọn)..." />
      </div>

      <div style={styles.actions}>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
        <button style={styles.cancelBtn} onClick={() => navigate('/maintenance')}>Hủy</button>
      </div>
    </div>
  );
}
