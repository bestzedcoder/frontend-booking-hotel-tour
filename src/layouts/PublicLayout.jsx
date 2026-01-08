import { Navigate } from "react-router-dom";
import { Plane } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const PublicHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <a
        href="/client/dashboard"
        className="flex items-center space-x-2 text-2xl font-bold text-indigo-600"
      >
        <Plane className="w-6 h-6 transform rotate-45 text-cyan-500" />
        <span>TravelMate</span>
      </a>
    </div>
  </header>
);

const PublicFooter = () => (
  <footer className="w-full bg-gray-50 border-t border-gray-100 mt-12 py-6">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
      <p className="mb-1">
        © {new Date().getFullYear()} TravelMate. Khám phá thế giới, đặt phòng dễ
        dàng.
      </p>
      <div className="space-x-4 mt-2">
        <a href="#" className="hover:text-indigo-500 transition">
          Điều khoản
        </a>
        <span className="text-gray-300">|</span>
        <a href="#" className="hover:text-indigo-500 transition">
          Chính sách Bảo mật
        </a>
      </div>
    </div>
  </footer>
);

export function PublicLayout({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/client/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <PublicHeader />

      <main className="flex-grow w-full flex items-center justify-center pt-24 pb-12">
        <div className="absolute inset-0 z-0 opacity-40 bg-gradient-to-tr from-indigo-50 via-emerald-50 to-white"></div>

        <div className="relative z-10 w-full max-w-md mx-auto px-4 md:px-0">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100/50 transform transition duration-500 hover:shadow-3xl">
            <h1 className="sr-only">Đăng nhập hoặc Đăng ký</h1>

            {children}
          </div>

          <p className="text-center text-sm font-medium text-emerald-600 mt-6">
            Đăng nhập để nhận các ưu đãi độc quyền hôm nay!
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
