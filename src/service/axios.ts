import axios from 'axios';

const baseURL = import.meta.env.VITE_LIQUID_HOST; // Replace with your API endpoint

// Create an Axios instance with a custom configuration
const axiosInstance = axios.create({
    baseURL,
    timeout: 60000, // Adjust the timeout as needed
});

// axiosInstance.interceptors.request.use((config) => {
//   // Add authentication headers or any other custom logic
//   return config;
// });

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
