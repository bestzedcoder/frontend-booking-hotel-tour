import {
  LayoutDashboard,
  Users,
  BookOpen,
  Hotel,
  Building,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
  { label: "Users", icon: <Users size={20} />, path: "/admin/users" },
  { label: "Tours", icon: <BookOpen size={20} />, path: "/admin/tours" },
  { label: "Hotels", icon: <Hotel size={20} />, path: "/admin/hotels" },
  { label: "Bookings", icon: <Building size={20} />, path: "/admin/bookings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
      </div>

      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                isActive ? "bg-blue-100 text-blue-600 font-medium" : ""
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t text-center text-sm text-gray-500">
        © 2025 YourCompany
      </div>
    </aside>
  );
}
