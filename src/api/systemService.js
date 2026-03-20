import { apiClient } from "./axiosClient";

export const healthCheck = () =>
  apiClient.get("/system/health");

export const getSystemSettings = () =>
  apiClient.get("/system/settings");

export const updateSystemSetting = (data) =>
  apiClient.post("/system/settings", data);

export const deleteSystemSetting = (key) =>
  apiClient.delete(`/system/settings/${key}`);

export const getDatabaseStats = () =>
  apiClient.get("/system/stats");

export const createBackup = () =>
  apiClient.post("/system/backup/create");

export const getBackupList = () =>
  apiClient.get("/system/backup/list");

export const downloadBackup = (filename) =>
  apiClient.get(`/system/backup/download/${filename}`);

export const deleteBackup = (filename) =>
  apiClient.delete(`/system/backup/delete/${filename}`);

export const getSystemLogs = (params) =>
  apiClient.get("/system/logs", { params });
