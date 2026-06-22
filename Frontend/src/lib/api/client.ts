import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = "";

const ACRONYM_MAP: Record<string, string> = {
  sku: "SKU",
  hsnCode: "HSNCode",
  gstRate: "GSTRate",
  gstin: "GSTIN",
  mrp: "MRP",
  pan: "PAN",
  tan: "TAN",
  cin: "CIN",
  upiId: "UPIId",
  eWayBillNumber: "EWayBillNumber",
  ifsc: "IFSC",
  iFnsc: "IFSC",
};

function toPascalCase(str: string): string {
  return ACRONYM_MAP[str] ?? str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  if (str === "GSTIN") return "gstin";
  if (str === "HSNCode") return "hsnCode";
  if (str === "GSTRate") return "gstRate";
  if (str === "EWayBillNumber") return "eWayBillNumber";
  if (str === "SKU") return "sku";
  if (str === "MRP") return "mrp";
  if (str === "PAN") return "pan";
  if (str === "TAN") return "tan";
  if (str === "CIN") return "cin";
  if (str === "UPIId") return "upiId";
  if (str === "IFSC") return "ifsc";
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function transformKeys(obj: unknown, transform: (s: string) => string): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => transformKeys(item, transform));
  if (typeof obj === "object" && !(obj instanceof FormData) && !(obj instanceof File) && !(obj instanceof Blob)) {
    const entries = Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
      transform(key),
      transformKeys(value, transform),
    ]);
    return Object.fromEntries(entries);
  }
  return obj;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ── Request: camelCase → PascalCase (to match backend PropertyNamingPolicy = null) ──
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const contentType = config.headers["Content-Type"];
    if (config.data && typeof contentType === "string" && contentType.includes("application/json")) {
      config.data = transformKeys(config.data, toPascalCase);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response: PascalCase → camelCase (frontend code always uses camelCase) ──
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object") {
      response.data = transformKeys(response.data, toCamelCase) as typeof response.data;
    }
    return response;
  }
);

// ── Token refresh ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Transform error response data too
    if (error.response?.data && typeof error.response.data === "object") {
      (error.response.data as any) = transformKeys(error.response.data, toCamelCase);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Skip token refresh for auth endpoints
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/register")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post("/api/auth/refresh", refreshToken, {
          headers: { "Content-Type": "application/json" },
        });

        const result = response.data.Data || response.data.data;
        const accessToken = result.AccessToken || result.accessToken;
        const newRefreshToken = result.RefreshToken || result.refreshToken;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("auth-storage");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
