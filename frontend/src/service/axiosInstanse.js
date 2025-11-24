import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 25000, // Reduced to 25s (under API Gateway limit)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  maxContentLength: 10 * 1024 * 1024, // 10MB max
  maxBodyLength: 10 * 1024 * 1024, // 10MB max
});


// --------- Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error globally
    if (error.response) {
      if (error.response.status === 400) {
        console.error("Bad Request - Check request format");
      } else if (error.response.status === 401) {
        // Redirect to login page
        // window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error("Server Error. Please try again");
      } else if (error.response.status === 502 || error.response.status === 503) {
        console.error("Service temporarily unavailable");
      }
    } else if (error.code === "ECONNABORTED" || error.message.includes('timeout')) {
      console.error("Request timeout. Try reducing file size or try again later");
    } else if (error.message.includes('Network Error')) {
      console.error("Network error. Check your connection");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;