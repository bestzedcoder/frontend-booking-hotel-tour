import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./layouts/ProtectedLayout";
import NotFoundPage from "./pages/NotFound";
import { ForbiddenPage } from "./pages/Forbidden";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import VerifyAccountPage from "./pages/VerifyAccount";
import { PublicLayout } from "./layouts/PublicLayout";
import ProfilePage from "./pages/Profile";
import UserList from "./pages/admin/UserList";
import EditUserPage from "./pages/admin/EditUser";
import { BusinessLayout } from "./layouts/BusinessLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HomePage from "./pages/customer/Home";
import { BusinessDashboard } from "./pages/business/BusinessDashboard";
import HotelManagementPage from "./pages/business/HotelManagement";
import HotelManagement from "./pages/admin/HotelManagement";
import HotelAndRoomDetail from "./pages/business/HotelAndRoomDetails";
import OAuthSuccess from "./pages/OAuthSuccess";

function App() {
  return (
    <>
      <Routes>
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
        <Route path="/oauth2/success" element={<OAuthSuccess />} />
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

        <Route path="/*" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          {/* <Route
                path="/hotels"
                element={
                  <ProtectedRoute>
                    <HotelsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tours"
                element={
                  <ProtectedRoute>
                    <ToursPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              /> */}
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="ROLE_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/:id/edit" element={<EditUserPage />} />
          <Route path="hotels" element={<HotelManagement />} />
        </Route>

        <Route
          path="/business/*"
          element={
            <ProtectedRoute allowedRole="ROLE_BUSINESS">
              <BusinessLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<BusinessDashboard />} />
          <Route path="my-hotels" element={<HotelManagementPage />} />
          <Route
            path="my-hotels/:id/details"
            element={<HotelAndRoomDetail />}
          />
        </Route>

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
