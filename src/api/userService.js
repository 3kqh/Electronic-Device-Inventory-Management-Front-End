import { apiClient } from "./axiosClient";

export const getAllUsers = () =>
  apiClient.get("/users");

export const getUserById = (id) =>
  apiClient.get(`/users/${id}`);

export const createUser = (data) =>
  apiClient.post("/users", data);

export const updateUser = (id, data) =>
  apiClient.put(`/users/${id}`, data);

export const deleteUser = (id) =>
  apiClient.delete(`/users/${id}`);

export const assignRole = (id, role) =>
  apiClient.patch(`/users/${id}/role`, { role });
