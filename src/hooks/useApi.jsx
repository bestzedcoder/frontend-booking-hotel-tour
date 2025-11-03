import { useCallback } from "react";
import axiosClient from "../api/config";

export function useApi() {
  const callApi = useCallback(async (method, url, data = null, config = {}) => {
    try {
      const response = await axiosClient({
        method,
        url,
        data,
        ...config,
      });

      return {
        success: true,
        message: response.data?.message || "Thành công",
        data: response.data?.data ?? response.data,
      };
    } catch (error) {
      let message = "Đã xảy ra lỗi. Vui lòng thử lại!";
      if (error.response?.data?.message) {
        const msg = error.response.data.message;

        if (typeof msg === "object") {
          message = Object.values(msg).join(", ");
        } else {
          message = msg;
        }
      }

      return {
        success: false,
        message,
        data: null,
      };
    }
  }, []);

  return { callApi };
}
