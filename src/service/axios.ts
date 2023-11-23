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

// axiosInstance.interceptors.response.use(
//   (response) => {
//     // Handle successful responses
//     return response;
//   },
//   (error) => {
//     // Handle errors
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
