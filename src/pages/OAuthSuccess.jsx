import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { callApi } = useApi();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        const params = new URLSearchParams(search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          const profileRes = await callApi("get", "/auth/profile");
          setUser(profileRes.data);
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    handleOAuth();
  }, [search, navigate, callApi, setUser]);

  return <div>Đang đăng nhập...</div>;
}

export default OAuthSuccess;
