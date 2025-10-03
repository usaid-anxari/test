import axios from "axios";
import { BASE_URL } from "./apiPaths";

// Request deduplication
const pendingRequests = new Map();

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slow backend
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request deduplication interceptor - disabled temporarily due to method undefined error
// axiosInstance.interceptors.request.use((config) => {
//   if (config.method && config.method.toLowerCase() === 'get') {
//     const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
//     
//     if (pendingRequests.has(requestKey)) {
//       return pendingRequests.get(requestKey);
//     }
//     
//     const requestPromise = axios(config);
//     pendingRequests.set(requestKey, requestPromise);
//     
//     requestPromise.finally(() => {
//       pendingRequests.delete(requestKey);
//     });
//     
//     return requestPromise;
//   }
//   return config;
// });

// --------- Request Interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const accessToken = localStorage.getItem("token");
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

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