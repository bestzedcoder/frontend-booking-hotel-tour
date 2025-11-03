import { useState, useEffect, useRef } from "react";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const avatar =
    user?.urlImage || "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

  // 🧠 Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>

      <div className="flex items-center gap-5 relative">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bell size={20} />
        </button>

        {/* Container avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <img
              src={avatar}
              alt="user avatar"
              className="w-9 h-9 rounded-full border"
            />
            <span className="font-medium text-gray-700">{user?.fullName}</span>
          </div>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white shadow-xl rounded-lg border border-gray-100 py-2 animate-fade-in">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => console.log("Go to Profile")}
              >
                Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => console.log("Change Password")}
              >
                Change Password
              </button>
              <hr className="my-1" />
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                onClick={() => logout()}
              >
                <div className="flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
