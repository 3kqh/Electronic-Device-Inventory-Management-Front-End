import { apiClient } from "./axiosClient";

export const getAuditLogs = (params) =>
  apiClient.get("/audit-logs", { params });

export const exportAuditLogs = (params) =>
  apiClient.get("/audit-logs/export", { params, responseType: "blob" });
