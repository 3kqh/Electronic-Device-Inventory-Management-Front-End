import { userClient } from "./axiosClient";

export const getAllUsers = () =>
  userClient.get("/users");

export const getUserById = (id) =>
  userClient.get(`/users/${id}`);

export const createUser = (data) =>
  userClient.post("/users", data);

export const updateUser = (id, data) =>
  userClient.put(`/users/${id}`, data);

export const deleteUser = (id) =>
  userClient.delete(`/users/${id}`);

export const assignRole = (id, role) =>
  userClient.patch(`/users/${id}/role`, { role });
