import {
  CalendarCheck,
  Home,
  Hotel,
  Plane,
  Users,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export const AdminSidebar = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/admin/dashboard", type: "item" },
    { name: "Người Dùng", icon: Users, path: "/admin/users", type: "item" },
    { name: "Quản Lý Tour", icon: Plane, path: "/admin/tours", type: "item" },
    {
      name: "Quản Lý Khách Sạn",
      icon: Hotel,
      path: "/admin/hotels",
      type: "item",
    },
    {
      name: "Đặt Chỗ",
      icon: CalendarCheck,
      path: "/admin/bookings",
      type: "submenu",
      items: [
        {
          name: "Quản lý tất cả booking",
          icon: Plane,
          path: "/admin/bookings",
        },
        {
          name: "Quản lý booking của owner",
          icon: Hotel,
          path: "/admin/bookings/owner",
        },
      ],
    },
  ];

  const checkIsActive = (item) => {
    if (item.type === "item") {
      return location.pathname === item.path;
    }
    if (item.type === "submenu") {
      return item.items.some((subItem) =>
        location.pathname.startsWith(subItem.path)
      );
    }
    return location.pathname === item.path;
  };

  const checkIsSubItemActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    navItems.forEach((item) => {
      if (
        item.type === "submenu" &&
        item.items.some((subItem) => location.pathname.startsWith(subItem.path))
      ) {
        setOpenSubmenu(item.name);
      }
    });
  }, [location.pathname]);

  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-gradient-to-br from-indigo-700 to-blue-800 text-white shadow-lg z-50 flex flex-col pt-4 pb-6">
      <div className="px-6 pb-6 border-b border-indigo-600/50">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-indigo-200">Travel</span>
          <span className="text-white">Mate</span>
        </h1>
        <p className="text-indigo-200 text-sm mt-1">Admin Panel</p>
      </div>

      <nav className="mt-8 flex-grow overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = checkIsActive(item);
            const isSubmenuOpen = openSubmenu === item.name || isActive;

            if (item.type === "item") {
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
            }

            if (item.type === "submenu") {
              return (
                <li key={item.name}>
                  <button
                    onClick={() =>
                      setOpenSubmenu(isSubmenuOpen ? null : item.name)
                    }
                    className={`flex items-center justify-between w-[calc(100%-1.5rem)] py-3 px-6 text-sm font-medium rounded-lg transition-all duration-200 mx-3
                      ${
                        isActive || isSubmenuOpen
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-indigo-100 hover:bg-indigo-600/70 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={`w-5 h-5 mr-3 ${
                          isActive || isSubmenuOpen
                            ? "text-yellow-300"
                            : "text-indigo-300"
                        }`}
                      />
                      {item.name}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isSubmenuOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isSubmenuOpen && (
                    <ul className="mt-1 ml-6 space-y-1 border-l-2 border-indigo-400">
                      {item.items.map((subItem) => {
                        const isSubActive = checkIsSubItemActive(subItem.path);
                        return (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.path}
                              className={`flex items-center py-2 px-3 text-sm font-medium rounded-r-lg transition-colors duration-200
                                ${
                                  isSubActive
                                    ? "bg-indigo-500/80 text-white font-semibold"
                                    : "text-indigo-200 hover:bg-indigo-600/50 hover:text-white"
                                }`}
                            >
                              <subItem.icon className="w-4 h-4 mr-2 opacity-80" />
                              {subItem.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>

      <div className="px-6 pt-6 border-t border-indigo-600/50 mt-auto">
        <p className="text-xs text-indigo-300">
          © {new Date().getFullYear()} TravelMate
        </p>
        <p className="text-xs text-indigo-400 mt-1">Designed by BestZedCoder</p>
      </div>
    </aside>
  );
};
