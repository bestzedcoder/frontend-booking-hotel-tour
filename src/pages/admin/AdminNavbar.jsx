import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Bell, ChevronDown, LogOut, Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const adminName = user?.fullName;
  const adminEmail = user?.email;
  const avatar =
    user?.urlImage || "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-6 z-40 border-b border-gray-100">
      <div className="text-xl font-semibold text-gray-800">Dashboard</div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition focus:outline-none"
          >
            <img
              src={avatar}
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full border border-indigo-200 object-cover"
            />
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {adminName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <p className="font-semibold">{adminName}</p>
                <p className="text-gray-500 truncate">{adminEmail}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-4 h-4 mr-2 text-indigo-500" /> Profile
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-2 text-blue-500" /> Cài Đặt
              </Link>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={logout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
