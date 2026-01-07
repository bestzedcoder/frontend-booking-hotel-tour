import axios from "axios";

// const BACKEND_URL = "http://160.30.172.199:8080/api";
const BACKEND_URL = "http://localhost:8080/api";
const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log({ error });
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      try {
        const res = await axios.post(
          `${BACKEND_URL}/auth/refresh`,
          { userId },
          {
            withCredentials: true,
          }
        );

        const newAccessToken = res.data.data.access_token;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
