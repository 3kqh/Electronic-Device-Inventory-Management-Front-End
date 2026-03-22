import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDevices, searchDevices, filterDevices } from '../../api/deviceService';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';

const styles = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '220px',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
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
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
  },
};

const statusColors = {
  available: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  assigned: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  in_maintenance: { backgroundColor: '#fff3e0', color: '#e65100' },
  retired: { backgroundColor: '#fce4ec', color: '#c62828' },
};

const statusLabels = {
  available: 'Sẵn sàng',
  assigned: 'Đã phân công',
  in_maintenance: 'Đang bảo trì',
  retired: 'Đã thanh lý',
};

const conditionLabels = {
  new: 'Mới',
  good: 'Tốt',
  fair: 'Trung bình',
  poor: 'Kém',
};

const PAGE_SIZE = 10;

export default function DeviceListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCondition, setFilterCondition] = useState('');

  const canAdd = user?.role === 'admin' || user?.role === 'inventory_manager';

  const columns = [
    { key: '_id', label: 'Mã thiết bị', sortable: true },
    { key: 'assetTag', label: 'Mã tài sản', sortable: true },
    { key: 'name', label: 'Tên thiết bị', sortable: true },
    {
      key: 'categoryId',
      label: 'Danh mục',
      render: (val) => (val && typeof val === 'object' ? val.name : val || '—'),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      sortable: true,
      render: (val) => (
        <span style={{ ...styles.statusBadge, ...(statusColors[val] || {}) }}>
          {statusLabels[val] || val}
        </span>
      ),
    },
    {
      key: 'condition',
      label: 'Tình trạng',
      render: (val) => conditionLabels[val] || val || '—',
    },
    {
      key: 'locationId',
      label: 'Vị trí',
      render: (val) => (val && typeof val === 'object' ? val.name : val || '—'),
    },
  ];

  const fetchDevices = useCallback(async (currentPage) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllDevices({ page: currentPage, limit: PAGE_SIZE });
      const data = res.data;
      setDevices(data.devices || data.data || data || []);
      setTotal(data.total || data.totalCount || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchDevices(1);
      setPage(1);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await searchDevices(searchQuery.trim());
      const data = res.data;
      setDevices(data.devices || data.data || data || []);
      setTotal(data.total || (Array.isArray(data) ? data.length : 0));
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tìm kiếm');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, fetchDevices]);

  const handleFilter = useCallback(async (status, condition) => {
    const params = {};
    if (status) params.status = status;
    if (condition) params.condition = condition;

    if (!status && !condition) {
      fetchDevices(1);
      setPage(1);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await filterDevices(params);
      const data = res.data;
      setDevices(data.devices || data.data || data || []);
      setTotal(data.total || (Array.isArray(data) ? data.length : 0));
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lọc thiết bị');
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  useEffect(() => {
    fetchDevices(page);
  }, [page, fetchDevices]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowClick = (row) => {
    navigate(`/devices/${row._id || row.id}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusFilterChange = (e) => {
    const val = e.target.value;
    setFilterStatus(val);
    handleFilter(val, filterCondition);
  };

  const handleConditionFilterChange = (e) => {
    const val = e.target.value;
    setFilterCondition(val);
    handleFilter(filterStatus, val);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Danh sách thiết bị</h1>
        {canAdd && (
          <button
            style={styles.addButton}
            onClick={() => navigate('/devices/new')}
          >
            Thêm thiết bị
          </button>
        )}
      </div>

      <div style={styles.controls}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Tìm kiếm thiết bị..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <select
          style={styles.filterSelect}
          value={filterStatus}
          onChange={handleStatusFilterChange}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">Sẵn sàng</option>
          <option value="assigned">Đã phân công</option>
          <option value="in_maintenance">Đang bảo trì</option>
          <option value="retired">Đã thanh lý</option>
        </select>
        <select
          style={styles.filterSelect}
          value={filterCondition}
          onChange={handleConditionFilterChange}
        >
          <option value="">Tất cả tình trạng</option>
          <option value="new">Mới</option>
          <option value="good">Tốt</option>
          <option value="fair">Trung bình</option>
          <option value="poor">Kém</option>
        </select>
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>
          <button style={styles.retryButton} onClick={() => fetchDevices(page)}>
            Thử lại
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={devices}
        pagination={{ page, pageSize: PAGE_SIZE, total }}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        loading={loading}
      />
    </div>
  );
}
