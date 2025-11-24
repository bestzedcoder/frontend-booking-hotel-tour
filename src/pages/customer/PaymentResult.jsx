// Ví dụ PaymentResult.jsx (sử dụng React Router hook useSearchParams)
import React from "react";
import { useSearchParams, Link } from "react-router-dom";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status"); // Sẽ là 'success' hoặc 'failure'
  const bookingCode = searchParams.get("code"); // Mã đơn hàng

  if (!status) {
    return <div className="text-center p-10">Đang tải kết quả...</div>;
  }

  const isSuccess = status === "success";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div
        className={`p-10 rounded-xl shadow-2xl w-full max-w-lg text-center ${
          isSuccess
            ? "bg-white border-t-4 border-green-500"
            : "bg-white border-t-4 border-red-500"
        }`}
      >
        {/* Tiêu đề và biểu tượng */}
        <div
          className={`text-6xl mb-4 ${
            isSuccess ? "text-green-500" : "text-red-500"
          }`}
        >
          {isSuccess ? "🎉" : "❌"}
        </div>
        <h2 className="text-3xl font-bold mb-4">
          {isSuccess ? "Thanh Toán Thành Công" : "Thanh Toán Thất Bại"}
        </h2>

        {/* Thông báo chi tiết */}
        <p className="text-gray-700 mb-6">
          {isSuccess
            ? `Cảm ơn bạn! Đơn hàng **#${bookingCode}** đã được xác nhận.`
            : `Giao dịch đơn hàng **#${bookingCode}** chưa hoàn tất. Vui lòng thử lại.`}
        </p>

        {/* Các nút hành động */}
        <div className="mt-8 space-y-3">
          {isSuccess && (
            <Link
              to={`/bookings`}
              className="block py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Xem các đơn hàng của bạn
            </Link>
          )}
          {!isSuccess && (
            <button className="block w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
              Thử Lại Thanh Toán
            </button>
          )}
          <Link
            to="/"
            className="block py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg bg-white hover:bg-gray-100 transition"
          >
            Quay lại Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
