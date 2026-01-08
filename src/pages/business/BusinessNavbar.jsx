import { ChevronDown, LogOut, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { useNotification } from "../../hooks/useNotification";

export const BusinessNavbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const businessName = user?.fullName || "Đối tác Kinh doanh";
  const avatar =
    user?.urlImage ?? "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <nav className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white shadow-sm flex items-center justify-end px-6 z-40 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/business/messages")}
          className="relative p-2"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-full bg-green-50 hover:bg-green-100 transition focus:outline-none"
          >
            <img
              src={avatar}
              alt="Business Avatar"
              className="w-8 h-8 rounded-full border border-green-200 object-cover"
            />
            <span className="text-sm font-semibold text-gray-800 hidden md:block">
              {businessName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
              <Link
                to="/business/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-4 h-4 mr-2 text-green-600" /> Hồ sơ
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
