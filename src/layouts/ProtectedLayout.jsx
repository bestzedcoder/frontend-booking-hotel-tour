import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.updateProfile && !location.pathname.includes("/profile")) {
    return <Navigate to="/profile" replace />;
  }

  if (allowedRole != null && !user?.roles.includes(allowedRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  if (!user?.updateProfile) {
  }

  return children;
};
