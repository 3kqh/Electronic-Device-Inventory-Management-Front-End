import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllDepreciationRules,
  createDepreciationRule,
  updateDepreciationRule,
  deleteDepreciationRule,
  calculateDeviceDepreciation,
} from '../../api/depreciationService';
import { getAllCategories } from '../../api/categoryService';
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
  deviceSection: {
    marginTop: 8,
  },
  searchRow: {
    display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20,
  },
  searchInput: {
    padding: '8px 12px', fontSize: 14, border: '1px solid #ccc',
    borderRadius: 4, outline: 'none', width: 260, boxSizing: 'border-box',
  },
  searchBtn: {
    padding: '8px 18px', fontSize: 14, border: 'none', borderRadius: 4,
    backgroundColor: '#1976d2', color: '#fff', cursor: 'pointer',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 8, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#333', marginTop: 0, marginBottom: 16 },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
    borderBottom: '1px solid #f0f0f0', fontSize: 14,
  },
  infoLabel: { color: '#757575', fontWeight: 500 },
  infoValue: { color: '#333', fontWeight: 600 },
  scheduleTable: {
    width: '100%', borderCollapse: 'collapse', marginTop: 12,
  },
  scheduleTh: {
    padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0',
    backgroundColor: '#f5f5f5', fontWeight: 600, fontSize: 13, color: '#333',
  },
  scheduleTd: {
    padding: '8px 12px', borderBottom: '1px solid #e0e0e0', fontSize: 13, color: '#555',
  },
};

const methodLabels = {
  straight_line: 'Đường thẳng',
  declining_balance: 'Số dư giảm dần',
};

const emptyForm = {
  categoryId: '',
  method: '',
  usefulLifeYears: '',
  salvageValuePercent: '',
  depreciationRate: '',
};

function formatCurrency(val) {
  if (val == null || isNaN(val)) return '—';
  return Number(val).toLocaleString('vi-VN') + ' ₫';
}

export default function DepreciationPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'inventory_manager';

  const [activeTab, setActiveTab] = useState('rules');

  // ── Rules tab state ──
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Device depreciation tab state ──
  const [deviceId, setDeviceId] = useState('');
  const [deviceDepreciation, setDeviceDepreciation] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [deviceError, setDeviceError] = useState('');

  // ── Rules columns ──
  const columns = [
    {
      key: 'categoryId',
      label: 'Danh mục',
      sortable: true,
      render: (val) => {
        if (val && typeof val === 'object') return val.name || '—';
        const cat = categories.find((c) => (c._id || c.id) === val);
        return cat ? cat.name : val || '—';
      },
    },
    {
      key: 'method',
      label: 'Phương pháp',
      render: (val) => methodLabels[val] || val || '—',
    },
    {
      key: 'usefulLifeYears',
      label: 'Thời gian sử dụng (năm)',
      render: (val) => (val != null ? val : '—'),
    },
    {
      key: 'salvageValuePercent',
      label: 'Giá trị thu hồi (%)',
      render: (val) => (val != null ? `${val}%` : '—'),
    },
    {
      key: 'depreciationRate',
      label: 'Tỷ lệ khấu hao',
      render: (val) => (val != null ? `${val}%` : '—'),
    },
    ...(canEdit
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

  // ── Fetch rules ──
  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllDepreciationRules();
      const data = res.data;
      setRules(data.rules || data.data || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách quy tắc khấu hao');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getAllCategories();
      const data = res.data;
      setCategories(data.categories || data.data || data || []);
    } catch {
      // Silently fail — category dropdown will be empty
    }
  }, []);

  useEffect(() => {
    fetchRules();
    fetchCategories();
  }, [fetchRules, fetchCategories]);

  // ── Form handlers ──
  const handleEdit = (row) => {
    setEditingId(row._id || row.id);
    const catIdVal = row.categoryId && typeof row.categoryId === 'object'
      ? (row.categoryId._id || row.categoryId.id || '')
      : (row.categoryId || '');
    setForm({
      categoryId: catIdVal,
      method: row.method || '',
      usefulLifeYears: row.usefulLifeYears != null ? String(row.usefulLifeYears) : '',
      salvageValuePercent: row.salvageValuePercent != null ? String(row.salvageValuePercent) : '',
      depreciationRate: row.depreciationRate != null ? String(row.depreciationRate) : '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormErrors({});
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.categoryId) errs.categoryId = 'Vui lòng chọn danh mục';
    if (!form.method) errs.method = 'Vui lòng chọn phương pháp khấu hao';
    if (!form.usefulLifeYears || Number(form.usefulLifeYears) <= 0) {
      errs.usefulLifeYears = 'Thời gian sử dụng phải lớn hơn 0';
    }
    if (form.salvageValuePercent === '' || Number(form.salvageValuePercent) < 0 || Number(form.salvageValuePercent) > 100) {
      errs.salvageValuePercent = 'Giá trị thu hồi phải từ 0 đến 100';
    }
    if (form.depreciationRate === '' || Number(form.depreciationRate) < 0) {
      errs.depreciationRate = 'Tỷ lệ khấu hao không hợp lệ';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        method: form.method,
        usefulLifeYears: Number(form.usefulLifeYears),
        salvageValuePercent: Number(form.salvageValuePercent),
        depreciationRate: Number(form.depreciationRate),
      };
      if (editingId) {
        await updateDepreciationRule(editingId, payload);
        showNotification({ type: 'success', message: 'Cập nhật quy tắc khấu hao thành công' });
      } else {
        await createDepreciationRule(payload);
        showNotification({ type: 'success', message: 'Thêm quy tắc khấu hao thành công' });
      }
      setShowForm(false);
      fetchRules();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi lưu quy tắc khấu hao';
      showNotification({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDepreciationRule(deleteTarget._id || deleteTarget.id);
      showNotification({ type: 'success', message: 'Xóa quy tắc khấu hao thành công' });
      setDeleteTarget(null);
      fetchRules();
    } catch (err) {
      showNotification({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa quy tắc khấu hao' });
      setDeleteTarget(null);
    }
  };

  // ── Device depreciation handler ──
  const handleCalculateDepreciation = async () => {
    if (!deviceId.trim()) {
      setDeviceError('Vui lòng nhập mã thiết bị');
      return;
    }
    setDeviceLoading(true);
    setDeviceError('');
    setDeviceDepreciation(null);
    try {
      const res = await calculateDeviceDepreciation(deviceId.trim());
      setDeviceDepreciation(res.data);
    } catch (err) {
      setDeviceError(err.response?.data?.message || 'Không thể tính khấu hao cho thiết bị này');
    } finally {
      setDeviceLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c._id || c.id,
    label: c.name || c.code || c._id,
  }));

  const methodOptions = [
    { value: 'straight_line', label: 'Đường thẳng' },
    { value: 'declining_balance', label: 'Số dư giảm dần' },
  ];

  if (loading && rules.length === 0 && activeTab === 'rules') return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Khấu hao</h1>
      </div>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'rules' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('rules')}
        >
          Quy tắc khấu hao
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'device' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('device')}
        >
          Khấu hao thiết bị
        </button>
      </div>

      {/* ── Rules Tab ── */}
      {activeTab === 'rules' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            {canEdit && (
              <button style={styles.addButton} onClick={handleAdd}>Thêm quy tắc</button>
            )}
          </div>

          {error && (
            <div style={styles.error}>
              <span>{error}</span>
              <button style={styles.retryButton} onClick={fetchRules}>Thử lại</button>
            </div>
          )}

          <DataTable columns={columns} data={rules} loading={loading} />

          {/* Add/Edit modal */}
          {showForm && (
            <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
              <div style={styles.formDialog} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.formTitle}>{editingId ? 'Sửa quy tắc khấu hao' : 'Thêm quy tắc khấu hao'}</h2>
                <FormField
                  label="Danh mục"
                  name="categoryId"
                  type="select"
                  value={form.categoryId}
                  onChange={handleFormChange}
                  options={categoryOptions}
                  error={formErrors.categoryId}
                  required
                />
                <FormField
                  label="Phương pháp khấu hao"
                  name="method"
                  type="select"
                  value={form.method}
                  onChange={handleFormChange}
                  options={methodOptions}
                  error={formErrors.method}
                  required
                />
                <FormField
                  label="Thời gian sử dụng (năm)"
                  name="usefulLifeYears"
                  type="number"
                  value={form.usefulLifeYears}
                  onChange={handleFormChange}
                  error={formErrors.usefulLifeYears}
                  required
                />
                <FormField
                  label="Giá trị thu hồi (%)"
                  name="salvageValuePercent"
                  type="number"
                  value={form.salvageValuePercent}
                  onChange={handleFormChange}
                  error={formErrors.salvageValuePercent}
                  required
                />
                <FormField
                  label="Tỷ lệ khấu hao (%)"
                  name="depreciationRate"
                  type="number"
                  value={form.depreciationRate}
                  onChange={handleFormChange}
                  error={formErrors.depreciationRate}
                  required
                />
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
            message={`Bạn có chắc chắn muốn xóa quy tắc khấu hao cho danh mục "${deleteTarget?.categoryId?.name || ''}" không?`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        </>
      )}

      {/* ── Device Depreciation Tab ── */}
      {activeTab === 'device' && (
        <div style={styles.deviceSection}>
          <div style={styles.searchRow}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Nhập mã thiết bị (Device ID)..."
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCalculateDepreciation(); }}
            />
            <button
              style={styles.searchBtn}
              onClick={handleCalculateDepreciation}
              disabled={deviceLoading}
            >
              {deviceLoading ? 'Đang tính...' : 'Tính khấu hao'}
            </button>
          </div>

          {deviceError && (
            <div style={styles.error}>
              <span>{deviceError}</span>
            </div>
          )}

          {deviceLoading && <LoadingSpinner />}

          {deviceDepreciation && !deviceLoading && (
            <>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Thông tin khấu hao thiết bị</h3>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Giá mua</span>
                  <span style={styles.infoValue}>{formatCurrency(deviceDepreciation.purchasePrice)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Giá trị hiện tại</span>
                  <span style={styles.infoValue}>{formatCurrency(deviceDepreciation.currentValue)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Khấu hao lũy kế</span>
                  <span style={styles.infoValue}>{formatCurrency(deviceDepreciation.accumulatedDepreciation)}</span>
                </div>
                {deviceDepreciation.method && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Phương pháp</span>
                    <span style={styles.infoValue}>{methodLabels[deviceDepreciation.method] || deviceDepreciation.method}</span>
                  </div>
                )}
                {deviceDepreciation.usefulLifeYears != null && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Thời gian sử dụng</span>
                    <span style={styles.infoValue}>{deviceDepreciation.usefulLifeYears} năm</span>
                  </div>
                )}
              </div>

              {/* Depreciation schedule */}
              {deviceDepreciation.schedule && deviceDepreciation.schedule.length > 0 && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Lịch khấu hao</h3>
                  <table style={styles.scheduleTable}>
                    <thead>
                      <tr>
                        <th style={styles.scheduleTh}>Năm</th>
                        <th style={styles.scheduleTh}>Khấu hao trong kỳ</th>
                        <th style={styles.scheduleTh}>Khấu hao lũy kế</th>
                        <th style={styles.scheduleTh}>Giá trị còn lại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviceDepreciation.schedule.map((entry, idx) => (
                        <tr key={idx}>
                          <td style={styles.scheduleTd}>{entry.year || idx + 1}</td>
                          <td style={styles.scheduleTd}>{formatCurrency(entry.depreciation || entry.depreciationAmount)}</td>
                          <td style={styles.scheduleTd}>{formatCurrency(entry.accumulatedDepreciation || entry.accumulated)}</td>
                          <td style={styles.scheduleTd}>{formatCurrency(entry.bookValue || entry.remainingValue)}</td>
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
