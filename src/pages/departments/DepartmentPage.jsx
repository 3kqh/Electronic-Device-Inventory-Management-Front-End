import React, { useState, useEffect, useCallback } from 'react';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departmentService';
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

const emptyForm = { name: '', code: '', description: '' };

export default function DepartmentPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: 'name', label: 'Tên phòng ban', sortable: true },
    { key: 'code', label: 'Mã', sortable: true },
    { key: 'description', label: 'Mô tả', render: (val) => val || '—' },
    {
      key: 'manager',
      label: 'Quản lý',
      render: (val) => {
        if (!val) return '—';
        if (typeof val === 'object') return `${val.firstName || ''} ${val.lastName || ''}`.trim() || val.email || '—';
        return val;
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

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllDepartments();
      const data = res.data;
      setDepartments(data.departments || data.data || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleEdit = (row) => {
    setEditingId(row._id || row.id);
    setForm({
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
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
    if (!form.name.trim()) errs.name = 'Tên phòng ban là bắt buộc';
    if (!form.code.trim()) errs.code = 'Mã phòng ban là bắt buộc';
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
        description: form.description.trim(),
      };
      if (editingId) {
        await updateDepartment(editingId, payload);
        showNotification({ type: 'success', message: 'Cập nhật phòng ban thành công' });
      } else {
        await createDepartment(payload);
        showNotification({ type: 'success', message: 'Thêm phòng ban thành công' });
      }
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi lưu phòng ban' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDepartment(deleteTarget._id || deleteTarget.id);
      showNotification({ type: 'success', message: 'Xóa phòng ban thành công' });
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa phòng ban' });
      setDeleteTarget(null);
    }
  };

  if (loading && departments.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý phòng ban</h1>
        {isAdmin && (
          <button style={styles.addButton} onClick={handleAdd}>Thêm phòng ban</button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchDepartments}>Thử lại</button>
        </div>
      )}

      <DataTable columns={columns} data={departments} loading={loading} />

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>{editingId ? 'Sửa phòng ban' : 'Thêm phòng ban'}</h2>
            <FormField label="Tên phòng ban" name="name" value={form.name} onChange={handleFormChange} error={formErrors.name} required />
            <FormField label="Mã phòng ban" name="code" value={form.code} onChange={handleFormChange} error={formErrors.code} required />
            <FormField label="Mô tả" name="description" type="textarea" value={form.description} onChange={handleFormChange} />
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
        message={`Bạn có chắc chắn muốn xóa phòng ban "${deleteTarget?.name}" không?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
