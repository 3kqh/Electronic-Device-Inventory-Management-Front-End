import React, { useState, useEffect, useCallback } from 'react';
import { getAllMaintenance, completeMaintenance, cancelMaintenance } from '../../api/maintenanceService';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNotification } from '../../components/Notification';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: { padding: '24px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
  },
  title: { fontSize: '24px', fontWeight: 600, color: '#333', margin: 0 },
  headerButtons: { display: 'flex', gap: '10px' },
  requestButton: {
    padding: '10px 20px', backgroundColor: '#1976d2', color: '#fff',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
  },
  scheduleButton: {
    padding: '10px 20px', backgroundColor: '#ff9800', color: '#fff',
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
  actionBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #4caf50',
    borderRadius: 4, backgroundColor: '#fff', color: '#4caf50', cursor: 'pointer', marginRight: 6,
  },
  cancelBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #d32f2f',
    borderRadius: 4, backgroundColor: '#fff', color: '#d32f2f', cursor: 'pointer', marginRight: 6,
  },
  statusBadge: {
    padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
    fontWeight: 500, display: 'inline-block',
  },
};

const statusColors = {
  scheduled: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  in_progress: { backgroundColor: '#fff3e0', color: '#e65100' },
  completed: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  cancelled: { backgroundColor: '#f5f5f5', color: '#616161' },
};

const statusLabels = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const typeLabels = {
  preventive: 'Phòng ngừa',
  corrective: 'Sửa chữa',
  other: 'Khác',
};

export default function MaintenanceListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isManager = user?.role === 'admin' || user?.role === 'inventory_manager';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [completeTarget, setCompleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllMaintenance({ page, limit: pageSize });
      const data = res.data;
      const list = data.maintenanceRecords || data.data || data || [];

      console.log("DEBUG STATUS:", list); // debug nếu cần

      setRecords(list);
      setTotal(data.total || data.totalCount || list.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách bảo trì');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const getDeviceName = (row) => {
    if (row.deviceId && typeof row.deviceId === 'object') {
      return row.deviceId.name || row.deviceId.assetTag || '—';
    }
    return row.deviceId || '—';
  };

  const getPerformedBy = (row) => {
    const p = row.performedBy;
    if (p && typeof p === 'object') {
      return `${p.firstName || ''} ${p.lastName || ''}`.trim() || '—';
    }
    return p || '—';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('vi-VN'); } catch { return dateStr; }
  };

  const handleComplete = async () => {
    if (!completeTarget) return;
    try {
      const id = completeTarget._id || completeTarget.id;
      await completeMaintenance(id, { completedDate: new Date().toISOString() });
      showNotification({ type: 'success', message: 'Đã hoàn thành bảo trì' });
      setCompleteTarget(null);
      fetchRecords();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi hoàn thành bảo trì' });
      setCompleteTarget(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      const id = cancelTarget._id || cancelTarget.id;
      await cancelMaintenance(id);
      showNotification({ type: 'success', message: 'Đã hủy yêu cầu bảo trì' });
      setCancelTarget(null);
      fetchRecords();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi hủy bảo trì' });
      setCancelTarget(null);
    }
  };

  const isInProgress = (status) => {
    return ['in_progress', 'inProgress', 'IN_PROGRESS'].includes(status);
  };

  const columns = [
    { key: 'deviceId', label: 'Thiết bị', render: (_, row) => getDeviceName(row) },
    { key: 'type', label: 'Loại', render: (val) => typeLabels[val] || val || '—' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val) => (
        <span style={{ ...styles.statusBadge, ...(statusColors[val] || {}) }}>
          {statusLabels[val] || val || '—'}
        </span>
      ),
    },
    { key: 'scheduledDate', label: 'Ngày lên lịch', render: (val) => formatDate(val) },
    { key: 'performedBy', label: 'Người thực hiện', render: (_, row) => getPerformedBy(row) },
    {
  key: '_actions',
  label: 'Hành động',
  render: (_, row) => (
    <>
      {/* Hoàn thành nhanh */}
      {['in_progress', 'scheduled'].includes(row.status) && isManager && (
        <button
          style={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            setCompleteTarget(row);
          }}
        >
          Hoàn thành nhanh
        </button>
      )}

      {/* Hủy */}
      {(row.status === 'scheduled' || row.status === 'pending') && isManager && (
        <button
          style={styles.cancelBtn}
          onClick={(e) => {
            e.stopPropagation();
            setCancelTarget(row);
          }}
        >
          Hủy
        </button>
      )}
    </>
  ),
},
  ];

  if (loading && records.length === 0) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý bảo trì</h1>
        <div style={styles.headerButtons}>
          <button style={styles.requestButton} onClick={() => navigate('/maintenance/request')}>
            Yêu cầu bảo trì
          </button>
          {isManager && (
            <button style={styles.scheduleButton} onClick={() => navigate('/maintenance/schedule')}>
              Lên lịch bảo trì
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchRecords}>Thử lại</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        pagination={{ page, pageSize, total }}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!completeTarget}
        title="Hoàn thành bảo trì"
        message="Bạn có chắc chắn muốn đánh dấu bảo trì này là hoàn thành không?"
        onConfirm={handleComplete}
        onCancel={() => setCompleteTarget(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Hủy bảo trì"
        message="Bạn có chắc chắn muốn hủy yêu cầu bảo trì này không?"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}