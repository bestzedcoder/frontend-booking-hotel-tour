import { createContext, useContext, useMemo, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useNavigate } from "react-router-dom";
import { useApi } from "./useApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();
  const { callApi } = useApi();

  const login = async (username, password) => {
    const res = await callApi("post", "/auth/login", {
      username,
      password,
    });

    if (!res.success) {
      alert("❌ " + res.message);
      return false;
    }

    const { access_token, refresh_token } = res.data;

    // Lưu token vào localStorage
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    // Gọi lấy thông tin user
    const profileRes = await callApi("get", "/auth/profile");
    setUser(profileRes.data);
    alert("✅ Đăng nhập thành công!");
    return true;
  };

  const logout = async () => {
    const res = await callApi("get", "/auth/logout");
    if (!res.success) {
      alert(res.message);
      return;
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    alert(res.message);
    navigate("/login", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
