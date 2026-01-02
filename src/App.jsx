import { Routes, Route, Navigate } from "react-router-dom";
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
import HotelSearchPage from "./pages/customer/Hotel";
import HotelDetailsPage from "./pages/customer/HotelDetails";
import { TourManagementPage } from "./pages/business/TourManagement";
import { TourCreatingPage } from "./pages/business/TourCreatingPage";
import { TourDetailsPage } from "./pages/business/TourDetailsPage";
import { HotelBookingPage } from "./pages/customer/HotelBooking";
import { BookingManagementPage } from "./pages/customer/BookingManagement";
import PaymentResultPage from "./pages/customer/PaymentResult";
import TourPage from "./pages/customer/Tour";
import TourDetails from "./pages/customer/TourDetails";
import TourBookingPage from "./pages/customer/TourBooking";
import BookingManagementBusinessPage from "./pages/business/BookingManagement";
import TourManagement from "./pages/admin/TourManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import { BookingOfManagement } from "./pages/admin/BookingOfManagement";
import { BookingProcessingPage } from "./pages/customer/BookingProcessingPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/client/dashboard" replace />} />

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

        <Route
          path="/client/*"
          element={
            <ProtectedRoute allowedRole="ROLE_CUSTOMER">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<HomePage />} />
          <Route path="hotels" element={<HotelSearchPage />} />
          <Route path="hotels/:id/details" element={<HotelDetailsPage />} />
          <Route
            path="hotels/:hotelId/room/:roomId/booking"
            element={<HotelBookingPage />}
          />
          <Route path="tours" element={<TourPage />} />
          <Route path="tours/:id/details" element={<TourDetails />} />
          <Route path="tours/:id/booking" element={<TourBookingPage />} />
          <Route
            path="processing/:code/:type"
            element={<BookingProcessingPage />}
          />
          <Route path="bookings" element={<BookingManagementPage />} />
          <Route path="payment/result" element={<PaymentResultPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="ROLE_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/:id/edit" element={<EditUserPage />} />
          <Route path="hotels" element={<HotelManagement />} />
          <Route path="tours" element={<TourManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="bookings/owner" element={<BookingOfManagement />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/business/*"
          element={
            <ProtectedRoute allowedRole="ROLE_BUSINESS">
              <BusinessLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="my-hotels" element={<HotelManagementPage />} />
          <Route
            path="my-hotels/:id/details"
            element={<HotelAndRoomDetail />}
          />
          <Route path="my-tours" element={<TourManagementPage />} />
          <Route path="my-tours/create" element={<TourCreatingPage />} />
          <Route path="my-tours/:id/details" element={<TourDetailsPage />} />
          <Route
            path="my-bookings"
            element={<BookingManagementBusinessPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
      </Routes>
    </>
  );
}

export default App;
