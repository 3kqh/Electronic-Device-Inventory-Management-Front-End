import React, { useState, useEffect, useCallback } from 'react';
import { getAllAssignments, acknowledgeAssignment, transferDevice, assignDevice } from '../../api/assignmentService';
import { getAllDevices } from '../../api/deviceService';
import { getAllUsers } from '../../api/userService';
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
    padding: '4px 10px', fontSize: 13, border: '1px solid #1976d2',
    borderRadius: 4, backgroundColor: '#fff', color: '#1976d2', cursor: 'pointer', marginRight: 6,
  },
  transferBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #ff9800',
    borderRadius: 4, backgroundColor: '#fff', color: '#ff9800', cursor: 'pointer', marginRight: 6,
  },
  statusBadge: {
    padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
    fontWeight: 500, display: 'inline-block',
  },
};

const statusColors = {
  pending: { backgroundColor: '#fff3e0', color: '#e65100' },
  acknowledged: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  active: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  returned: { backgroundColor: '#f5f5f5', color: '#616161' },
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  acknowledged: 'Đã xác nhận',
  active: 'Đang sử dụng',
  returned: 'Đã trả',
};

const emptyAssignForm = { deviceId: '', userId: '', notes: '' };

export default function AssignmentListPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'admin' || user?.role === 'inventory_manager';

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Assign modal
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState(emptyAssignForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Transfer modal
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferUserId, setTransferUserId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Acknowledge confirm
  const [ackTarget, setAckTarget] = useState(null);

  // Dropdown data
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllAssignments({ page, limit: pageSize });
      const data = res.data;
      setAssignments(data.assignments || data.data || data || []);
      setTotal(data.total || data.totalCount || (data.assignments || data.data || data || []).length);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách phân công');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [devRes, usrRes] = await Promise.all([getAllDevices({ limit: 1000 }), getAllUsers()]);
      const devData = devRes.data;
      setDevices(devData.devices || devData.data || devData || []);
      const usrData = usrRes.data;
      setUsers(usrData.users || usrData.data || usrData || []);
    } catch {
      // Silently fail — user can still close modal
    }
  }, []);

  const getDeviceName = (row) => {
    if (row.deviceId && typeof row.deviceId === 'object') {
      return row.deviceId.name || row.deviceId.assetTag || '—';
    }
    return row.deviceId || '—';
  };

  const getAssignedTo = (row) => {
    const u = row.assignedTo?.userId;
    if (u && typeof u === 'object') {
      return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '—';
    }
    return u || '—';
  };

  const getAssignedBy = (row) => {
    if (row.assignedBy && typeof row.assignedBy === 'object') {
      return `${row.assignedBy.firstName || ''} ${row.assignedBy.lastName || ''}`.trim() || '—';
    }
    return row.assignedBy || '—';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('vi-VN'); } catch { return dateStr; }
  };

  const columns = [
    { key: 'deviceId', label: 'Thiết bị', render: (_, row) => getDeviceName(row) },
    { key: 'assignedTo', label: 'Người nhận', render: (_, row) => getAssignedTo(row) },
    { key: 'assignedBy', label: 'Người phân công', render: (_, row) => getAssignedBy(row) },
    { key: 'assignmentDate', label: 'Ngày phân công', render: (val) => formatDate(val) },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val) => (
        <span style={{ ...styles.statusBadge, ...(statusColors[val] || {}) }}>
          {statusLabels[val] || val || '—'}
        </span>
      ),
    },
    {
      key: '_actions',
      label: 'Hành động',
      render: (_, row) => (
        <>
          {row.status === 'pending' && !isManager && (
            <button style={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setAckTarget(row); }}>
              Xác nhận
            </button>
          )}
          {(row.status === 'active' || row.status === 'acknowledged') && isManager && (
            <button style={styles.transferBtn} onClick={(e) => { e.stopPropagation(); handleTransferClick(row); }}>
              Chuyển giao
            </button>
          )}
        </>
      ),
    },
  ];

  // --- Assign handlers ---
  const handleOpenAssign = () => {
    setAssignForm(emptyAssignForm);
    setFormErrors({});
    fetchDropdownData();
    setShowAssignForm(true);
  };

  const handleAssignFormChange = (e) => {
    setAssignForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAssign = () => {
    const errs = {};
    if (!assignForm.deviceId) errs.deviceId = 'Vui lòng chọn thiết bị';
    if (!assignForm.userId) errs.userId = 'Vui lòng chọn người nhận';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAssignSubmit = async () => {
    if (!validateAssign()) return;
    setSubmitting(true);
    try {
      await assignDevice({
        deviceId: assignForm.deviceId,
        assignedTo: { userId: assignForm.userId },
        notes: assignForm.notes,
      });
      showNotification({ type: 'success', message: 'Phân công thiết bị thành công' });
      setShowAssignForm(false);
      fetchAssignments();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi phân công thiết bị' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Transfer handlers ---
  const handleTransferClick = (row) => {
    setTransferTarget(row);
    setTransferUserId('');
    setTransferNotes('');
    setFormErrors({});
    fetchDropdownData();
    setShowTransferForm(true);
  };

  const handleTransferSubmit = async () => {
    if (!transferUserId) {
      setFormErrors({ transferUserId: 'Vui lòng chọn người nhận mới' });
      return;
    }
    setSubmitting(true);
    try {
      const id = transferTarget._id || transferTarget.id;
      await transferDevice(id, { newUserId: transferUserId, notes: transferNotes });
      showNotification({ type: 'success', message: 'Chuyển giao thiết bị thành công' });
      setShowTransferForm(false);
      setTransferTarget(null);
      fetchAssignments();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi chuyển giao thiết bị' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Acknowledge handler ---
  const handleAcknowledge = async () => {
    if (!ackTarget) return;
    try {
      const id = ackTarget._id || ackTarget.id;
      await acknowledgeAssignment(id);
      showNotification({ type: 'success', message: 'Xác nhận phân công thành công' });
      setAckTarget(null);
      fetchAssignments();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xác nhận phân công' });
      setAckTarget(null);
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

  if (loading && assignments.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý phân công</h1>
        {isManager && (
          <button style={styles.addButton} onClick={handleOpenAssign}>
            Phân công thiết bị
          </button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchAssignments}>Thử lại</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={assignments}
        loading={loading}
        pagination={{ page, pageSize, total }}
        onPageChange={setPage}
      />

      {/* Assign Device Modal */}
      {showAssignForm && (
        <div style={styles.formOverlay} onClick={() => setShowAssignForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>Phân công thiết bị</h2>
            <FormField
              label="Thiết bị" name="deviceId" type="select"
              value={assignForm.deviceId} onChange={handleAssignFormChange}
              error={formErrors.deviceId} options={deviceOptions} required
            />
            <FormField
              label="Người nhận" name="userId" type="select"
              value={assignForm.userId} onChange={handleAssignFormChange}
              error={formErrors.userId} options={userOptions} required
            />
            <FormField
              label="Ghi chú" name="notes" type="textarea"
              value={assignForm.notes} onChange={handleAssignFormChange}
            />
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setShowAssignForm(false)}>Hủy</button>
              <button style={styles.submitBtn} onClick={handleAssignSubmit} disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Phân công'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Device Modal */}
      {showTransferForm && (
        <div style={styles.formOverlay} onClick={() => setShowTransferForm(false)}>
          <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>Chuyển giao thiết bị</h2>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
              Thiết bị: <strong>{getDeviceName(transferTarget)}</strong>
            </p>
            <FormField
              label="Người nhận mới" name="transferUserId" type="select"
              value={transferUserId}
              onChange={(e) => setTransferUserId(e.target.value)}
              error={formErrors.transferUserId} options={userOptions} required
            />
            <FormField
              label="Ghi chú" name="transferNotes" type="textarea"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
            />
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setShowTransferForm(false)}>Hủy</button>
              <button style={styles.submitBtn} onClick={handleTransferSubmit} disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Chuyển giao'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Confirm Dialog */}
      <ConfirmDialog
        open={!!ackTarget}
        title="Xác nhận phân công"
        message="Bạn có chắc chắn muốn xác nhận đã nhận thiết bị này không?"
        onConfirm={handleAcknowledge}
        onCancel={() => setAckTarget(null)}
      />
    </div>
  );
}
