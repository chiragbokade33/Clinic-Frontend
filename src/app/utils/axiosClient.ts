// src/utils/axiosClient.ts
import axios from "axios";
import { toast } from "react-toastify";

// Get token from localStorage
const getUserToken = () => {
  return localStorage.getItem("authToken");
};

// Request Interceptor
const requestHandler = (request : any) => {
  document.body.classList.add("loading-indicator");

  const token = getUserToken();
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }

  return request;
};

// Response Interceptor (Success)
const successHandler = (response : any) => {
  document.body.classList.remove("loading-indicator");
  return response;
};


// const errorHandler = (error: any) => {
//   document.body.classList.remove("loading-indicator");

//   const status = error?.response?.status;
//   // const message = error?.response?.data?.message || "Something went wrong";
//   const message =
//   error?.response?.data?.data === null
//     ? null
//     : error?.response?.data?.data?.message || "Something went wrong";


//   if (status === 401) {
//     // Unauthorized - clear all relevant storage and redirect
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("userId");
//     localStorage.removeItem("emailId");
//     localStorage.removeItem("username");
//     localStorage.removeItem("LabAdminId");
//     localStorage.removeItem("switch");
//     localStorage.removeItem("role");
//     window.location.href = "/labLogin";
//   } else if (status === 404) {
//     toast.error(message);
//   } else {
//     toast.error(message);
//   }

//   return Promise.reject({ ...error });
// };
const errorHandler = (error: any) => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove("loading-indicator");
  }

  const status = error?.response?.status;

  // Enhanced message extraction:
  const message =
    error?.response?.data?.data?.message ||  // ✅ Handles: { data: { message: "..." } }
    error?.response?.data?.message ||        // ✅ Handles: { message: "..." }
    "Something went wrong";                  // fallback

  if (status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("emailId");
      localStorage.removeItem("username");
      window.location.href = "/labLogin";
    }
  } else {
    toast.error(message); // ✅ Always show a relevant message
  }

  return Promise.reject({ ...error });
};



// Axios Instance
const axiosInstance = axios.create({
  baseURL: "https://localhost:7227/api/", // Change if needed
});

// Attach interceptors
axiosInstance.interceptors.request.use(requestHandler);
axiosInstance.interceptors.response.use(successHandler, errorHandler);

export default axiosInstance;
