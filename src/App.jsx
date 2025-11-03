import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { ProtectedRoute } from "./layouts/ProtectedLayout";
import NotFoundPage from "./pages/NotFound";
import { ForbiddenPage } from "./pages/Forbidden";
import { AdminDashboard } from "./pages/AdminDashBoard";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import VerifyAccountPage from "./pages/VerifyAccount";
import FooterPage from "./pages/Footer";
import { PublicLayout } from "./layouts/PublicLayout";
import ProfilePage from "./pages/Profile";

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <PublicLayout>
                  <LoginPage />
                </PublicLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PublicLayout>
                  <RegisterPage />
                </PublicLayout>
              }
            />
            <Route
              path="/verify-account"
              element={
                <PublicLayout>
                  <VerifyAccountPage />
                </PublicLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRole="ROLE_ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
            </Route>

            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <FooterPage />
      </div>
    </>
  );
}

export default App;
