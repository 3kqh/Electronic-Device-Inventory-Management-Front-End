import { useState, useEffect, useCallback } from 'react';
import { getDeviceStatusReport } from '../../api/reportService';
import { getAllUsers } from '../../api/userService';

const styles = {
  container: {
    padding: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#1a1a1a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100px',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  skeleton: {
    background: 'linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '100px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonLine: {
    background: '#e0e0e0',
    borderRadius: '4px',
    height: '14px',
    width: '60%',
    margin: '0 auto 12px',
  },
  skeletonValue: {
    background: '#e0e0e0',
    borderRadius: '4px',
    height: '32px',
    width: '40%',
    margin: '0 auto',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#d32f2f',
  },
  errorMessage: {
    fontSize: '16px',
    marginBottom: '16px',
  },
  retryButton: {
    padding: '8px 24px',
    fontSize: '14px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

const CARD_CONFIG = [
  { key: 'total', label: 'Tổng thiết bị', color: '#1976d2' },
  { key: 'available', label: 'Sẵn sàng', color: '#388e3c' },
  { key: 'assigned', label: 'Đã phân công', color: '#f57c00' },
  { key: 'in_maintenance', label: 'Đang bảo trì', color: '#7b1fa2' },
  { key: 'retired', label: 'Đã thanh lý', color: '#616161' },
  { key: 'totalUsers', label: 'Tổng người dùng', color: '#0097a7' },
];

function SkeletonCard() {
  return (
    <div style={styles.skeleton}>
      <div style={styles.skeletonLine} />
      <div style={styles.skeletonValue} />
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
      <span style={styles.cardLabel}>{label}</span>
      <span style={{ ...styles.cardValue, color }}>{value}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, usersRes] = await Promise.all([
        getDeviceStatusReport(),
        getAllUsers(),
      ]);

      const statusData = statusRes.data || statusRes;
      const usersData = usersRes.data || usersRes;

      const available = statusData.available ?? 0;
      const assigned = statusData.assigned ?? 0;
      const inMaintenance = statusData.in_maintenance ?? 0;
      const retired = statusData.retired ?? 0;
      const total = statusData.total ?? (available + assigned + inMaintenance + retired);
      const totalUsers = Array.isArray(usersData) ? usersData.length : (usersData.total ?? usersData.count ?? 0);

      setData({ total, available, assigned, in_maintenance: inMaintenance, retired, totalUsers });
    } catch {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Dashboard</h1>
        <div style={styles.errorContainer}>
          <p style={styles.errorMessage}>{error}</p>
          <button style={styles.retryButton} onClick={fetchData}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      <div style={styles.grid}>
        {loading
          ? CARD_CONFIG.map((c) => <SkeletonCard key={c.key} />)
          : CARD_CONFIG.map((c) => (
              <SummaryCard
                key={c.key}
                label={c.label}
                value={data?.[c.key] ?? 0}
                color={c.color}
              />
            ))}
      </div>
    </div>
  );
}
