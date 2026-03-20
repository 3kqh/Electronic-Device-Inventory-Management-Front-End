import axios from "axios";

// Primary instance — for all /api/* endpoints
const apiClient = axios.create({
  baseURL: "http://localhost:3120/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Secondary instance — for /users endpoint (no /api prefix)
const userClient = axios.create({
  baseURL: "http://localhost:3120",
  headers: {
    "Content-Type": "application/json",
  },
});

// Shared request interceptor: attach Bearer token from localStorage
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error)
);
userClient.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error)
);

// Shared response interceptor: handle 401, 403, 500, and network errors
const handleResponseError = (error) => {
  if (!error.response) {
    // Network error (no response from server)
    const networkError = new Error("Không thể kết nối server");
    networkError.isNetworkError = true;
    return Promise.reject(networkError);
  }

  const { status } = error.response;

  if (status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  } else if (status === 403) {
    const forbiddenError = new Error("Access Denied");
    forbiddenError.status = 403;
    return Promise.reject(forbiddenError);
  } else if (status === 500) {
    const serverError = new Error("Lỗi hệ thống");
    serverError.status = 500;
    return Promise.reject(serverError);
  }

  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);
userClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

export { apiClient, userClient };
