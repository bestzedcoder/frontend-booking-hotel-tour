import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { FaHotel, FaSuitcase, FaBook, FaPhone, FaHome } from "react-icons/fa";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuth();
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
            isActive("/")
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
                isActive("/hotels")
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "hover:text-indigo-600"
              } transition pb-1`}
            >
              <FaHotel /> Khách sạn
            </Link>

            <Link
              to="/client/tours"
              className={`flex items-center gap-1 ${
                isActive("/tours")
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "hover:text-indigo-600"
              } transition pb-1`}
            >
              <FaSuitcase /> Tour du lịch
            </Link>

            <Link
              to="/client/bookings"
              className={`flex items-center gap-1 ${
                isActive("/bookings")
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "hover:text-indigo-600"
              } transition pb-1`}
            >
              <FaBook /> Booking
            </Link>
          </>
        )}

        {user ? (
          <div className="flex items-center gap-4">
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
                className="w-6 h-6 rounded-full"
              />
              <span>{user.fullName || "Tài khoản"}</span>
            </Link>

            <button
              onClick={logout}
              className="px-5 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
          >
            Đăng nhập
          </Link>
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="md:hidden focus:outline-none"
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
      </button>

      {open && (
        <div className="absolute top-[70px] left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-3 px-6 text-gray-700 font-medium md:hidden">
          <Link
            to="/client/dashboard"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 ${
              isActive("/") ? "text-indigo-600 font-semibold" : ""
            }`}
          >
            <FaHome /> Trang chủ
          </Link>

          {user && (
            <>
              <Link
                to="/client/hotels"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 ${
                  isActive("/hotels") ? "text-indigo-600 font-semibold" : ""
                }`}
              >
                <FaHotel /> Khách sạn
              </Link>
              <Link
                to="/client/tours"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 ${
                  isActive("/tours") ? "text-indigo-600 font-semibold" : ""
                }`}
              >
                <FaSuitcase /> Tour du lịch
              </Link>
              <Link
                to="/client/bookings"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 ${
                  isActive("/bookings") ? "text-indigo-600 font-semibold" : ""
                }`}
              >
                <FaBook /> Booking
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 mt-2"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="user"
                  className="w-5 h-5 rounded-full"
                />
                <span>{user.fullName || "Tài khoản"}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition mt-2"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="w-full text-center px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition mt-2"
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
