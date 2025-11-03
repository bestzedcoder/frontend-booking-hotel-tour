import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function PublicLayout({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
