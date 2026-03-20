import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { requestMaintenance, scheduleMaintenance, completeMaintenance, getMaintenanceById } from '../../api/maintenanceService';
import { getAllDevices } from '../../api/deviceService';
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
  accessDenied: { padding: 24, color: '#d32f2f', fontSize: 16, fontWeight: 500 },
};

const typeOptions = [
  { value: 'preventive', label: 'Phòng ngừa' },
  { value: 'corrective', label: 'Sửa chữa' },
  { value: 'other', label: 'Khác' },
];

export default function MaintenanceFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const mode = searchParams.get('mode') || 'request';
  const maintenanceId = searchParams.get('maintenanceId') || '';

  const isManager = user?.role === 'admin' || user?.role === 'inventory_manager';

  const [form, setForm] = useState({
    deviceId: '',
    description: '',
    type: '',
    scheduledDate: '',
    completedDate: '',
    cost: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [devices, setDevices] = useState([]);
  const [maintenanceRecord, setMaintenanceRecord] = useState(null);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      if (mode === 'request' || mode === 'schedule') {
        const devRes = await getAllDevices({ limit: 1000 });
        const devData = devRes.data;
        setDevices(devData.devices || devData.data || devData || []);
      }

      if (mode === 'complete' && maintenanceId) {
        const res = await getMaintenanceById(maintenanceId);
        const record = res.data.maintenance || res.data.data || res.data;
        setMaintenanceRecord(record);
      }
    } catch {
      showNotification({ type: 'error', message: 'Không thể tải dữ liệu' });
    } finally {
      setLoadingData(false);
    }
  }, [mode, maintenanceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};

    if (mode === 'request') {
      if (!form.deviceId) errs.deviceId = 'Vui lòng chọn thiết bị';
      if (!form.description.trim()) errs.description = 'Vui lòng nhập mô tả';
    }

    if (mode === 'schedule') {
      if (!form.deviceId) errs.deviceId = 'Vui lòng chọn thiết bị';
      if (!form.type) errs.type = 'Vui lòng chọn loại bảo trì';
      if (!form.scheduledDate) errs.scheduledDate = 'Vui lòng chọn ngày lên lịch';
    }

    if (mode === 'complete') {
      if (!form.completedDate) errs.completedDate = 'Vui lòng chọn ngày hoàn thành';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'request') {
        await requestMaintenance({
          deviceId: form.deviceId,
          description: form.description,
        });
        showNotification({ type: 'success', message: 'Yêu cầu bảo trì thành công' });
      } else if (mode === 'schedule') {
        await scheduleMaintenance({
          deviceId: form.deviceId,
          type: form.type,
          scheduledDate: form.scheduledDate,
          description: form.description,
        });
        showNotification({ type: 'success', message: 'Lên lịch bảo trì thành công' });
      } else if (mode === 'complete' && maintenanceId) {
        await completeMaintenance(maintenanceId, {
          completedDate: form.completedDate,
          cost: form.cost ? Number(form.cost) : undefined,
          notes: form.notes,
        });
        showNotification({ type: 'success', message: 'Hoàn thành bảo trì thành công' });
      }
      navigate('/maintenance');
    } catch (err) {
      showNotification({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi xử lý yêu cầu bảo trì',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Access control: schedule and complete modes require manager role
  if ((mode === 'schedule' || mode === 'complete') && !isManager) {
    return <div style={styles.accessDenied}>Bạn không có quyền truy cập chức năng này.</div>;
  }

  const deviceOptions = devices.map((d) => ({
    value: d._id || d.id,
    label: `${d.name || ''} (${d.assetTag || d.serialNumber || ''})`,
  }));

  const getTitle = () => {
    if (mode === 'schedule') return 'Lên lịch bảo trì';
    if (mode === 'complete') return 'Hoàn thành bảo trì';
    return 'Yêu cầu bảo trì';
  };

  const getSubmitLabel = () => {
    if (mode === 'schedule') return 'Lên lịch';
    if (mode === 'complete') return 'Hoàn thành';
    return 'Gửi yêu cầu';
  };

  const getDeviceDisplay = () => {
    if (!maintenanceRecord) return '—';
    const dev = maintenanceRecord.deviceId;
    if (dev && typeof dev === 'object') {
      return `${dev.name || ''} (${dev.assetTag || dev.serialNumber || ''})`;
    }
    return dev || '—';
  };

  if (loadingData) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{getTitle()}</h1>

      {/* Request mode */}
      {mode === 'request' && (
        <>
          <FormField
            label="Thiết bị" name="deviceId" type="select"
            value={form.deviceId} onChange={handleChange}
            error={formErrors.deviceId} options={deviceOptions} required
          />
          <FormField
            label="Mô tả" name="description" type="textarea"
            value={form.description} onChange={handleChange}
            error={formErrors.description} required
          />
        </>
      )}

      {/* Schedule mode */}
      {mode === 'schedule' && (
        <>
          <FormField
            label="Thiết bị" name="deviceId" type="select"
            value={form.deviceId} onChange={handleChange}
            error={formErrors.deviceId} options={deviceOptions} required
          />
          <FormField
            label="Loại bảo trì" name="type" type="select"
            value={form.type} onChange={handleChange}
            error={formErrors.type} options={typeOptions} required
          />
          <FormField
            label="Ngày lên lịch" name="scheduledDate" type="date"
            value={form.scheduledDate} onChange={handleChange}
            error={formErrors.scheduledDate} required
          />
          <FormField
            label="Mô tả" name="description" type="textarea"
            value={form.description} onChange={handleChange}
          />
        </>
      )}

      {/* Complete mode */}
      {mode === 'complete' && (
        <>
          <p style={styles.info}>Thiết bị: <strong>{getDeviceDisplay()}</strong></p>
          <FormField
            label="Ngày hoàn thành" name="completedDate" type="date"
            value={form.completedDate} onChange={handleChange}
            error={formErrors.completedDate} required
          />
          <FormField
            label="Chi phí" name="cost" type="number"
            value={form.cost} onChange={handleChange}
          />
          <FormField
            label="Ghi chú" name="notes" type="textarea"
            value={form.notes} onChange={handleChange}
          />
        </>
      )}

      <div style={styles.formActions}>
        <button style={styles.cancelBtn} onClick={() => navigate('/maintenance')}>Hủy</button>
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang xử lý...' : getSubmitLabel()}
        </button>
      </div>
    </div>
  );
}
