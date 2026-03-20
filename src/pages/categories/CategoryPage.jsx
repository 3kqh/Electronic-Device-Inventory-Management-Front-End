import React, { useState, useEffect, useCallback } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryService';
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
  customFieldRow: {
    display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8,
  },
  removeFieldBtn: {
    padding: '6px 10px', fontSize: 13, border: '1px solid #d32f2f',
    borderRadius: 4, backgroundColor: '#fff', color: '#d32f2f', cursor: 'pointer',
    marginBottom: 16,
  },
  addFieldBtn: {
    padding: '6px 14px', fontSize: 13, border: '1px solid #1976d2',
    borderRadius: 4, backgroundColor: '#fff', color: '#1976d2', cursor: 'pointer',
    marginBottom: 8,
  },
  sectionLabel: { fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8, marginTop: 12 },
};

const emptyForm = { name: '', code: '', description: '', customFields: [] };
const emptyCustomField = { fieldName: '', fieldType: 'text', required: false };

export default function CategoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: 'name', label: 'Tên danh mục', sortable: true },
    { key: 'code', label: 'Mã', sortable: true },
    { key: 'description', label: 'Mô tả' },
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllCategories();
      const data = res.data;
      setCategories(data.categories || data.data || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleEdit = (row) => {
    setEditingId(row._id || row.id);
    setForm({
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
      customFields: row.customFields?.length ? row.customFields.map(f => ({ ...f })) : [],
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, customFields: [] });
    setFormErrors({});
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.customFields];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customFields: updated };
    });
  };

  const addCustomField = () => {
    setForm((prev) => ({ ...prev, customFields: [...prev.customFields, { ...emptyCustomField }] }));
  };

  const removeCustomField = (index) => {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Tên danh mục là bắt buộc';
    if (!form.code.trim()) errs.code = 'Mã danh mục là bắt buộc';
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
        customFields: form.customFields.filter(f => f.fieldName.trim()),
      };
      if (editingId) {
        await updateCategory(editingId, payload);
        showNotification({ type: 'success', message: 'Cập nhật danh mục thành công' });
      } else {
        await createCategory(payload);
        showNotification({ type: 'success', message: 'Thêm danh mục thành công' });
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi lưu danh mục';
      showNotification({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget._id || deleteTarget.id);
      showNotification({ type: 'success', message: 'Xóa danh mục thành công' });
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa danh mục' });
      setDeleteTarget(null);
    }
  };

  if (loading && categories.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Danh mục thiết bị</h1>
        {isAdmin && (
          <button style={styles.addButton} onClick={handleAdd}>Thêm danh mục</button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchCategories}>Thử lại</button>
        </div>
      )}

      <DataTable columns={columns} data={categories} loading={loading} />

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>{editingId ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
            <FormField label="Tên danh mục" name="name" value={form.name} onChange={handleFormChange} error={formErrors.name} required />
            <FormField label="Mã danh mục" name="code" value={form.code} onChange={handleFormChange} error={formErrors.code} required />
            <FormField label="Mô tả" name="description" type="textarea" value={form.description} onChange={handleFormChange} />

            <div style={styles.sectionLabel}>Trường tùy chỉnh</div>
            {form.customFields.map((cf, idx) => (
              <div key={idx} style={styles.customFieldRow}>
                <div style={{ flex: 2 }}>
                  <FormField
                    label="Tên trường"
                    name={`cf_name_${idx}`}
                    value={cf.fieldName}
                    onChange={(e) => handleCustomFieldChange(idx, 'fieldName', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <FormField
                    label="Loại"
                    name={`cf_type_${idx}`}
                    type="select"
                    value={cf.fieldType}
                    onChange={(e) => handleCustomFieldChange(idx, 'fieldType', e.target.value)}
                    options={[
                      { value: 'text', label: 'Text' },
                      { value: 'number', label: 'Number' },
                      { value: 'date', label: 'Date' },
                      { value: 'boolean', label: 'Boolean' },
                    ]}
                  />
                </div>
                <button style={styles.removeFieldBtn} onClick={() => removeCustomField(idx)}>Xóa</button>
              </div>
            ))}
            <button style={styles.addFieldBtn} onClick={addCustomField}>+ Thêm trường</button>

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
        message={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.name}" không?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
