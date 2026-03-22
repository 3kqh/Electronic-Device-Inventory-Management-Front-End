import { apiClient } from "./axiosClient";

export const getWarrantyReport = () =>
  apiClient.get("/reports/warranty");

export const getWarrantyAlerts = () =>
  apiClient.get("/reports/warranty-alerts");

export const getDepreciationReport = (categoryId) =>
  apiClient.get("/reports/depreciation", { params: { categoryId } });

export const getDeviceStatusReport = () =>
  apiClient.get("/reports/device-status");

export const getInventoryValueReport = () =>
  apiClient.get("/reports/inventory-value");

export const getAssignmentReport = () =>
  apiClient.get("/reports/assignments");

export const getMaintenanceReport = () =>
  apiClient.get("/reports/maintenance");

export const generateCustomReport = (data) =>
  apiClient.post("/reports/custom", data);

export const exportReport = (data) =>
  apiClient.post("/reports/export", data);
