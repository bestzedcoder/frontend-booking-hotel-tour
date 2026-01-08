import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="relative mt-20 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-100 via-blue-100 to-transparent opacity-90"></div>
        <div className="relative w-full bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg p-10 text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/201/201623.png"
              alt="TravelMate Logo"
              className="w-12 h-12 rounded-full shadow-sm"
            />
            <span className="font-semibold text-3xl text-gray-800">
              TravelMate
            </span>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-base leading-relaxed">
            Trải nghiệm du lịch và khách sạn đẳng cấp — đặt phòng, tour và nghỉ
            dưỡng dễ dàng cùng{" "}
            <span className="font-semibold text-indigo-600">TravelMate</span>.
            Cảm hứng cho mỗi hành trình của bạn 🌏✨
          </p>
          <div className="flex justify-center flex-wrap gap-10 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-indigo-600 transition">
              Trang chủ
            </a>
            <a href="#" className="hover:text-indigo-600 transition">
              Khách sạn
            </a>
            <a href="#" className="hover:text-indigo-600 transition">
              Tour
            </a>
            <a href="#" className="hover:text-indigo-600 transition">
              Liên hệ
            </a>
          </div>
          <div className="flex justify-center gap-8 text-gray-600 mt-3">
            <a href="#" className="hover:text-sky-600 transition">
              <FaFacebookF size={20} />
            </a>
            <a href="#" className="hover:text-pink-500 transition">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="hover:text-blue-700 transition">
              <FaLinkedinIn size={20} />
            </a>
            <a href="#" className="hover:text-gray-800 transition">
              <FaGithub size={20} />
            </a>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} TravelMate — Explore. Relax. Enjoy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
