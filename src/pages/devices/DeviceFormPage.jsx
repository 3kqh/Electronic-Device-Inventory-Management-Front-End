import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeviceById, addDevice, updateDevice } from '../../api/deviceService';
import { getAllCategories } from '../../api/categoryService';
import { getAllLocations } from '../../api/locationService';
import FormField from '../../components/FormField';
import { showNotification } from '../../components/Notification';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Sẵn sàng' },
  { value: 'assigned', label: 'Đã phân công' },
  { value: 'in_maintenance', label: 'Đang bảo trì' },
  { value: 'retired', label: 'Đã thanh lý' },
];

const CONDITION_OPTIONS = [
  { value: 'new', label: 'Mới' },
  { value: 'good', label: 'Tốt' },
  { value: 'fair', label: 'Trung bình' },
  { value: 'poor', label: 'Kém' },
];

const initialFormData = {
  name: '',
  serialNumber: '',
  categoryId: '',
  manufacturer: '',
  model: '',
  purchaseDate: '',
  purchasePrice: '',
  locationId: '',
  status: 'available',
  condition: 'new',
};

const styles = {
  container: {
    padding: 24,
    maxWidth: 720,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 24,
    color: '#1a1a1a',
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  col: {
    flex: 1,
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  },
  submitBtn: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#1976d2',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  cancelBtn: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  errorBox: {
    padding: '12px 16px',
    marginBottom: 16,
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 4,
    fontSize: 14,
  },
};

export default function DeviceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, locRes] = await Promise.all([
          getAllCategories(),
          getAllLocations(),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
        setLocations(Array.isArray(locRes.data) ? locRes.data : locRes.data?.data || []);

        if (isEdit) {
          const deviceRes = await getDeviceById(id);
          const device = deviceRes.data?.data || deviceRes.data;
          setFormData({
            name: device.name || '',
            serialNumber: device.serialNumber || '',
            categoryId: (typeof device.categoryId === 'object' ? device.categoryId?._id : device.categoryId) || '',
            manufacturer: device.manufacturer || '',
            model: device.model || '',
            purchaseDate: device.purchaseDate ? device.purchaseDate.substring(0, 10) : '',
            purchasePrice: device.purchasePrice != null ? String(device.purchasePrice) : '',
            locationId: (typeof device.locationId === 'object' ? device.locationId?._id : device.locationId) || '',
            status: device.status || 'available',
            condition: device.condition || 'new',
          });
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.';
        setApiError(msg);
        showNotification({ type: 'error', message: msg });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên thiết bị là bắt buộc';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Số serial là bắt buộc';
    if (!formData.categoryId) newErrors.categoryId = 'Danh mục là bắt buộc';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Nhà sản xuất là bắt buộc';
    if (!formData.model.trim()) newErrors.model = 'Model là bắt buộc';
    if (formData.purchasePrice !== '' && (isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) < 0)) {
      newErrors.purchasePrice = 'Giá mua phải là số không âm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    const payload = {
      ...formData,
      purchasePrice: formData.purchasePrice !== '' ? Number(formData.purchasePrice) : undefined,
      purchaseDate: formData.purchaseDate || undefined,
      locationId: formData.locationId || undefined,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateDevice(id, payload);
        showNotification({ type: 'success', message: 'Cập nhật thiết bị thành công!' });
      } else {
        await addDevice(payload);
        showNotification({ type: 'success', message: 'Thêm thiết bị thành công!' });
      }
      navigate('/devices');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setApiError(msg);
      showNotification({ type: 'error', message: msg });
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.name }));
  const locationOptions = locations.map((l) => ({ value: l._id, label: l.name }));

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{isEdit ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}</h1>

      {apiError && <div style={styles.errorBox}>{apiError}</div>}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Tên thiết bị"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <FormField
          label="Số serial"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          error={errors.serialNumber}
          required
        />

        <div style={styles.row}>
          <div style={styles.col}>
            <FormField
              label="Danh mục"
              name="categoryId"
              type="select"
              value={formData.categoryId}
              onChange={handleChange}
              error={errors.categoryId}
              options={categoryOptions}
              required
            />
          </div>
          <div style={styles.col}>
            <FormField
              label="Vị trí"
              name="locationId"
              type="select"
              value={formData.locationId}
              onChange={handleChange}
              error={errors.locationId}
              options={locationOptions}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <FormField
              label="Nhà sản xuất"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              error={errors.manufacturer}
              required
            />
          </div>
          <div style={styles.col}>
            <FormField
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              error={errors.model}
              required
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <FormField
              label="Ngày mua"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
              error={errors.purchaseDate}
            />
          </div>
          <div style={styles.col}>
            <FormField
              label="Giá mua (VNĐ)"
              name="purchasePrice"
              type="number"
              value={formData.purchasePrice}
              onChange={handleChange}
              error={errors.purchasePrice}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <FormField
              label="Trạng thái"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              options={STATUS_OPTIONS}
            />
          </div>
          <div style={styles.col}>
            <FormField
              label="Tình trạng"
              name="condition"
              type="select"
              value={formData.condition}
              onChange={handleChange}
              error={errors.condition}
              options={CONDITION_OPTIONS}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitBtn,
              ...(submitting ? styles.submitBtnDisabled : {}),
            }}
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm thiết bị'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/devices')}
            style={styles.cancelBtn}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
