import React, { useState, useEffect, useCallback } from 'react';
import { getAllWarranties, createWarranty, updateWarranty, deleteWarranty } from '../../api/warrantyService';
import { getAllDevices } from '../../api/deviceService';
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
  actionBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #ccc',
    borderRadius: 4, backgroundColor: '#fff', cursor: 'pointer', marginRight: 6,
  },
  deleteBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #d32f2f',
    borderRadius: 4, backgroundColor: '#fff', color: '#d32f2f', cursor: 'pointer',
  },
  badge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 12,
    fontSize: 12, fontWeight: 600,
  },
};

const statusColors = {
  active: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  expired: { backgroundColor: '#ffebee', color: '#c62828' },
  cancelled: { backgroundColor: '#f5f5f5', color: '#757575' },
};

const statusLabels = {
  active: 'Còn hiệu lực',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
};

const typeLabels = {
  manufacturer: 'Nhà sản xuất',
  extended: 'Mở rộng',
  other: 'Khác',
};

const emptyForm = {
  deviceId: '',
  type: '',
  provider: '',
  startDate: '',
  endDate: '',
  coverage: '',
  cost: '',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  } catch {
    return '—';
  }
}

export default function WarrantyListPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'inventory_manager';

  const [warranties, setWarranties] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    {
      key: 'deviceId',
      label: 'Thiết bị',
      render: (val) => {
        if (val && typeof val === 'object') return val.name || val.assetTag || '—';
        return '—';
      },
    },
    {
      key: 'type',
      label: 'Loại',
      render: (val) => typeLabels[val] || val || '—',
    },
    { key: 'provider', label: 'Nhà cung cấp' },
    {
      key: 'startDate',
      label: 'Ngày bắt đầu',
      render: (val) => formatDate(val),
    },
    {
      key: 'endDate',
      label: 'Ngày kết thúc',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val) => {
        const colors = statusColors[val] || { backgroundColor: '#f5f5f5', color: '#757575' };
        return (
          <span style={{ ...styles.badge, ...colors }}>
            {statusLabels[val] || val || '—'}
          </span>
        );
      },
    },
    ...(canEdit
      ? [{
          key: '_actions',
          label: 'Hành động',
          render: (_, row) => (
            <>
              <button style={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>Sửa</button>
              <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>Xóa</button>
            </>
          ),
        }]
      : []),
  ];

  const fetchWarranties = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllWarranties({ page, limit: pagination.pageSize });
      const data = res.data;
      const list = data.warranties || data.data || data || [];
      setWarranties(Array.isArray(list) ? list : []);
      setPagination((prev) => ({
        ...prev,
        page: data.page || page,
        total: data.total || data.totalCount || list.length || 0,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách bảo hành');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await getAllDevices({ limit: 1000 });
      const data = res.data;
      const list = data.devices || data.data || data || [];
      setDevices(Array.isArray(list) ? list : []);
    } catch {
      // Silently fail — device dropdown will be empty
    }
  }, []);

  useEffect(() => {
    fetchWarranties();
    fetchDevices();
  }, [fetchWarranties, fetchDevices]);

  const handlePageChange = (page) => {
    fetchWarranties(page);
  };

  const handleEdit = (row) => {
    setEditingId(row._id || row.id);
    const deviceIdVal = row.deviceId && typeof row.deviceId === 'object'
      ? (row.deviceId._id || row.deviceId.id || '')
      : (row.deviceId || '');
    setForm({
      deviceId: deviceIdVal,
      type: row.type || '',
      provider: row.provider || '',
      startDate: row.startDate ? row.startDate.substring(0, 10) : '',
      endDate: row.endDate ? row.endDate.substring(0, 10) : '',
      coverage: row.coverage || '',
      cost: row.cost != null ? String(row.cost) : '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormErrors({});
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.deviceId) errs.deviceId = 'Vui lòng chọn thiết bị';
    if (!form.type) errs.type = 'Vui lòng chọn loại bảo hành';
    if (!form.provider.trim()) errs.provider = 'Nhà cung cấp là bắt buộc';
    if (!form.startDate) errs.startDate = 'Ngày bắt đầu là bắt buộc';
    if (!form.endDate) errs.endDate = 'Ngày kết thúc là bắt buộc';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        deviceId: form.deviceId,
        type: form.type,
        provider: form.provider.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        coverage: form.coverage.trim(),
        cost: form.cost ? Number(form.cost) : 0,
      };
      if (editingId) {
        await updateWarranty(editingId, payload);
        showNotification({ type: 'success', message: 'Cập nhật bảo hành thành công' });
      } else {
        await createWarranty(payload);
        showNotification({ type: 'success', message: 'Thêm bảo hành thành công' });
      }
      setShowForm(false);
      fetchWarranties(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi lưu bảo hành';
      showNotification({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWarranty(deleteTarget._id || deleteTarget.id);
      showNotification({ type: 'success', message: 'Xóa bảo hành thành công' });
      setDeleteTarget(null);
      fetchWarranties(pagination.page);
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa bảo hành' });
      setDeleteTarget(null);
    }
  };

  const deviceOptions = devices.map((d) => ({
  value: d._id || d.id,
  label: `${d.name || d.assetTag || d._id} ${d.serialNumber ? `(${d.serialNumber})` : ''}`,
}));

  const typeOptions = [
    { value: 'manufacturer', label: 'Nhà sản xuất' },
    { value: 'extended', label: 'Mở rộng' },
    { value: 'other', label: 'Khác' },
  ];

  if (loading && warranties.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Bảo hành</h1>
        {canEdit && (
          <button style={styles.addButton} onClick={handleAdd}>Thêm bảo hành</button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={() => fetchWarranties(pagination.page)}>Thử lại</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={warranties}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>{editingId ? 'Sửa bảo hành' : 'Thêm bảo hành'}</h2>
            <FormField
              label="Thiết bị"
              name="deviceId"
              type="select"
              value={form.deviceId}
              onChange={handleFormChange}
              options={deviceOptions}
              error={formErrors.deviceId}
              required
            />
            <FormField
              label="Loại bảo hành"
              name="type"
              type="select"
              value={form.type}
              onChange={handleFormChange}
              options={typeOptions}
              error={formErrors.type}
              required
            />
            <FormField
              label="Nhà cung cấp"
              name="provider"
              value={form.provider}
              onChange={handleFormChange}
              error={formErrors.provider}
              required
            />
            <FormField
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleFormChange}
              error={formErrors.startDate}
              required
            />
            <FormField
              label="Ngày kết thúc"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleFormChange}
              error={formErrors.endDate}
              required
            />
            <FormField
              label="Phạm vi bảo hành"
              name="coverage"
              type="textarea"
              value={form.coverage}
              onChange={handleFormChange}
            />
            <FormField
              label="Chi phí"
              name="cost"
              type="number"
              value={form.cost}
              onChange={handleFormChange}
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
        message={`Bạn có chắc chắn muốn xóa bảo hành của thiết bị "${deleteTarget?.deviceId?.name || deleteTarget?.provider || ''}" không?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
