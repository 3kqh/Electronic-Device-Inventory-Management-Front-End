import React, { useState, useEffect, useCallback } from 'react';
import {
  getSystemSettings,
  updateSystemSetting,
  deleteSystemSetting,
  getDatabaseStats,
  createBackup,
  getBackupList,
  downloadBackup,
  deleteBackup,
} from '../../api/systemService';
import { getAuditLogs, exportAuditLogs } from '../../api/auditLogService';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNotification } from '../../components/Notification';

const styles = {
  container: { padding: '24px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
  },
  title: { fontSize: '24px', fontWeight: 600, color: '#333', margin: 0 },
  tabBar: {
    display: 'flex', gap: 0, marginBottom: '20px', borderBottom: '2px solid #e0e0e0',
  },
  tab: {
    padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
    border: 'none', backgroundColor: 'transparent', color: '#757575',
    borderBottom: '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s',
  },
  tabActive: {
    color: '#1976d2', borderBottom: '2px solid #1976d2', fontWeight: 600,
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
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' },
  th: {
    padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e0e0e0',
    backgroundColor: '#f5f5f5', fontWeight: 600, fontSize: 14, color: '#333',
  },
  td: {
    padding: '10px 16px', borderBottom: '1px solid #e0e0e0', fontSize: 14, color: '#555',
  },
  emptyState: {
    textAlign: 'center', padding: '40px 16px', color: '#999', fontSize: 15,
  },
  actionBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #ccc',
    borderRadius: 4, backgroundColor: '#fff', cursor: 'pointer', marginRight: 6,
  },
  deleteBtn: {
    padding: '4px 10px', fontSize: 13, border: '1px solid #d32f2f',
    borderRadius: 4, backgroundColor: '#fff', color: '#d32f2f', cursor: 'pointer',
  },
  addButton: {
    padding: '10px 20px', backgroundColor: '#1976d2', color: '#fff',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
  },
  input: {
    padding: '8px 12px', fontSize: 14, border: '1px solid #ccc',
    borderRadius: 4, outline: 'none', boxSizing: 'border-box',
  },
  addRow: {
    display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 8, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16,
    display: 'inline-block', minWidth: 200, marginRight: 16, verticalAlign: 'top',
  },
  cardLabel: { fontSize: 13, color: '#757575', marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: 700, color: '#333' },
  statsGrid: { marginBottom: 20 },
  filterRow: {
    display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap',
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  filterLabel: { fontSize: 13, fontWeight: 500, color: '#555' },
  select: {
    padding: '8px 12px', fontSize: 14, border: '1px solid #ccc',
    borderRadius: 4, outline: 'none', backgroundColor: '#fff',
  },
  searchBtn: {
    padding: '8px 18px', fontSize: 14, border: 'none', borderRadius: 4,
    backgroundColor: '#1976d2', color: '#fff', cursor: 'pointer',
  },
  levelBadge: {
    padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
    display: 'inline-block', textTransform: 'uppercase',
  },
};

const levelColors = {
  info: { backgroundColor: '#e3f2fd', color: '#1565c0' },
  warn: { backgroundColor: '#fff3e0', color: '#e65100' },
  error: { backgroundColor: '#ffebee', color: '#c62828' },
};

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState('settings');

  // ── Settings state ──
  const [settings, setSettings] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Database stats state ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // ── Backup state ──
  const [backups, setBackups] = useState([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [backupsError, setBackupsError] = useState('');
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [deleteBackupTarget, setDeleteBackupTarget] = useState(null);

  // ── Logs state ──
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [logFilters, setLogFilters] = useState({
    startDate: '', endDate: '', level: '',
  });

  // ── Fetch settings ──
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const res = await getSystemSettings();
      const data = res.data;
      const list = data.settings || data.data || data || [];
      setSettings(Array.isArray(list) ? list : Object.entries(list).map(([key, value]) => ({ key, value })));
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Không thể tải cài đặt hệ thống');
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await getDatabaseStats();
      setStats(res.data.stats || res.data.data || res.data);
    } catch (err) {
      setStatsError(err.response?.data?.message || 'Không thể tải thống kê cơ sở dữ liệu');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch backups ──
  const fetchBackups = useCallback(async () => {
    setBackupsLoading(true);
    setBackupsError('');
    try {
      const res = await getBackupList();
      const data = res.data;
      setBackups(data.backups || data.data || data || []);
    } catch (err) {
      setBackupsError(err.response?.data?.message || 'Không thể tải danh sách bản sao lưu');
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  // ── Fetch logs ──
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const params = {};
      if (logFilters.startDate) params.fromDate = logFilters.startDate;
      if (logFilters.endDate) params.toDate = logFilters.endDate;
      if (logFilters.level) params.action = logFilters.level;
      const res = await getAuditLogs(params);
      const data = res.data;
      const list = data.data || data.logs || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      setLogsError(err.response?.data?.message || 'Không thể tải nhật ký hệ thống');
    } finally {
      setLogsLoading(false);
    }
  }, [logFilters]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'backup') fetchBackups();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, fetchSettings, fetchStats, fetchBackups, fetchLogs]);

  // ── Settings handlers ──
  const handleEditSetting = (item) => {
    setEditingKey(item.key);
    setEditValue(typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value));
  };

  const handleSaveEdit = async () => {
    try {
      await updateSystemSetting({ key: editingKey, value: editValue });
      showNotification({ type: 'success', message: 'Cập nhật cài đặt thành công' });
      setEditingKey(null);
      setEditValue('');
      fetchSettings();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi cập nhật cài đặt' });
    }
  };

  const handleAddSetting = async () => {
    if (!newKey.trim()) {
      showNotification({ type: 'error', message: 'Vui lòng nhập khóa cài đặt' });
      return;
    }
    try {
      await updateSystemSetting({ key: newKey.trim(), value: newValue });
      showNotification({ type: 'success', message: 'Thêm cài đặt thành công' });
      setNewKey('');
      setNewValue('');
      fetchSettings();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi thêm cài đặt' });
    }
  };

  const handleDeleteSetting = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSystemSetting(deleteTarget.key);
      showNotification({ type: 'success', message: 'Xóa cài đặt thành công' });
      setDeleteTarget(null);
      fetchSettings();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa cài đặt' });
      setDeleteTarget(null);
    }
  };

  // ── Backup handlers ──
  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await createBackup();
      showNotification({ type: 'success', message: 'Tạo bản sao lưu thành công' });
      fetchBackups();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi tạo bản sao lưu' });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      const res = await downloadBackup(filename);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi tải bản sao lưu' });
    }
  };

  const handleDeleteBackup = async () => {
    if (!deleteBackupTarget) return;
    try {
      await deleteBackup(deleteBackupTarget.filename || deleteBackupTarget.name);
      showNotification({ type: 'success', message: 'Xóa bản sao lưu thành công' });
      setDeleteBackupTarget(null);
      fetchBackups();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa bản sao lưu' });
      setDeleteBackupTarget(null);
    }
  };

  // ── Log filter handler ──
  const handleLogFilterChange = (e) => {
    setLogFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExportLogs = async () => {
    try {
      const params = {};
      if (logFilters.startDate) params.fromDate = logFilters.startDate;
      if (logFilters.endDate) params.toDate = logFilters.endDate;
      if (logFilters.level) params.action = logFilters.level;
      const res = await exportAuditLogs(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification({ type: 'success', message: 'Xuất nhật ký thành công' });
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xuất nhật ký' });
    }
  };

  const formatDate = (val) => {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleString('vi-VN');
    } catch {
      return val;
    }
  };

  const formatSize = (bytes) => {
    if (bytes == null) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Hệ thống</h1>
      </div>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'settings' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('settings')}
        >
          Cài đặt hệ thống
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'stats' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('stats')}
        >
          Thống kê CSDL
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'backup' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('backup')}
        >
          Sao lưu
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'logs' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('logs')}
        >
          Nhật ký hệ thống
        </button>
      </div>

      {/* ── Settings Tab ── */}
      {activeTab === 'settings' && (
        <>
          {/* Add new setting row */}
          <div style={styles.addRow}>
            <input
              style={{ ...styles.input, width: 200 }}
              type="text"
              placeholder="Khóa"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <input
              style={{ ...styles.input, width: 300 }}
              type="text"
              placeholder="Giá trị"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <button style={styles.addButton} onClick={handleAddSetting}>Thêm</button>
          </div>

          {settingsError && (
            <div style={styles.error}>
              <span>{settingsError}</span>
              <button style={styles.retryButton} onClick={fetchSettings}>Thử lại</button>
            </div>
          )}

          {settingsLoading ? (
            <LoadingSpinner />
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Khóa</th>
                  <th style={styles.th}>Giá trị</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {settings.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={styles.emptyState}>Không có cài đặt nào</td>
                  </tr>
                ) : (
                  settings.map((item) => (
                    <tr key={item.key}>
                      <td style={styles.td}>{item.key}</td>
                      <td style={styles.td}>
                        {editingKey === item.key ? (
                          <input
                            style={{ ...styles.input, width: '100%' }}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); }}
                          />
                        ) : (
                          typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value)
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingKey === item.key ? (
                          <>
                            <button style={styles.actionBtn} onClick={handleSaveEdit}>Lưu</button>
                            <button style={styles.actionBtn} onClick={() => setEditingKey(null)}>Hủy</button>
                          </>
                        ) : (
                          <>
                            <button style={styles.actionBtn} onClick={() => handleEditSetting(item)}>Sửa</button>
                            <button style={styles.deleteBtn} onClick={() => setDeleteTarget(item)}>Xóa</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          <ConfirmDialog
            open={!!deleteTarget}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa cài đặt "${deleteTarget?.key || ''}" không?`}
            onConfirm={handleDeleteSetting}
            onCancel={() => setDeleteTarget(null)}
          />
        </>
      )}

      {/* ── Database Stats Tab ── */}
      {activeTab === 'stats' && (
        <>
          {statsError && (
            <div style={styles.error}>
              <span>{statsError}</span>
              <button style={styles.retryButton} onClick={fetchStats}>Thử lại</button>
            </div>
          )}

          {statsLoading ? (
            <LoadingSpinner />
          ) : stats ? (
            <div style={styles.statsGrid}>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} style={styles.card}>
                  <div style={styles.cardLabel}>{key}</div>
                  <div style={styles.cardValue}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>Không có dữ liệu thống kê</div>
          )}
        </>
      )}

      {/* ── Backup Tab ── */}
      {activeTab === 'backup' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button
              style={styles.addButton}
              onClick={handleCreateBackup}
              disabled={creatingBackup}
            >
              {creatingBackup ? 'Đang tạo...' : 'Tạo bản sao lưu'}
            </button>
          </div>

          {backupsError && (
            <div style={styles.error}>
              <span>{backupsError}</span>
              <button style={styles.retryButton} onClick={fetchBackups}>Thử lại</button>
            </div>
          )}

          {backupsLoading ? (
            <LoadingSpinner />
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tên tệp</th>
                  <th style={styles.th}>Ngày tạo</th>
                  <th style={styles.th}>Kích thước</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {backups.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.emptyState}>Không có bản sao lưu nào</td>
                  </tr>
                ) : (
                  backups.map((b, idx) => (
                    <tr key={b.filename || b.name || idx}>
                      <td style={styles.td}>{b.filename || b.name || '—'}</td>
                      <td style={styles.td}>{formatDate(b.createdAt || b.date)}</td>
                      <td style={styles.td}>{formatSize(b.size)}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleDownloadBackup(b.filename || b.name)}
                        >
                          Tải xuống
                        </button>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => setDeleteBackupTarget(b)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          <ConfirmDialog
            open={!!deleteBackupTarget}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa bản sao lưu "${deleteBackupTarget?.filename || deleteBackupTarget?.name || ''}" không?`}
            onConfirm={handleDeleteBackup}
            onCancel={() => setDeleteBackupTarget(null)}
          />
        </>
      )}

      {/* ── System Logs Tab ── */}
      {activeTab === 'logs' && (
        <>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Từ ngày</label>
              <input
                style={styles.input}
                type="date"
                name="startDate"
                value={logFilters.startDate}
                onChange={handleLogFilterChange}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Đến ngày</label>
              <input
                style={styles.input}
                type="date"
                name="endDate"
                value={logFilters.endDate}
                onChange={handleLogFilterChange}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Hành động</label>
              <select
                style={styles.select}
                name="level"
                value={logFilters.level}
                onChange={handleLogFilterChange}
              >
                <option value="">Tất cả</option>
                <option value="CREATE">Tạo mới</option>
                <option value="UPDATE">Cập nhật</option>
                <option value="DELETE">Xóa</option>
                <option value="LOGIN">Đăng nhập</option>
              </select>
            </div>
            <button style={styles.searchBtn} onClick={fetchLogs}>Lọc</button>
            <button
              style={{ ...styles.searchBtn, backgroundColor: '#388e3c' }}
              onClick={handleExportLogs}
            >
              Xuất CSV
            </button>
          </div>

          {logsError && (
            <div style={styles.error}>
              <span>{logsError}</span>
              <button style={styles.retryButton} onClick={fetchLogs}>Thử lại</button>
            </div>
          )}

          {logsLoading ? (
            <LoadingSpinner />
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Thời gian</th>
                  <th style={styles.th}>Hành động</th>
                  <th style={styles.th}>Module</th>
                  <th style={styles.th}>Người dùng</th>
                  <th style={styles.th}>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyState}>Không có nhật ký nào</td>
                  </tr>
                ) : (
                  logs.map((log, idx) => {
                    const userName = log.userId && typeof log.userId === 'object'
                      ? `${log.userId.firstName || ''} ${log.userId.lastName || ''}`.trim()
                      : '—';
                    return (
                      <tr key={log._id || idx}>
                        <td style={styles.td}>{formatDate(log.createdAt || log.timestamp)}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.levelBadge,
                            ...(levelColors[log.action] || levelColors.info),
                          }}>
                            {log.action || '—'}
                          </span>
                        </td>
                        <td style={styles.td}>{log.module || '—'}</td>
                        <td style={styles.td}>{userName}</td>
                        <td style={styles.td}>{log.description || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
