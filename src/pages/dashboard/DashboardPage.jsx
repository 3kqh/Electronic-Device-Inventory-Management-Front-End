import { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getDeviceStatusReport } from '../../api/reportService';
import { getAllUsers } from '../../api/userService';

const CARD_CONFIG = [
  { key: 'total', label: 'Tổng thiết bị', color: '#1976d2' },
  { key: 'available', label: 'Sẵn sàng', color: '#388e3c' },
  { key: 'assigned', label: 'Đã phân công', color: '#f57c00' },
  { key: 'in_maintenance', label: 'Đang bảo trì', color: '#7b1fa2' },
  { key: 'retired', label: 'Đã thanh lý', color: '#616161' },
  { key: 'totalUsers', label: 'Tổng người dùng', color: '#0097a7' },
];

const STATUS_COLORS = {
  'Sẵn sàng': '#388e3c',
  'Đã phân công': '#f57c00',
  'Đang bảo trì': '#7b1fa2',
  'Đã thanh lý': '#616161',
};

const BAR_COLORS = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#0097a7', '#e64a19', '#5c6bc0', '#00897b'];

const styles = {
  container: { padding: '4px 2px 8px' },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    padding: '18px 20px',
    borderRadius: 18,
    background:
      'linear-gradient(135deg, rgba(47, 143, 99, 0.15) 0%, rgba(212, 185, 61, 0.18) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.62)',
    boxShadow: 'var(--shadow-card)',
    marginBottom: 22,
    flexWrap: 'wrap',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: { fontSize: '29px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' },
  subtitle: { margin: 0, color: 'var(--text-secondary)', fontSize: 14 },
  updatedBadge: {
    padding: '8px 12px',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(47, 143, 99, 0.2)',
    color: 'var(--accent-2)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px',
  },
  card: {
    background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px',
    boxShadow: 'var(--shadow-card)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', minHeight: '100px', justifyContent: 'center',
    border: '1px solid var(--border-soft)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardLabel: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 },
  cardValue: { fontSize: '32px', fontWeight: 'bold' },
  chartsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '28px',
  },
  chartCard: {
    background: 'var(--bg-surface)', borderRadius: '14px', padding: '20px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border-soft)',
  },
  chartTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' },
  fullWidth: { gridColumn: '1 / -1' },
  skeleton: {
    background: 'linear-gradient(90deg, #ecefe6 25%, #dbe2d3 50%, #ecefe6 75%)',
    backgroundSize: '200% 100%', borderRadius: '14px', padding: '20px', minHeight: '100px',
    border: '1px solid var(--border-soft)',
  },
  skeletonLine: { background: '#d8dfd2', borderRadius: '4px', height: '14px', width: '60%', margin: '0 auto 12px' },
  skeletonValue: { background: '#d8dfd2', borderRadius: '4px', height: '32px', width: '40%', margin: '0 auto' },
  errorContainer: { textAlign: 'center', padding: '40px 20px', color: '#a6372a' },
  retryButton: {
    padding: '8px 24px', fontSize: '14px', backgroundColor: 'var(--accent-2)',
    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
};

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
    <div
      style={{ ...styles.card, borderTop: `3px solid ${color}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 22px rgba(20, 35, 28, 0.13)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      <span style={styles.cardLabel}>{label}</span>
      <span style={{ ...styles.cardValue, color }}>{value}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: '#fff', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 13 }}>
      <div style={{ fontWeight: 600 }}>{d.name || d.payload?.name}</div>
      <div style={{ color: d.color || '#333' }}>{d.value}</div>
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [locationData, setLocationData] = useState([]);
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

      const statusRaw = statusRes.data || statusRes;
      const usersData = usersRes.data || usersRes;

      const summary = statusRaw.summary || statusRaw;
      const available = summary.available ?? 0;
      const assigned = summary.assigned ?? 0;
      const inMaintenance = summary.inMaintenance ?? summary.in_maintenance ?? 0;
      const retired = summary.retired ?? 0;
      const total = summary.totalDevices ?? summary.total ?? (available + assigned + inMaintenance + retired);
      const usersList = usersData.users || usersData.data || usersData;
      const totalUsers = Array.isArray(usersList) ? usersList.length : (usersData.total ?? usersData.count ?? 0);

      setData({ total, available, assigned, in_maintenance: inMaintenance, retired, totalUsers });

      // Pie chart data - device status
      const pieData = [
        { name: 'Sẵn sàng', value: available },
        { name: 'Đã phân công', value: assigned },
        { name: 'Đang bảo trì', value: inMaintenance },
        { name: 'Đã thanh lý', value: retired },
      ].filter((d) => d.value > 0);
      setStatusData(pieData);

      // Bar chart data - by category
      const byCategory = statusRaw.byCategory || {};
      const catData = Object.entries(byCategory).map(([name, info]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '…' : name,
        'Số lượng': info.count ?? info,
      }));
      setCategoryData(catData);

      // Bar chart data - by location
      const byLocation = statusRaw.byLocation || {};
      const locData = Object.entries(byLocation).map(([name, info]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '…' : name,
        'Số lượng': info.count ?? info,
      }));
      setLocationData(locData);
    } catch {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.hero}>
          <div style={styles.titleBlock}>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Theo dõi tổng quan hệ thống thiết bị theo thời gian thực.</p>
          </div>
        </div>
        <div style={styles.errorContainer}>
          <p>{error}</p>
          <button style={styles.retryButton} onClick={fetchData}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Theo dõi tổng quan hệ thống thiết bị theo thời gian thực.</p>
        </div>
        <span style={styles.updatedBadge}>LIVE OVERVIEW</span>
      </div>

      {/* Summary cards */}
      <div style={styles.grid}>
        {loading
          ? CARD_CONFIG.map((c) => <SkeletonCard key={c.key} />)
          : CARD_CONFIG.map((c) => (
              <SummaryCard key={c.key} label={c.label} value={data?.[c.key] ?? 0} color={c.color} />
            ))}
      </div>

      {/* Charts */}
      {!loading && data && (
        <div style={styles.chartsRow}>
          {/* Pie: Device status */}
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Trạng thái thiết bị</div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>Không có dữ liệu</div>
            )}
          </div>

          {/* Bar: By category */}
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Thiết bị theo danh mục</div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="Số lượng" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>Không có dữ liệu</div>
            )}
          </div>

          {/* Bar: By location */}
          {locationData.length > 0 && (
            <div style={{ ...styles.chartCard, ...styles.fullWidth }}>
              <div style={styles.chartTitle}>Thiết bị theo vị trí</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={locationData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Số lượng" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
