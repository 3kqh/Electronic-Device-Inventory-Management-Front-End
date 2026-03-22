import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleMaintenance } from '../../api/maintenanceService';
import { getAllDevices } from '../../api/deviceService';
import { getAllUsers } from '../../api/userService';
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
    padding: '10px 24px', backgroundColor: '#ff9800', color: '#fff',
    border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 24px', backgroundColor: '#fff', color: '#333',
    border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', cursor: 'pointer',
  },
  error: { color: '#d32f2f', fontSize: '12px', marginTop: '4px' },
};

const typeOptions = [
  { value: 'preventive', label: 'Phòng ngừa' },
  { value: 'corrective', label: 'Sửa chữa' },
  { value: 'other', label: 'Khác' },
];

export default function MaintenanceSchedulePage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ deviceId: '', type: 'preventive', scheduledDate: '', performedBy: '', description: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllDevices()
      .then((res) => {
        const data = res.data;
        setDevices(data.devices || data.data || data || []);
      })
      .catch(() => {});
    getAllUsers()
      .then((res) => {
        const data = res.data;
        setUsers(data.users || data.data || data || []);
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.deviceId) errs.deviceId = 'Vui lòng chọn thiết bị';
    if (!form.scheduledDate) errs.scheduledDate = 'Ngày lên lịch là bắt buộc';
    else if (new Date(form.scheduledDate) < new Date()) errs.scheduledDate = 'Ngày lên lịch phải trong tương lai';
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
      await scheduleMaintenance({
        deviceId: form.deviceId,
        type: form.type,
        scheduledDate: form.scheduledDate,
        performedBy: form.performedBy || undefined,
        description: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      showNotification({ type: 'success', message: 'Đã lên lịch bảo trì thành công' });
      navigate('/maintenance');
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi lên lịch bảo trì' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lên lịch bảo trì</h1>

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
        <label style={styles.label}>Ngày lên lịch *</label>
        <input type="datetime-local" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} style={styles.input} />
        {errors.scheduledDate && <div style={styles.error}>{errors.scheduledDate}</div>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Người thực hiện</label>
        <select name="performedBy" value={form.performedBy} onChange={handleChange} style={styles.select}>
          <option value="">-- Chọn người thực hiện --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.firstName} {u.lastName} ({u.email})
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Mô tả</label>
        <textarea name="description" value={form.description} onChange={handleChange} style={styles.textarea} placeholder="Mô tả công việc bảo trì..." />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Ghi chú</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} style={styles.textarea} placeholder="Ghi chú thêm (tùy chọn)..." />
      </div>

      <div style={styles.actions}>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Lên lịch'}
        </button>
        <button style={styles.cancelBtn} onClick={() => navigate('/maintenance')}>Hủy</button>
      </div>
    </div>
  );
}
