import { apiClient } from "./axiosClient";

export const getAllDepreciationRules = () =>
  apiClient.get("/depreciation");

export const getDepreciationRuleById = (id) =>
  apiClient.get(`/depreciation/rule/${id}`);

export const getDepreciationRuleByCategory = (categoryId) =>
  apiClient.get(`/depreciation/category/${categoryId}`);

export const createDepreciationRule = (data) =>
  apiClient.post("/depreciation", data);

export const updateDepreciationRule = (id, data) =>
  apiClient.put(`/depreciation/${id}`, data);

export const deleteDepreciationRule = (id) =>
  apiClient.delete(`/depreciation/${id}`);

export const calculateDeviceDepreciation = (deviceId) =>
  apiClient.get(`/depreciation/device/${deviceId}`);

export const getCategoryDepreciation = (categoryId) =>
  apiClient.get(`/depreciation/category-depreciation/${categoryId}`);

export const batchUpdateValues = () =>
  apiClient.post("/depreciation/batch-update-values");
