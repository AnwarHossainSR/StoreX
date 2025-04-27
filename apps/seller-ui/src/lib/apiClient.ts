// lib/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _authOptional?: boolean;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api`;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

interface FailedRequest {
  resolve: (value: AxiosResponse) => void;
  reject: (reason: any) => void;
  config: AxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];
let refreshAttemptCount = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const processQueue = (error: any) => {
  console.log("Processing queue", { error, queueLength: failedQueue.length });
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (!error) {
      axios(config).then(resolve).catch(reject);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const withOptionalAuth = (
  config: AxiosRequestConfig
): AxiosRequestConfig & { _authOptional?: boolean } => {
  return {
    ...config,
    _authOptional: true,
  };
};

apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    // If the URL is absolute (starts with http:// or https://), bypass baseURL
    if (
      config.url?.startsWith("http://") ||
      config.url?.startsWith("https://")
    ) {
      config.baseURL = undefined;
    }
    console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`, {
      retry: !!config._retry,
      authOptional: !!config._authOptional,
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: CustomAxiosRequestConfig = error.config;

    if (originalRequest?._authOptional && error.response?.status === 401) {
      console.log(
        "Auth-optional endpoint failed with 401, returning error",
        originalRequest.url
      );
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith("/refresh-token")
    ) {
      if (isRefreshing) {
        console.log(
          "Refresh in progress, queuing request",
          originalRequest.url
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      if (refreshAttemptCount >= MAX_REFRESH_ATTEMPTS) {
        console.error("Max refresh attempts reached, redirecting to login");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttemptCount++;

      try {
        console.log(
          `Attempting to refresh token (attempt ${refreshAttemptCount})`
        );
        await delay(1000);
        // Use Gateway's auth route for refresh token
        await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        console.log("Token refreshed successfully");
        processQueue(null);
        refreshAttemptCount = 0;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        processQueue(refreshError);
        if (typeof window !== "undefined") {
          window.location.href = "/seller-login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error(
      `Request failed: ${originalRequest?.url}`,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export default apiClient;
