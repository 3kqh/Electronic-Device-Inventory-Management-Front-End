import { apiClient } from "./axiosClient";

export const getAllAssignments = (params) =>
  apiClient.get("/assignments", { params });

export const getAssignmentById = (id) =>
  apiClient.get(`/assignments/${id}`);

export const assignDevice = (data) =>
  apiClient.post("/assignments", data);

export const updateAssignment = (id, data) =>
  apiClient.put(`/assignments/${id}`, data);

export const unassignDevice = (id) =>
  apiClient.delete(`/assignments/${id}`);

export const transferDevice = (id, data) =>
  apiClient.post(`/assignments/${id}/transfer`, data);

export const getAssignmentHistory = (deviceId) =>
  apiClient.get(`/assignments/device/${deviceId}/history`);

export const getUserAssignments = (userId) =>
  apiClient.get(`/assignments/user/${userId}`);

export const acknowledgeAssignment = (id) =>
  apiClient.patch(`/assignments/${id}/acknowledge`);
