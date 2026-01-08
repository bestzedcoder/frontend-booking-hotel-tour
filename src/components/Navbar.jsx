import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import {
  FaHotel,
  FaSuitcase,
  FaBook,
  FaPhone,
  FaHome,
  FaComments,
} from "react-icons/fa"; // Thêm FaComments
import { useNotification } from "../hooks/useNotification"; // Import hook thông báo

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification(); // Lấy số tin nhắn chưa đọc từ Context
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <Link
        to="/client/dashboard"
        className="flex items-center gap-2 font-bold text-2xl text-indigo-600 tracking-wide hover:text-indigo-700 transition"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/201/201623.png"
          alt="logo"
          className="w-8 h-8"
        />
        TravelMate
      </Link>

      <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
        <Link
          to="/client/dashboard"
          className={`flex items-center gap-1 ${
            isActive("/client/dashboard")
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "hover:text-indigo-600"
          } transition pb-1`}
        >
          <FaHome /> Trang chủ
        </Link>

        {user && (
          <>
            <Link
              to="/client/hotels"
              className={`flex items-center gap-1 ${
                isActive("/client/hotels")
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "hover:text-indigo-600"
              } transition pb-1`}
            >
              <FaHotel /> Khách sạn
            </Link>

            <Link
              to="/client/tours"
              className={`flex items-center gap-1 ${
                isActive("/client/tours")
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "hover:text-indigo-600"
              } transition pb-1`}
            >
              <FaSuitcase /> Tour du lịch
            </Link>

            <Link
              to="/client/bookings"
              className={`flex items-center gap-1 ${
                isActive("/client/bookings")
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "hover:text-indigo-600"
              } transition pb-1`}
            >
              <FaBook /> Booking
            </Link>

            {/* MỤC TƯ VẤN (CHAT) CHO DESKTOP */}
            <Link
              to="/client/messages"
              className={`flex items-center gap-1 relative ${
                isActive("/client/messages")
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "hover:text-indigo-600"
              } transition pb-1`}
            >
              <FaComments /> Tư vấn
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        {user ? (
          <div className="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200">
            <Link
              to="/profile"
              className="hover:text-indigo-600 transition flex items-center gap-2"
            >
              <img
                src={
                  user.urlImage ??
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="user"
                className="w-8 h-8 rounded-full object-cover border border-indigo-100"
              />
              <span className="max-w-[100px] truncate">
                {user.fullName || "Tài khoản"}
              </span>
            </Link>

            <button
              onClick={logout}
              className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-red-50 hover:text-red-600 transition border border-transparent hover:border-red-100"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md"
          >
            Đăng nhập
          </Link>
        )}
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden focus:outline-none p-2 rounded-lg hover:bg-gray-100 relative"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
        {/* Hiện chấm đỏ ở icon menu mobile nếu có tin nhắn mới */}
        {!open && unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="absolute top-[72px] left-0 w-full bg-white shadow-xl py-6 flex flex-col items-start gap-4 px-8 text-gray-700 font-medium md:hidden animate-in slide-in-from-top duration-300">
          <Link
            to="/client/dashboard"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 w-full p-2 rounded-lg ${
              isActive("/") ? "bg-indigo-50 text-indigo-600" : ""
            }`}
          >
            <FaHome /> Trang chủ
          </Link>

          {user && (
            <>
              <Link
                to="/client/hotels"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg ${
                  isActive("/hotels") ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              >
                <FaHotel /> Khách sạn
              </Link>
              <Link
                to="/client/tours"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg ${
                  isActive("/tours") ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              >
                <FaSuitcase /> Tour du lịch
              </Link>
              <Link
                to="/client/bookings"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg ${
                  isActive("/bookings") ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              >
                <FaBook /> Booking
              </Link>

              {/* MỤC TƯ VẤN (CHAT) CHO MOBILE */}
              <Link
                to="/client/messages"
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between w-full p-2 rounded-lg ${
                  isActive("/messages") ? "bg-indigo-50 text-indigo-600" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <FaComments /> Tư vấn
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <div className="w-full border-t border-gray-100 my-2"></div>

          {user ? (
            <div className="w-full space-y-4">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2"
              >
                <img
                  src={
                    user.urlImage ??
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="user"
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-bold">
                  {user.fullName || "Tài khoản"}
                </span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="w-full text-center py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
