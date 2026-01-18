import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// 10 minutes timeout for reconciliation with large datasets
const API_TIMEOUT = 600000;

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.MODE === 'production') {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

class AxiosClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = getApiBaseUrl();
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 600000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  public getClient(): AxiosInstance {
    return this.instance;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }
}

const axiosClient = new AxiosClient();
export default axiosClient;
export const api = axiosClient.getClient();
