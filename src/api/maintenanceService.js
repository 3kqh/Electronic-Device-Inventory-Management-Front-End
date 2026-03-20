import { apiClient } from "./axiosClient";

export const getAllMaintenance = (params) =>
  apiClient.get("/maintenance", { params });

export const getMaintenanceById = (id) =>
  apiClient.get(`/maintenance/${id}`);

export const recordMaintenance = (data) =>
  apiClient.post("/maintenance/record", data);

export const requestMaintenance = (data) =>
  apiClient.post("/maintenance/request", data);

export const scheduleMaintenance = (data) =>
  apiClient.post("/maintenance/schedule", data);

export const updateMaintenance = (id, data) =>
  apiClient.put(`/maintenance/${id}`, data);

export const completeMaintenance = (id, data) =>
  apiClient.patch(`/maintenance/${id}/complete`, data);

export const cancelMaintenance = (id) =>
  apiClient.patch(`/maintenance/${id}/cancel`);

export const getUpcomingMaintenance = () =>
  apiClient.get("/maintenance/upcoming");

export const getMaintenanceHistory = (deviceId) =>
  apiClient.get(`/maintenance/history/${deviceId}`);
