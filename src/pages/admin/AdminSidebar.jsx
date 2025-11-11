import {
  BarChart,
  CalendarCheck,
  Home,
  Hotel,
  Image,
  MapPin,
  Package,
  Plane,
  Settings,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/admin" },
    { name: "Người Dùng", icon: Users, path: "/admin/users" },
    { name: "Quản Lý Tour", icon: Plane, path: "/admin/tours" },
    { name: "Quản Lý Khách Sạn", icon: Hotel, path: "/admin/hotels" },
    { name: "Đặt Chỗ", icon: CalendarCheck, path: "/admin/bookings" },
    // { name: "Thống Kê", icon: BarChart, path: "/admin/reports" },
    // { name: "Cài Đặt", icon: Settings, path: "/admin/settings" },
    // { name: "Ảnh & Video", icon: Image, path: "/admin/media" },
    // { name: "Điểm Đến", icon: MapPin, path: "/admin/destinations" },
    // { name: "Chủ Đề Gói", icon: Package, path: "/admin/packages" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-gradient-to-br from-indigo-700 to-blue-800 text-white shadow-lg z-50 flex flex-col pt-4 pb-6">
      {/* Tiêu đề Admin Panel */}
      <div className="px-6 pb-6 border-b border-indigo-600/50">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-indigo-200">Travel</span>
          <span className="text-white">Mate</span>
        </h1>
        <p className="text-indigo-200 text-sm mt-1">Admin Panel</p>
      </div>

      {/* Menu Điều Hướng - Thêm overflow-y-auto vào đây để nội dung cuộn */}
      <nav className="mt-8 flex-grow overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            // Sử dụng startsWith để active cả các route con (vd: /admin/tours/edit)
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center py-3 px-6 text-sm font-medium rounded-lg transition-all duration-200 mx-3
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-indigo-100 hover:bg-indigo-600/70 hover:text-white"
                    }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive ? "text-yellow-300" : "text-indigo-300"
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Sidebar */}
      <div className="px-6 pt-6 border-t border-indigo-600/50 mt-auto">
        <p className="text-xs text-indigo-300">
          © {new Date().getFullYear()} TravelMate
        </p>
        <p className="text-xs text-indigo-400 mt-1">Designed by BestZedCoder</p>
      </div>
    </aside>
  );
};
