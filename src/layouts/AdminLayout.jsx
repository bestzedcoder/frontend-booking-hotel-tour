import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../pages/admin/AdminSidebar";
import { AdminNavbar } from "../pages/admin/AdminNavbar";

// Component chính: AdminLayout
export const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Navbar - Đã được chỉnh sửa để sử dụng logic auth và dropdown hoàn chỉnh */}
        <AdminNavbar />

        {/* Nội dung chính của trang */}
        <main className="flex-1 p-6 md:p-8 mt-16 overflow-y-auto">
          {children || <Outlet />}{" "}
          {/* Render children hoặc Outlet cho nested routes */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
