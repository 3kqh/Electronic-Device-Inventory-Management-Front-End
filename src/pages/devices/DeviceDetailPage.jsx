import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeviceById, deleteDevice, disposeDevice } from '../../api/deviceService';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import { showNotification } from '../../components/Notification';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusLabels = {
  available: 'Sẵn sàng',
  assigned: 'Đã phân công',
  in_maintenance: 'Đang bảo trì',
  retired: 'Đã thanh lý',
};

const statusColors = {
  available: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  assigned: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  in_maintenance: { backgroundColor: '#fff3e0', color: '#e65100' },
  retired: { backgroundColor: '#fce4ec', color: '#c62828' },
};

const conditionLabels = {
  new: 'Mới',
  good: 'Tốt',
  fair: 'Trung bình',
  poor: 'Kém',
};

const styles = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '8px 20px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  disposeButton: {
    padding: '8px 20px',
    backgroundColor: '#ff9800',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 20px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  backButton: {
    padding: '8px 20px',
    backgroundColor: '#fff',
    color: '#424242',
    border: '1px solid #bdbdbd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '24px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
    marginTop: 0,
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e0e0e0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  field: {
    marginBottom: '4px',
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '4px',
  },
  fieldValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: 500,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
  },
  error: {
    color: '#d32f2f',
    padding: '16px',
    backgroundColor: '#fdecea',
    borderRadius: '4px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    padding: '6px 16px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
}

function formatCurrency(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString('vi-VN') + ' ₫';
}

function displayValue(val) {
  if (val == null || val === '') return '—';
  if (typeof val === 'object' && val.name) return val.name;
  return String(val);
}

export default function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disposeConfirmOpen, setDisposeConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'inventory_manager';

  const fetchDevice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDeviceById(id);
      setDevice(res.data.device || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDevice(id);
      showNotification({ type: 'success', message: 'Xóa thiết bị thành công' });
      navigate('/devices');
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Không thể xóa thiết bị' });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleDispose = async () => {
    try {
      await disposeDevice(id);
      showNotification({ type: 'success', message: 'Thanh lý thiết bị thành công' });
      fetchDevice();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Không thể thanh lý thiết bị' });
    } finally {
      setDisposeConfirmOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={fetchDevice}>Thử lại</button>
        </div>
      </div>
    );
  }

  if (!device) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Chi tiết thiết bị</h1>
        <div style={styles.actions}>
          <button style={styles.backButton} onClick={() => navigate('/devices')}>
            Quay lại
          </button>
          {canManage && (
            <>
              <button style={styles.editButton} onClick={() => navigate(`/devices/${id}/edit`)}>
                Sửa
              </button>
              {device.status !== 'retired' && (
                <button style={styles.disposeButton} onClick={() => setDisposeConfirmOpen(true)}>
                  Thanh lý
                </button>
              )}
              <button
                style={styles.deleteButton}
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Thông tin chung</h3>
        <div style={styles.grid}>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Tên thiết bị</div>
            <div style={styles.fieldValue}>{displayValue(device.name)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Mã tài sản</div>
            <div style={styles.fieldValue}>{displayValue(device.assetTag)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Số serial</div>
            <div style={styles.fieldValue}>{displayValue(device.serialNumber)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Danh mục</div>
            <div style={styles.fieldValue}>{displayValue(device.categoryId)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Nhà sản xuất</div>
            <div style={styles.fieldValue}>{displayValue(device.manufacturer)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Model</div>
            <div style={styles.fieldValue}>{displayValue(device.model)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Trạng thái</div>
            <div>
              <span style={{ ...styles.statusBadge, ...(statusColors[device.status] || {}) }}>
                {statusLabels[device.status] || device.status || '—'}
              </span>
            </div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Tình trạng</div>
            <div style={styles.fieldValue}>{conditionLabels[device.condition] || device.condition || '—'}</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Thông tin tài chính</h3>
        <div style={styles.grid}>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Ngày mua</div>
            <div style={styles.fieldValue}>{formatDate(device.purchaseDate)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Giá mua</div>
            <div style={styles.fieldValue}>{formatCurrency(device.purchasePrice)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Giá trị hiện tại</div>
            <div style={styles.fieldValue}>{formatCurrency(device.currentValue)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Giá trị thanh lý</div>
            <div style={styles.fieldValue}>{formatCurrency(device.salvageValue)}</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Vị trí & Mã vạch</h3>
        <div style={styles.grid}>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Vị trí</div>
            <div style={styles.fieldValue}>{displayValue(device.locationId)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Mã vạch</div>
            <div style={styles.fieldValue}>{displayValue(device.barcode)}</div>
          </div>
          {device.imageUrl && (
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Hình ảnh</div>
              <div style={styles.fieldValue}>
                <img src={device.imageUrl} alt={device.name} style={{ maxWidth: 200, borderRadius: 4 }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {device.specifications && Object.keys(device.specifications).length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Thông số kỹ thuật</h3>
          <div style={styles.grid}>
            {Object.entries(device.specifications).map(([key, value]) => (
              <div style={styles.field} key={key}>
                <div style={styles.fieldLabel}>{key}</div>
                <div style={styles.fieldValue}>{String(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Thời gian</h3>
        <div style={styles.grid}>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Ngày tạo</div>
            <div style={styles.fieldValue}>{formatDate(device.createdAt)}</div>
          </div>
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Cập nhật lần cuối</div>
            <div style={styles.fieldValue}>{formatDate(device.updatedAt)}</div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa thiết bị "${device.name || ''}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={disposeConfirmOpen}
        title="Xác nhận thanh lý"
        message={`Bạn có chắc chắn muốn thanh lý thiết bị "${device.name || ''}"? Thiết bị sẽ chuyển sang trạng thái "Đã thanh lý".`}
        onConfirm={handleDispose}
        onCancel={() => setDisposeConfirmOpen(false)}
      />
    </div>
  );
}
