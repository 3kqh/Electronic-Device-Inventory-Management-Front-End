import React, { useState, useEffect, useCallback } from 'react';
import { getAllLocations, createLocation, updateLocation, deleteLocation } from '../../api/locationService';
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
};

const typeLabels = {
  building: 'Tòa nhà',
  floor: 'Tầng',
  room: 'Phòng',
  other: 'Khác',
};

const typeOptions = [
  { value: 'building', label: 'Tòa nhà' },
  { value: 'floor', label: 'Tầng' },
  { value: 'room', label: 'Phòng' },
  { value: 'other', label: 'Khác' },
];

const emptyForm = { name: '', code: '', type: '', parentId: '', address: '' };

export default function LocationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: 'name', label: 'Tên vị trí', sortable: true },
    { key: 'code', label: 'Mã', sortable: true },
    {
      key: 'type',
      label: 'Loại',
      render: (val) => typeLabels[val] || val || '—',
    },
    {
      key: 'parentId',
      label: 'Vị trí cha',
      render: (val) => {
        if (!val) return '—';
        if (typeof val === 'object') return val.name || '—';
        const parent = locations.find((l) => (l._id || l.id) === val);
        return parent ? parent.name : val;
      },
    },
    ...(isAdmin
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

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllLocations();
      const data = res.data;
      setLocations(data.locations || data.data || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách vị trí');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const parentOptions = locations
    .filter((l) => (l._id || l.id) !== editingId)
    .map((l) => ({ value: l._id || l.id, label: l.name }));

  const handleEdit = (row) => {
    setEditingId(row._id || row.id);
    setForm({
      name: row.name || '',
      code: row.code || '',
      type: row.type || '',
      parentId: (typeof row.parentId === 'object' ? row.parentId?._id : row.parentId) || '',
      address: row.address || '',
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
    if (!form.name.trim()) errs.name = 'Tên vị trí là bắt buộc';
    if (!form.code.trim()) errs.code = 'Mã vị trí là bắt buộc';
    if (!form.type) errs.type = 'Loại vị trí là bắt buộc';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        type: form.type,
        parentId: form.parentId || null,
        address: form.address.trim(),
      };
      if (editingId) {
        await updateLocation(editingId, payload);
        showNotification({ type: 'success', message: 'Cập nhật vị trí thành công' });
      } else {
        await createLocation(payload);
        showNotification({ type: 'success', message: 'Thêm vị trí thành công' });
      }
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi lưu vị trí' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLocation(deleteTarget._id || deleteTarget.id);
      showNotification({ type: 'success', message: 'Xóa vị trí thành công' });
      setDeleteTarget(null);
      fetchLocations();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa vị trí' });
      setDeleteTarget(null);
    }
  };

  if (loading && locations.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý vị trí</h1>
        {isAdmin && (
          <button style={styles.addButton} onClick={handleAdd}>Thêm vị trí</button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchLocations}>Thử lại</button>
        </div>
      )}

      <DataTable columns={columns} data={locations} loading={loading} />

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>{editingId ? 'Sửa vị trí' : 'Thêm vị trí'}</h2>
            <FormField label="Tên vị trí" name="name" value={form.name} onChange={handleFormChange} error={formErrors.name} required />
            <FormField label="Mã vị trí" name="code" value={form.code} onChange={handleFormChange} error={formErrors.code} required />
            <FormField label="Loại" name="type" type="select" value={form.type} onChange={handleFormChange} error={formErrors.type} options={typeOptions} required />
            <FormField label="Vị trí cha" name="parentId" type="select" value={form.parentId} onChange={handleFormChange} options={parentOptions} />
            <FormField label="Địa chỉ" name="address" type="textarea" value={form.address} onChange={handleFormChange} />

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
        message={`Bạn có chắc chắn muốn xóa vị trí "${deleteTarget?.name}" không?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
