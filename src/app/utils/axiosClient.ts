// src/utils/axiosClient.ts
import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "../hooks/GetitemsLocal";

const decodeJwtPayload = (token: string) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    console.error("Invalid token format", err);
    return null;
  }
};

const requestHandler = async (request: any) => {
  document.body.classList.add("loading-indicator");

  // ✅ Wait for token
  const token = await getToken();

  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;

    const decoded = decodeJwtPayload(token);
    if (decoded?.UserId) {
      request.headers["X-User-Id"] = decoded.UserId;
    }
    if (decoded?.role) {
      request.headers["X-User-Role"] = decoded.role;
    }
  }

  return request;
};

const successHandler = (response: any) => {
  document.body.classList.remove("loading-indicator");
  return response;
};

const errorHandler = (error: any) => {
  if (typeof document !== "undefined") {
    document.body.classList.remove("loading-indicator");
  }

  const status = error?.response?.status;
  const message =
    error?.response?.data?.data?.message ||
    error?.response?.data?.message ||
    "Something went wrong";

  if (status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("emailId");
      localStorage.removeItem("username");
         // window.location.href = "/clinicLogin";
    }
  } else {
    toast.error(message);
  }

  return Promise.reject({ ...error });
};

const axiosInstance = axios.create({
  baseURL: "https://localhost:7227/api/",
});

// ✅ Async request interceptor
axiosInstance.interceptors.request.use(
  (config) => requestHandler(config),
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(successHandler, errorHandler);

export default axiosInstance;
