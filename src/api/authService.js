import { apiClient } from "./axiosClient";

export const signIn = (email, password) =>
  apiClient.post("/auth/signin", { email, password });

export const refreshToken = (token) =>
  apiClient.post("/auth/refresh-token", { token });

export const getProfile = () => apiClient.get("/auth/me");

export const signOut = () => apiClient.post("/auth/signout");

export const updateProfile = (data) => apiClient.put("/auth/profile", data);

export const changePassword = (data) =>
  apiClient.put("/auth/change-password", data);

export const register = (data) => apiClient.post("/auth/register", data);

export const resetPassword = (data) =>
  apiClient.post("/auth/reset-password", data);

export const unlockAccount = (userId) =>
  apiClient.post("/auth/unlock-account", { userId });
