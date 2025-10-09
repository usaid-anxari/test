import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slow backend
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// --------- Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error globally
    if (error.response) {
      if (error.response.status === 401) {
        // Redirect to login page
        // window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error("Sever Error. Please try again");
      }
    } else if (error.code === "ENCONNABORTED") {
      console.error("Request timeout. Please try again");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;