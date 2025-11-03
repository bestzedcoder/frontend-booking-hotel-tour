import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md">
        <div className="flex justify-center mb-6">
          <Lock className="w-20 h-20 text-red-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-3">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-500 mb-6">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
          viên nếu bạn cho rằng đây là lỗi.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            ← Quay lại
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
