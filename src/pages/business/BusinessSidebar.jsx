import { Briefcase, Calendar, Hotel, MessageSquare, Plane } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BusinessSidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Tổng quan", icon: Briefcase, path: "/business/dashboard" },
    { name: "Quản lý Khách sạn", icon: Hotel, path: "/business/my-hotels" },
    { name: "Quản lý Tour", icon: Plane, path: "/business/my-tours" },
    { name: "Lịch đặt chỗ", icon: Calendar, path: "/business/my-bookings" },
    { name: "Tin nhắn", icon: MessageSquare, path: "/business/messages" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-gray-900 text-white shadow-xl z-50 flex flex-col pt-4 pb-6">
      <div className="px-6 pb-6 border-b border-gray-700/50">
        <h1 className="text-2xl font-extrabold tracking-tight text-green-400">
          Partner Portal
        </h1>
        <p className="text-gray-400 text-sm mt-1">Quản lý dịch vụ</p>
      </div>

      <nav className="mt-8 flex-grow overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 mx-3
                                        ${
                                          isActive
                                            ? "bg-green-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive ? "text-white" : "text-green-400"
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 pt-6 border-t border-gray-700/50 mt-auto">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} TravelMate
        </p>
      </div>
    </aside>
  );
};
