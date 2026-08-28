import axios from 'axios';
import Cookies from 'js-cookie';
import oauthManager from './oauth-manager';

const baseURL = import.meta.env.VITE_LIQUID_HOST; // Replace with your API endpoint

// Create an Axios instance with a custom configuration
const axiosInstance = axios.create({
    baseURL,
    timeout: 60000, // Adjust the timeout as needed
});

axiosInstance.interceptors.request.use(async (config) => {
    if (Cookies.get('oauth_access_token') || config?.url?.includes("/oauth")) {
        return config;
    }
    const accessToken = await oauthManager.getAccessToken();
    axiosInstance.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${accessToken}`;
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest?.url?.includes("/oauth/token")
    ) {
      originalRequest._retry = true;
      const newToken = await oauthManager.refreshAccessToken();
      if (newToken) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
