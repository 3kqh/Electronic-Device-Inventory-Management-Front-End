import { apiClient } from "./axiosClient";

// CRUD
export const getAllDevices = (params) =>
  apiClient.get("/devices", { params });

export const getDeviceById = (id) =>
  apiClient.get(`/devices/${id}`);

export const addDevice = (data) =>
  apiClient.post("/devices", data);

export const updateDevice = (id, data) =>
  apiClient.put(`/devices/${id}`, data);

export const deleteDevice = (id) =>
  apiClient.delete(`/devices/${id}`);

export const disposeDevice = (id) =>
  apiClient.patch(`/devices/${id}/dispose`);

// Search
export const searchDevices = (query) =>
  apiClient.get("/devices/search", { params: { q: query } });

export const filterDevices = (params) =>
  apiClient.get("/devices/filter", { params });

export const advancedSearch = (params) =>
  apiClient.get("/devices/advanced-search", { params });

// Barcode
export const scanBarcode = (code) =>
  apiClient.get(`/devices/barcode/scan/${code}`);

export const generateBarcode = (deviceId) =>
  apiClient.post(`/devices/barcode/generate/${deviceId}`);

export const generateMultipleBarcodes = (deviceIds) =>
  apiClient.post("/devices/barcode/generate-multiple", { deviceIds });

// Labels
export const printAssetLabel = (id) =>
  apiClient.get(`/devices/label/${id}`);

export const bulkPrintAssetLabels = (ids) =>
  apiClient.post("/devices/labels/bulk", { ids });

// Bulk operations
export const bulkImportDevices = (data) =>
  apiClient.post("/devices/bulk/import", data);

export const bulkExportDevices = (params) =>
  apiClient.post("/devices/bulk/export", params);

export const bulkUpdateStatus = (data) =>
  apiClient.put("/devices/bulk/update-status", data);

export const bulkUpdateLocation = (data) =>
  apiClient.put("/devices/bulk/update-location", data);
