import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assignDevice, transferDevice } from '../../api/assignmentService';
import { getAllDevices } from '../../api/deviceService';
import { getAllUsers } from '../../api/userService';
import FormField from '../../components/FormField';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNotification } from '../../components/Notification';
import { useAuth } from '../../context/AuthContext';

const styles = {
  container: { padding: '24px', maxWidth: 600 },
  title: { fontSize: '24px', fontWeight: 600, color: '#333', margin: '0 0 24px 0' },
  formActions: { display: 'flex', gap: 10, marginTop: 20 },
  cancelBtn: {
    padding: '10px 20px', fontSize: 14, border: '1px solid #bdbdbd',
    borderRadius: 4, backgroundColor: '#fff', color: '#424242', cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px', fontSize: 14, border: 'none', borderRadius: 4,
    backgroundColor: '#1976d2', color: '#fff', cursor: 'pointer',
  },
  info: { fontSize: 14, color: '#555', marginBottom: 16 },
};

export default function AssignmentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const mode = searchParams.get('mode') || 'assign'; // 'assign' or 'transfer'
  const assignmentId = searchParams.get('assignmentId') || '';
  const deviceName = searchParams.get('deviceName') || '';

  const isTransfer = mode === 'transfer';

  const [form, setForm] = useState({ deviceId: '', userId: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchDropdownData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [devRes, usrRes] = await Promise.all([getAllDevices({ limit: 1000 }), getAllUsers()]);
      const devData = devRes.data;
      setDevices(devData.devices || devData.data || devData || []);
      const usrData = usrRes.data;
      setUsers(usrData.users || usrData.data || usrData || []);
    } catch {
      showNotification({ type: 'error', message: 'Không thể tải dữ liệu' });
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchDropdownData(); }, [fetchDropdownData]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!isTransfer && !form.deviceId) errs.deviceId = 'Vui lòng chọn thiết bị';
    if (!form.userId) errs.userId = isTransfer ? 'Vui lòng chọn người nhận mới' : 'Vui lòng chọn người nhận';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isTransfer && assignmentId) {
        await transferDevice(assignmentId, { newUserId: form.userId, notes: form.notes });
        showNotification({ type: 'success', message: 'Chuyển giao thiết bị thành công' });
      } else {
        await assignDevice({
          deviceId: form.deviceId,
          assignedTo: { userId: form.userId },
          notes: form.notes,
        });
        showNotification({ type: 'success', message: 'Phân công thiết bị thành công' });
      }
      navigate('/assignments');
    } catch (err) {
      showNotification({
        type: 'error',
        message: err.response?.data?.message || (isTransfer ? 'Lỗi khi chuyển giao thiết bị' : 'Lỗi khi phân công thiết bị'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deviceOptions = devices.map((d) => ({
    value: d._id || d.id,
    label: `${d.name || ''} (${d.assetTag || d.serialNumber || ''})`,
  }));

  const userOptions = users.map((u) => ({
    value: u._id || u.id,
    label: `${u.firstName || ''} ${u.lastName || ''} (${u.email || ''})`,
  }));

  if (loadingData) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {isTransfer ? 'Chuyển giao thiết bị' : 'Phân công thiết bị'}
      </h1>

      {isTransfer && deviceName && (
        <p style={styles.info}>Thiết bị: <strong>{deviceName}</strong></p>
      )}

      {!isTransfer && (
        <FormField
          label="Thiết bị" name="deviceId" type="select"
          value={form.deviceId} onChange={handleChange}
          error={formErrors.deviceId} options={deviceOptions} required
        />
      )}

      <FormField
        label={isTransfer ? 'Người nhận mới' : 'Người nhận'}
        name="userId" type="select"
        value={form.userId} onChange={handleChange}
        error={formErrors.userId} options={userOptions} required
      />

      <FormField
        label="Ghi chú" name="notes" type="textarea"
        value={form.notes} onChange={handleChange}
      />

      <div style={styles.formActions}>
        <button style={styles.cancelBtn} onClick={() => navigate('/assignments')}>Hủy</button>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang lưu...' : (isTransfer ? 'Chuyển giao' : 'Phân công')}
        </button>
      </div>
    </div>
  );
}
