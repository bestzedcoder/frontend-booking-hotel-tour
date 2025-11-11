import { Navigate } from "react-router-dom";
import { Plane } from "lucide-react";

// Giả định hook useAuth được import từ nơi khác (đã có trong prompt gốc)
// import { useAuth } from "../hooks/useAuth";
const useAuth = () => ({ user: null }); // Mocking useAuth for a self-contained file

// --- Components Con Của Layout ---

const PublicHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      {/* Logo và Tên Ứng Dụng */}
      <a
        href="/"
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

// --- Component Chính PublicLayout ---

export function PublicLayout({ children }) {
  // GIẢ ĐỊNH: useAuth() là hook lấy trạng thái người dùng
  const { user } = useAuth();

  // Chuyển hướng nếu người dùng đã đăng nhập (logic gốc)
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* 1. Header */}
      <PublicHeader />

      {/* 2. Main Content (Nơi chứa Login/Register Forms) */}
      <main className="flex-grow pt-24 pb-12 w-full">
        {/* Nền nhẹ nhàng với gradient */}
        <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-br from-indigo-50 to-blue-50"></div>

        {/* Container cho Form: Căn giữa, giới hạn chiều rộng */}
        <div className="relative z-10 max-w-lg mx-auto px-4">{children}</div>
      </main>

      {/* 3. Footer */}
      <PublicFooter />
    </div>
  );
}

// Export default để tiện sử dụng
export default PublicLayout;
