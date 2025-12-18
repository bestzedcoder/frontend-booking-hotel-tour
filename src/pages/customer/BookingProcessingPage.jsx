import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";

const WS_URL = "ws://localhost:8080/api/ws-booking";

export const BookingProcessingPage = () => {
  const { code: bookingCode, type: bookingType } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("PENDING");
  const [errorReason, setErrorReason] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Hiệu ứng thanh tiến trình giả lập cho trạng thái PENDING
  useEffect(() => {
    if (status === "PENDING" && !isLoading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 90) return 90; // Dừng ở 90% cho đến khi có kết quả thật
          return oldProgress + 5;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, isLoading]);

  useEffect(() => {
    if (!bookingCode || !bookingType) {
      navigate("/bookings");
      return;
    }

    let stompClient = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsLoading(false);
        stompClient.subscribe(
          `/topic/booking/${bookingCode}/type/${bookingType}`,
          (message) => {
            const result = JSON.parse(message.body);
            setStatus(result.status);
            if (result.status === "FAILED")
              setErrorReason(result.failureReason);
            if (["CONFIRMED", "FAILED"].includes(result.status)) {
              setProgress(100);
              stompClient.deactivate();
            }
          }
        );
      },
      onWebSocketError: () => {
        setStatus("ERROR");
        setErrorReason("Không thể thiết lập kết nối an toàn.");
        setIsLoading(false);
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [bookingCode, bookingType, navigate]);

  // Cấu hình giao diện theo Type
  const isHotel = bookingType === "hotel";
  const themeColor = isHotel ? "indigo" : "teal";
  const icon = isHotel ? "🏨" : "🎒";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative">
        {/* Progress Bar ở trên cùng */}
        {status === "PENDING" && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
            <div
              className={`h-full transition-all duration-500 ease-out bg-${themeColor}-500`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Header Section */}
        <div
          className={`bg-${themeColor}-900 p-10 text-white text-center relative overflow-hidden`}
        >
          <div className="absolute -right-4 -top-4 opacity-10 text-8xl rotate-12">
            {icon}
          </div>
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] opacity-70 mb-2">
            Xác nhận {isHotel ? "đặt phòng" : "chuyến du lịch"}
          </h1>
          <p className="text-3xl font-mono font-bold tracking-wider">
            {bookingCode}
          </p>
        </div>

        <div className="p-8">
          {/* --- TRẠNG THÁI: PENDING (ĐANG CHỜ) --- */}
          {status === "PENDING" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div
                    className={`w-28 h-28 border-4 border-${themeColor}-50 border-t-${themeColor}-600 rounded-full animate-spin`}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    {isHotel ? "🔑" : "✈️"}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mt-8 text-center">
                  {isHotel
                    ? "Đang kiểm tra phòng trống..."
                    : "Đang giữ chỗ tour..."}
                </h2>
                <p className="text-gray-500 text-center mt-3 leading-relaxed">
                  Hệ thống đang đồng bộ dữ liệu với đối tác vận hành. Vui lòng
                  không đóng trình duyệt.
                </p>
              </div>

              {/* Checklist UI */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span className="text-gray-600 font-medium text-sm text-nowrap">
                    Tiếp nhận mã: {bookingCode}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 animate-pulse">
                  <div
                    className={`flex-shrink-0 w-6 h-6 border-2 border-${themeColor}-500 rounded-full`}
                  ></div>
                  <span className={`text-${themeColor}-700 font-bold text-sm`}>
                    Đang xác nhận với nhà cung cấp...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* --- TRẠNG THÁI: CONFIRMED (THÀNH CÔNG) --- */}
          {status === "CONFIRMED" && (
            <div className="text-center py-4 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-800">
                Hoàn tất đặt chỗ!
              </h2>
              <p className="text-gray-500 mt-4 px-6 leading-relaxed">
                Voucher của bạn đã được gửi vào Email. Hãy sẵn sàng cho hành
                trình sắp tới!
              </p>
              <div className="mt-10 space-y-3">
                <button
                  onClick={() => navigate("/bookings")}
                  className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]`}
                >
                  Xem chi tiết lịch trình
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          )}

          {/* --- TRẠNG THÁI: FAILED / ERROR (THẤT BẠI) --- */}
          {(status === "FAILED" || status === "ERROR") && (
            <div className="text-center py-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Đặt chỗ không thành công
              </h2>
              <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-800 text-sm italic">
                "
                {errorReason ||
                  "Dịch vụ hiện không khả dụng, vui lòng thử lại sau."}
                "
              </div>
              <button
                onClick={() => navigate(-1)}
                className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
              >
                Quay lại tìm kiếm
              </button>
            </div>
          )}
        </div>

        {/* Support Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Hỗ trợ trực tuyến 24/7
          </span>
        </div>
      </div>
    </div>
  );
};
