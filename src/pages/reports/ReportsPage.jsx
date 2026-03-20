import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getWarrantyReport,
  getWarrantyAlerts,
  getDepreciationReport,
  getDeviceStatusReport,
  getInventoryValueReport,
  getAssignmentReport,
  getMaintenanceReport,
  generateCustomReport,
  exportReport,
} from '../../api/reportService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNotification } from '../../components/Notification';

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
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s, transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '120px',
    justifyContent: 'center',
  },
  cardActive: {
    boxShadow: '0 2px 8px rgba(25,118,210,0.3)',
    borderBottom: '3px solid #1976d2',
  },
  cardEmoji: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#888',
  },
  reportSection: {
    background: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  reportTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  exportBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    backgroundColor: '#388e3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  closeBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    backgroundColor: '#757575',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    borderBottom: '2px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
    fontWeight: 600,
    fontSize: '13px',
    color: '#333',
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '13px',
    color: '#555',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 16px',
    color: '#999',
    fontSize: '14px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#d32f2f',
  },
  retryButton: {
    padding: '8px 24px',
    fontSize: '14px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '12px',
  },
};

const REPORT_TYPES = [
  {
    key: 'warranty',
    emoji: '🛡️',
    title: 'Bảo hành',
    desc: 'Báo cáo tình trạng bảo hành thiết bị',
    fetchFn: getWarrantyReport,
    restricted: false,
  },
  {
    key: 'warranty-alerts',
    emoji: '⚠️',
    title: 'Cảnh báo bảo hành',
    desc: 'Thiết bị sắp hết hạn bảo hành',
    fetchFn: getWarrantyAlerts,
    restricted: false,
  },
  {
    key: 'device-status',
    emoji: '📊',
    title: 'Trạng thái thiết bị',
    desc: 'Thống kê trạng thái các thiết bị',
    fetchFn: getDeviceStatusReport,
    restricted: false,
  },
  {
    key: 'assignments',
    emoji: '👤',
    title: 'Phân công',
    desc: 'Báo cáo phân công thiết bị',
    fetchFn: getAssignmentReport,
    restricted: false,
  },
  {
    key: 'depreciation',
    emoji: '📉',
    title: 'Khấu hao',
    desc: 'Báo cáo khấu hao tài sản',
    fetchFn: getDepreciationReport,
    restricted: true,
  },
  {
    key: 'inventory-value',
    emoji: '💰',
    title: 'Giá trị tồn kho',
    desc: 'Tổng giá trị tài sản hiện có',
    fetchFn: getInventoryValueReport,
    restricted: true,
  },
  {
    key: 'maintenance',
    emoji: '🔧',
    title: 'Bảo trì',
    desc: 'Báo cáo hoạt động bảo trì',
    fetchFn: getMaintenanceReport,
    restricted: true,
  },
  {
    key: 'custom',
    emoji: '📝',
    title: 'Báo cáo tùy chỉnh',
    desc: 'Tạo báo cáo theo yêu cầu',
    fetchFn: generateCustomReport,
    restricted: true,
  },
];

const PRIVILEGED_ROLES = ['admin', 'inventory_manager'];

function buildColumns(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const sample = data[0];
  return Object.keys(sample).map((key) => ({
    key,
    label: key,
  }));
}

function formatCellValue(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const userRole = user?.role?.toLowerCase() || '';
  const isPrivileged = PRIVILEGED_ROLES.includes(userRole);

  const visibleReports = REPORT_TYPES.filter(
    (r) => !r.restricted || isPrivileged
  );

  const handleSelectReport = useCallback(async (report) => {
    setSelectedReport(report);
    setReportData(null);
    setError(null);
    setLoading(true);
    try {
      const payload = report.key === 'custom' ? { type: 'custom' } : undefined;
      const res = await report.fetchFn(payload);
      const raw = res.data ?? res;
      setReportData(Array.isArray(raw) ? raw : raw.data ?? raw.records ?? [raw]);
    } catch {
      setError('Không thể tải báo cáo. Vui lòng thử lại.');
      showNotification({ type: 'error', message: 'Lỗi khi tải báo cáo' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedReport) return;
    setExporting(true);
    try {
      const res = await exportReport({ type: selectedReport.key });
      const blob = res.data instanceof Blob
        ? res.data
        : new Blob([JSON.stringify(res.data ?? res)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${selectedReport.key}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification({ type: 'success', message: 'Xuất báo cáo thành công' });
    } catch {
      showNotification({ type: 'error', message: 'Lỗi khi xuất báo cáo' });
    } finally {
      setExporting(false);
    }
  }, [selectedReport]);

  const handleClose = () => {
    setSelectedReport(null);
    setReportData(null);
    setError(null);
  };

  const columns = reportData ? buildColumns(reportData) : [];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Báo cáo</h1>

      <div style={styles.grid}>
        {visibleReports.map((r) => (
          <div
            key={r.key}
            style={{
              ...styles.card,
              ...(selectedReport?.key === r.key ? styles.cardActive : {}),
            }}
            onClick={() => handleSelectReport(r)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow =
                selectedReport?.key === r.key
                  ? '0 2px 8px rgba(25,118,210,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.12)';
            }}
          >
            <span style={styles.cardEmoji}>{r.emoji}</span>
            <span style={styles.cardTitle}>{r.title}</span>
            <span style={styles.cardDesc}>{r.desc}</span>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div style={styles.reportSection}>
          <div style={styles.reportHeader}>
            <span style={styles.reportTitle}>
              {selectedReport.emoji} {selectedReport.title}
            </span>
            <div style={styles.headerButtons}>
              {isPrivileged && (
                <button
                  style={{
                    ...styles.exportBtn,
                    opacity: exporting ? 0.6 : 1,
                    cursor: exporting ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
                </button>
              )}
              <button style={styles.closeBtn} onClick={handleClose}>
                Đóng
              </button>
            </div>
          </div>

          {loading && <LoadingSpinner />}

          {error && (
            <div style={styles.errorContainer}>
              <p>{error}</p>
              <button
                style={styles.retryButton}
                onClick={() => handleSelectReport(selectedReport)}
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && reportData && (
            <>
              {reportData.length === 0 ? (
                <div style={styles.emptyState}>Không có dữ liệu</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th key={col.key} style={styles.th}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, idx) => (
                        <tr key={row._id || row.id || idx}>
                          {columns.map((col) => (
                            <td key={col.key} style={styles.td}>
                              {formatCellValue(row[col.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
