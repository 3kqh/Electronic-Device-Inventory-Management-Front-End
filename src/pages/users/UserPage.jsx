import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, deleteUser, assignRole } from '../../api/userService';
import { register } from '../../api/authService';
import { getAllDepartments } from '../../api/departmentService';
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
  statusBadge: {
    padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
    fontWeight: 500, display: 'inline-block',
  },
  roleBadge: {
    padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
    fontWeight: 500, display: 'inline-block',
  },
};

const statusColors = {
  active: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  inactive: { backgroundColor: '#fce4ec', color: '#c62828' },
};

const statusLabels = { active: 'Hoạt động', inactive: 'Ngừng hoạt động' };

const roleLabels = {
  admin: 'Quản trị viên',
  inventory_manager: 'Quản lý kho',
  staff: 'Nhân viên',
};

const roleColors = {
  admin: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  inventory_manager: { backgroundColor: '#fff3e0', color: '#e65100' },
  staff: { backgroundColor: '#f3e5f5', color: '#7b1fa2' },
};

const roleOptions = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'inventory_manager', label: 'Quản lý kho' },
  { value: 'staff', label: 'Nhân viên' },
];

const emptyAddForm = { email: '', password: '', firstName: '', lastName: '', role: '', departmentId: '' };
const emptyEditForm = { firstName: '', lastName: '', role: '', departmentId: '' };

export default function UserPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [departments, setDepartments] = useState([]);

  const departmentOptions = departments.map((d) => ({
    value: d._id || d.id,
    label: d.name || d.departmentName || d._id,
  }));

  const columns = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'firstName', label: 'Họ', sortable: true },
    { key: 'lastName', label: 'Tên', sortable: true },
    {
      key: 'role',
      label: 'Vai trò',
      render: (val) => (
        <span style={{ ...styles.roleBadge, ...(roleColors[val] || {}) }}>
          {roleLabels[val] || val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val) => (
        <span style={{ ...styles.statusBadge, ...(statusColors[val] || {}) }}>
          {statusLabels[val] || val || '—'}
        </span>
      ),
    },
    ...(isAdmin
      ? [{
          key: '_actions',
          label: 'Hành động',
          render: (_, row) => (
            <>
              <button style={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}>Sửa</button>
              <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>Xóa</button>
            </>
          ),
        }]
      : []),
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllUsers();
      const data = res.data;
      setUsers(data.users || data.data || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    getAllDepartments()
      .then((res) => {
        const data = res.data;
        setDepartments(data.departments || data.data || data || []);
      })
      .catch(() => {});
  }, []);

  const handleEditClick = (row) => {
    setEditingUser(row);
    setEditForm({
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      role: row.role || '',
      departmentId: row.departmentId || '',
    });
    setFormErrors({});
    setShowEditForm(true);
  };

  const handleAddFormChange = (e) => {
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditFormChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAdd = () => {
    const errs = {};
    if (!addForm.email.trim()) errs.email = 'Email là bắt buộc';
    if (!addForm.password.trim()) errs.password = 'Mật khẩu là bắt buộc';
    if (!addForm.firstName.trim()) errs.firstName = 'Họ là bắt buộc';
    if (!addForm.lastName.trim()) errs.lastName = 'Tên là bắt buộc';
    if (!addForm.role) errs.role = 'Vai trò là bắt buộc';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.role) errs.role = 'Vai trò là bắt buộc';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateAdd()) return;
    setSubmitting(true);
    try {
      const payload = {
        email: addForm.email.trim(),
        password: addForm.password,
        firstName: addForm.firstName.trim(),
        lastName: addForm.lastName.trim(),
        role: addForm.role,
        departmentId: addForm.departmentId.trim() || undefined,
      };
      await register(payload);
      showNotification({ type: 'success', message: 'Thêm người dùng thành công' });
      setShowAddForm(false);
      setAddForm(emptyAddForm);
      fetchUsers();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Lỗi khi thêm người dùng';
      if (data?.errors && Array.isArray(data.errors)) {
        msg = data.errors.join(', ');
      } else if (data?.message) {
        msg = data.message;
      }
      showNotification({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateEdit()) return;
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const userId = editingUser._id || editingUser.id;
      if (editForm.role !== editingUser.role) {
        await assignRole(userId, editForm.role);
      }
      showNotification({ type: 'success', message: 'Cập nhật người dùng thành công' });
      setShowEditForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi cập nhật người dùng' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id || deleteTarget.id);
      showNotification({ type: 'success', message: 'Xóa người dùng thành công' });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa người dùng' });
      setDeleteTarget(null);
    }
  };

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý người dùng</h1>
        {isAdmin && (
          <button style={styles.addButton} onClick={() => { setAddForm(emptyAddForm); setFormErrors({}); setShowAddForm(true); }}>
            Thêm người dùng
          </button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchUsers}>Thử lại</button>
        </div>
      )}

      <DataTable columns={columns} data={users} loading={loading} />

      {showAddForm && (
        <div style={styles.formOverlay} onClick={() => setShowAddForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>Thêm người dùng</h2>
            <FormField label="Email" name="email" type="email" value={addForm.email} onChange={handleAddFormChange} error={formErrors.email} required />
            <FormField label="Mật khẩu" name="password" type="password" value={addForm.password} onChange={handleAddFormChange} error={formErrors.password} required />
            <FormField label="Họ" name="firstName" value={addForm.firstName} onChange={handleAddFormChange} error={formErrors.firstName} required />
            <FormField label="Tên" name="lastName" value={addForm.lastName} onChange={handleAddFormChange} error={formErrors.lastName} required />
            <FormField label="Vai trò" name="role" type="select" value={addForm.role} onChange={handleAddFormChange} error={formErrors.role} options={roleOptions} required />
            <FormField label="Phòng ban" name="departmentId" type="select" value={addForm.departmentId} onChange={handleAddFormChange} options={departmentOptions} />
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setShowAddForm(false)}>Hủy</button>
              <button style={styles.submitBtn} onClick={handleAddSubmit} disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && (
        <div style={styles.formOverlay} onClick={() => setShowEditForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>Sửa người dùng</h2>
            <FormField label="Họ" name="firstName" value={editForm.firstName} onChange={handleEditFormChange} />
            <FormField label="Tên" name="lastName" value={editForm.lastName} onChange={handleEditFormChange} />
            <FormField label="Vai trò" name="role" type="select" value={editForm.role} onChange={handleEditFormChange} error={formErrors.role} options={roleOptions} required />
            <FormField label="Phòng ban" name="departmentId" type="select" value={editForm.departmentId} onChange={handleEditFormChange} options={departmentOptions} />
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setShowEditForm(false)}>Hủy</button>
              <button style={styles.submitBtn} onClick={handleEditSubmit} disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa người dùng "${deleteTarget?.email}" không?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
