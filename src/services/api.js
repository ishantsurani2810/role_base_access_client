import axios from 'axios';

let accessTokenMemory = '';
let refreshSubscribers = [];
let isRefreshing = false;

export const setAccessToken = (token) => {
  accessTokenMemory = token;
};

export const getAccessToken = () => {
  return accessTokenMemory;
};

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    if (accessTokenMemory) {
      config.headers.Authorization = `Bearer ${accessTokenMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config: originalRequest, response } = error;
    
    // Check if URL is an auth route (login, refresh, logout) to prevent recursive or masked failures
    const isAuthRequest = originalRequest && originalRequest.url && (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh') ||
      originalRequest.url.includes('/auth/logout')
    );

    // Check if error is 'unauthorized' and has not already been retried
    if (response && response.status === 401 && !isAuthRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request and wait for the new access token
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Execute refresh endpoint
        const refreshResponse = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;
        setAccessToken(newAccessToken);

        // Resume queued requests
        isRefreshing = false;
        refreshSubscribers.forEach((callback) => callback(newAccessToken));
        refreshSubscribers = [];

        // Repeat original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        accessTokenMemory = '';
        // If refresh fails, clear context and user lands on login page
        window.dispatchEvent(new Event('auth-failure'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default api;
