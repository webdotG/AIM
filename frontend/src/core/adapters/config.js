import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log('API Request with token:', !!token, config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response.data;
  },
  (error) => {
    console.log('API Error:', error.config?.url, error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      // пусть компоненты обработают ошибку
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user');
      
      if (!error.config?.url.includes('/auth/login') && 
          !error.config?.url.includes('/auth/register')) {
        console.log('401 error on non-auth endpoint, will redirect');
        // чтобы компоненты успели обработать
        setTimeout(() => {
          if (!window.location.pathname.includes('/auth') && 
              !window.location.pathname.includes('/login')) {
            window.location.href = '/auth';
          }
        }, 100);
      }
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Network error';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default apiClient;