import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../pages/admin/AdminSidebar";
import { AdminNavbar } from "../pages/admin/AdminNavbar";

export const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        <AdminNavbar />

        <main className="flex-1 p-6 md:p-8 mt-16 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
