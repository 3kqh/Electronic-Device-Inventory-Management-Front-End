import { apiClient } from "./axiosClient";

// Warranties
export const getAllWarranties = (params) =>
  apiClient.get("/warranties", { params });

export const getWarrantyById = (id) =>
  apiClient.get(`/warranties/${id}`);

export const createWarranty = (data) =>
  apiClient.post("/warranties", data);

export const updateWarranty = (id, data) =>
  apiClient.put(`/warranties/${id}`, data);

export const deleteWarranty = (id) =>
  apiClient.delete(`/warranties/${id}`);

export const getExpiringWarranties = (days) =>
  apiClient.get(`/warranties/expiring/${days}`);

export const refreshWarrantyStatus = () =>
  apiClient.get("/warranties/refresh-status");

// Warranty Claims
export const getAllWarrantyClaims = () =>
  apiClient.get("/warranties/claims");

export const getWarrantyClaimById = (id) =>
  apiClient.get(`/warranties/claims/${id}`);

export const createWarrantyClaim = (data) =>
  apiClient.post("/warranties/claims", data);

export const updateWarrantyClaim = (id, data) =>
  apiClient.put(`/warranties/claims/${id}`, data);

export const deleteWarrantyClaim = (id) =>
  apiClient.delete(`/warranties/claims/${id}`);
