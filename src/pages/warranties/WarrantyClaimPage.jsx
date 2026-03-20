import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllWarrantyClaims,
  createWarrantyClaim,
  deleteWarrantyClaim,
  getAllWarranties,
} from '../../api/warrantyService';
import DataTable from '../../components/DataTable';
import FormField from '../../components/FormField';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNotification } from '../../components/Notification';
import { useAuth } from '../../context/AuthContext';

const styles = {
  container: { padding: '24px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
  },
  title: { fontSize: '24px', fontWeight: 600, color: '#333', margin: 0 },
  addButton: {
    padding: '10px 20px', backgroundColor: '#1976d2', color: '#fff',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
  },
  error: {
    color: '#d32f2f', padding: '16px', backgroundColor: '#fdecea',
    borderRadius: '4px', marginBottom: '16px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  },
  retryButton: {
    padding: '6px 16px', backgroundColor: '#d32f2f', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
  },
  formOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 10000,
  },
  formDialog: {
    backgroundColor: '#fff', borderRadius: 8, padding: '24px 28px',
    minWidth: 420, maxWidth: 560, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    maxHeight: '80vh', overflowY: 'auto',
  },
  formTitle: { margin: '0 0 20px 0', fontSize: 18, fontWeight: 600, color: '#212121' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: {
    padding: '8px 18px', fontSize: 14, border: '1px solid #bdbdbd',
    borderRadius: 4, backgroundColor: '#fff', color: '#424242', cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 18px', fontSize: 14, border: 'none', borderRadius: 4,
    backgroundColor: '#1976d2', color: '#fff', cursor: 'pointer',
  },
  deleteBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #d32f2f',
    borderRadius: 4, backgroundColor: '#fff', color: '#d32f2f', cursor: 'pointer',
  },
  badge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 12,
    fontSize: 12, fontWeight: 600,
  },
  deviceInfo: {
    padding: '10px 14px', backgroundColor: '#f5f5f5', borderRadius: 4,
    marginBottom: 16, fontSize: 13, color: '#555',
  },
  deviceInfoLabel: { fontWeight: 600, color: '#333', marginBottom: 4 },
};

const claimStatusColors = {
  filed: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  in_review: { backgroundColor: '#fff3e0', color: '#e65100' },
  resolved: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  rejected: { backgroundColor: '#ffebee', color: '#c62828' },
};

const claimStatusLabels = {
  filed: 'Đã nộp',
  in_review: 'Đang xem xét',
  resolved: 'Đã giải quyết',
  rejected: 'Từ chối',
};

const emptyClaimForm = {
  warrantyId: '',
  issueDescription: '',
  filedDate: '',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  } catch {
    return '—';
  }
}

function getDeviceName(claim) {
  if (claim.deviceId && typeof claim.deviceId === 'object') {
    return claim.deviceId.name || claim.deviceId.assetTag || '—';
  }
  return '—';
}

function getWarrantyLabel(warranty) {
  const deviceName = warranty.deviceId && typeof warranty.deviceId === 'object'
    ? (warranty.deviceId.name || warranty.deviceId.assetTag || '')
    : '';
  const provider = warranty.provider || '';
  if (deviceName && provider) return `${deviceName} — ${provider}`;
  return deviceName || provider || warranty._id || warranty.id || '—';
}

export default function WarrantyClaimPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'inventory_manager';

  const [claims, setClaims] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyClaimForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selectedWarranty = warranties.find(
    (w) => (w._id || w.id) === form.warrantyId
  );

  const columns = [
    {
      key: 'claimNumber',
      label: 'Mã yêu cầu',
      render: (val, row) => val || row._id?.slice(-6)?.toUpperCase() || '—',
    },
    {
      key: 'deviceId',
      label: 'Thiết bị',
      render: (_, row) => getDeviceName(row),
    },
    {
      key: 'issue',
      label: 'Mô tả sự cố',
      render: (val) => val || '—',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val) => {
        const colors = claimStatusColors[val] || { backgroundColor: '#f5f5f5', color: '#757575' };
        return (
          <span style={{ ...styles.badge, ...colors }}>
            {claimStatusLabels[val] || val || '—'}
          </span>
        );
      },
    },
    {
      key: 'resolution',
      label: 'Kết quả xử lý',
      render: (val) => val || '—',
    },
    ...(canEdit
      ? [{
          key: '_actions',
          label: 'Hành động',
          render: (_, row) => (
            <button
              style={styles.deleteBtn}
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            >
              Xóa
            </button>
          ),
        }]
      : []),
  ];

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllWarrantyClaims();
      const data = res.data;
      const list = data.claims || data.data || data || [];
      setClaims(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu bảo hành');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarranties = useCallback(async () => {
    try {
      const res = await getAllWarranties({ limit: 1000 });
      const data = res.data;
      const list = data.warranties || data.data || data || [];
      setWarranties(Array.isArray(list) ? list : []);
    } catch {
      // Silently fail — warranty dropdown will be empty
    }
  }, []);

  useEffect(() => {
    fetchClaims();
    fetchWarranties();
  }, [fetchClaims, fetchWarranties]);

  const handleAdd = () => {
    setForm({ ...emptyClaimForm });
    setFormErrors({});
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.warrantyId) errs.warrantyId = 'Vui lòng chọn bảo hành';
    if (!form.issueDescription.trim()) errs.issueDescription = 'Mô tả sự cố là bắt buộc';
    if (!form.filedDate) errs.filedDate = 'Ngày nộp là bắt buộc';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        warrantyId: form.warrantyId,
        issue: form.issueDescription.trim(),
        filedDate: form.filedDate,
      };
      if (selectedWarranty) {
        const devId = selectedWarranty.deviceId && typeof selectedWarranty.deviceId === 'object'
          ? (selectedWarranty.deviceId._id || selectedWarranty.deviceId.id)
          : selectedWarranty.deviceId;
        if (devId) payload.deviceId = devId;
      }
      await createWarrantyClaim(payload);
      showNotification({ type: 'success', message: 'Tạo yêu cầu bảo hành thành công' });
      setShowForm(false);
      fetchClaims();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi tạo yêu cầu bảo hành';
      showNotification({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWarrantyClaim(deleteTarget._id || deleteTarget.id);
      showNotification({ type: 'success', message: 'Xóa yêu cầu bảo hành thành công' });
      setDeleteTarget(null);
      fetchClaims();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa yêu cầu bảo hành' });
      setDeleteTarget(null);
    }
  };

  const warrantyOptions = warranties.map((w) => ({
    value: w._id || w.id,
    label: getWarrantyLabel(w),
  }));

  if (loading && claims.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Yêu cầu bảo hành</h1>
        {canEdit && (
          <button style={styles.addButton} onClick={handleAdd}>Thêm yêu cầu bảo hành</button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchClaims}>Thử lại</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={claims}
        loading={loading}
      />

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>Thêm yêu cầu bảo hành</h2>
            <FormField
              label="Bảo hành"
              name="warrantyId"
              type="select"
              value={form.warrantyId}
              onChange={handleFormChange}
              options={warrantyOptions}
              error={formErrors.warrantyId}
              required
            />
            {selectedWarranty && (
              <div style={styles.deviceInfo}>
                <div style={styles.deviceInfoLabel}>Thông tin thiết bị</div>
                <div>
                  Thiết bị: {selectedWarranty.deviceId && typeof selectedWarranty.deviceId === 'object'
                    ? (selectedWarranty.deviceId.name || selectedWarranty.deviceId.assetTag || '—')
                    : '—'}
                </div>
                <div>Nhà cung cấp: {selectedWarranty.provider || '—'}</div>
                <div>Trạng thái: {claimStatusLabels[selectedWarranty.status] || selectedWarranty.status || '—'}</div>
                <div>Hiệu lực: {formatDate(selectedWarranty.startDate)} — {formatDate(selectedWarranty.endDate)}</div>
              </div>
            )}
            <FormField
              label="Mô tả sự cố"
              name="issueDescription"
              type="textarea"
              value={form.issueDescription}
              onChange={handleFormChange}
              error={formErrors.issueDescription}
              required
            />
            <FormField
              label="Ngày nộp"
              name="filedDate"
              type="date"
              value={form.filedDate}
              onChange={handleFormChange}
              error={formErrors.filedDate}
              required
            />
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Hủy</button>
              <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa yêu cầu bảo hành "${deleteTarget?.claimNumber || ''}" không?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
