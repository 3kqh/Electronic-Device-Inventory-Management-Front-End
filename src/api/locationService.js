import { apiClient } from "./axiosClient";

export const getAllLocations = () =>
  apiClient.get("/locations");

export const getLocationById = (id) =>
  apiClient.get(`/locations/${id}`);

export const createLocation = (data) =>
  apiClient.post("/locations", data);

export const updateLocation = (id, data) =>
  apiClient.put(`/locations/${id}`, data);

export const deleteLocation = (id) =>
  apiClient.delete(`/locations/${id}`);
