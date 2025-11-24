import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { useApi } from "../../hooks/useApi";

// =========================================================
// 1. CONSTANTS VÀ MOCK DATA (GIỮ NGUYÊN)
// =========================================================
const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};
const PaymentMethod = { CASH: "CASH", VNPAY: "VNPay" };
const BookingType = { HOTEL: "HOTEL", TOUR: "TOUR" };
const ITEMS_PER_PAGE = 8;
// ... (Các mock data khác được giữ nguyên) ...

const mockBookings = [
  // ... (Mock data list) ...
  {
    bookingId: 101,
    status: BookingStatus.CONFIRMED,
    type: BookingType.HOTEL,
    bookingCode: "BK1001",
    price: 3500000,
    paymentMethod: PaymentMethod.VNPAY,
    details: {
      hotelName: "Khách sạn Sài Gòn",
      hotelAddress: "123 Nguyễn Huệ, Q.1",
      roomName: "Phòng 301",
      roomType: "DOUBLE",
      hotelStar: 4,
      checkIn: "2025-12-01",
      checkOut: "2025-12-03",
      duration: 2,
      bookingRoomType: "DELUXE",
    },
  },
  {
    bookingId: 102,
    status: BookingStatus.PENDING,
    type: BookingType.TOUR,
    bookingCode: "BK1002",
    price: 12500000,
    paymentMethod: PaymentMethod.CASH,
    details: {
      tourName: "Khám phá Vịnh Hạ Long",
      startDate: "2025-12-10",
      endDate: "2025-12-12",
      people: 4,
      duration: 3,
    },
  },
  {
    bookingId: 103,
    status: BookingStatus.CANCELLED,
    type: BookingType.HOTEL,
    bookingCode: "BK1003",
    price: 1500000,
    paymentMethod: PaymentMethod.CASH,
    details: {
      hotelName: "Khách sạn Đà Nẵng",
      hotelAddress: "456 Lê Lợi, Hải Châu",
      roomName: "Phòng 101",
      roomType: "SINGLE",
      hotelStar: 3,
      checkIn: "2025-11-20",
      checkOut: "2025-11-21",
      duration: 1,
      bookingRoomType: "STANDARD",
    },
  },
  {
    bookingId: 104,
    status: BookingStatus.PENDING,
    type: BookingType.HOTEL,
    bookingCode: "BK1004",
    price: 4000000,
    paymentMethod: PaymentMethod.VNPAY,
    details: {
      hotelName: "Khách sạn A",
      hotelAddress: "Địa chỉ A",
      roomName: "Phòng A",
      hotelStar: 5,
      checkIn: "2025-12-05",
      checkOut: "2025-12-07",
      duration: 2,
      bookingRoomType: "DELUXE",
    },
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    bookingId: 105 + i,
    status:
      i % 3 === 0
        ? BookingStatus.CONFIRMED
        : i % 3 === 1
        ? BookingStatus.PENDING
        : BookingStatus.CANCELLED,
    type: i % 2 === 0 ? BookingType.HOTEL : BookingType.TOUR,
    bookingCode: `BK${1005 + i}`,
    price: (i + 1) * 1000000,
    paymentMethod: i % 2 === 0 ? PaymentMethod.VNPAY : PaymentMethod.CASH,
    details:
      i % 2 === 0
        ? {
            hotelName: "Khách sạn Y",
            checkIn: "2025-12-01",
            checkOut: "2025-12-03",
            duration: 2,
            hotelStar: 5,
          }
        : {
            tourName: "Tour Biển Z",
            startDate: "2025-12-10",
            endDate: "2025-12-12",
            people: 2,
            duration: 3,
          },
  })),
];

// =========================================================
// 2. HELPER FUNCTIONS (GIỮ NGUYÊN)
// =========================================================
const getStatusClasses = (status) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "bg-green-100 text-green-800 border-green-400";
    case BookingStatus.PENDING:
      return "bg-yellow-100 text-yellow-800 border-yellow-400";
    case BookingStatus.CANCELLED:
      return "bg-red-100 text-red-800 border-red-400";
    default:
      return "bg-gray-100 text-gray-800 border-gray-400";
  }
};
const getPaymentIcon = (method) => {
  switch (method) {
    case PaymentMethod.VNPAY:
      return "💳 VNPay";
    case PaymentMethod.CASH:
      return "💵 Tiền mặt";
    default:
      return method;
  }
};

// =========================================================
// 3. SUB COMPONENTS (BookingItem, Pagination, BookingDetailsModal)
// =========================================================

/**
 * Component hiển thị chi tiết 1 đơn hàng (UI đẹp hơn).
 */
const BookingItem = ({ booking, onOpenModal }) => {
  const isHotel = booking.type === BookingType.HOTEL;
  const mainDetail = isHotel
    ? booking.details.hotelName
    : booking.details.tourName;

  return (
    <div className="bg-white hover:bg-indigo-50 transition duration-200 border-b border-gray-100">
      <div className="grid grid-cols-12 items-center p-4 sm:p-6 gap-2">
        {/* Booking Code + Name */}
        <div className="col-span-6 md:col-span-4 flex flex-col">
          <span className="text-lg font-bold text-gray-800">
            #{booking.bookingCode}
          </span>
          <span className="text-sm text-gray-500">
            {isHotel ? "🏨 " : "🗺️ "} {mainDetail}
          </span>
        </div>

        {/* Price */}
        <div className="col-span-3 md:col-span-2 font-semibold text-red-600 text-sm sm:text-md">
          {booking.price.toLocaleString()}đ
        </div>

        {/* Status */}
        <div className="col-span-3 md:col-span-2 flex justify-center">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClasses(
              booking.status
            )}`}
          >
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Payment icon */}
        <div className="hidden md:flex col-span-2 justify-center text-gray-600">
          {getPaymentIcon(booking.paymentMethod)}
        </div>

        {/* 3-dots Action */}
        <div className="col-span-12 md:col-span-1 flex justify-end">
          <button
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition"
            title="Xem chi tiết"
            onClick={() => onOpenModal(booking)}
          >
            <span style={{ fontSize: "1.25rem", lineHeight: "1rem" }}>⋮</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component hiển thị thanh Phân Trang (Giữ nguyên).
 */
const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50"
      >
        ← Trước
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-1 border rounded-lg font-medium transition-colors ${
            page === currentPage
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 hover:bg-indigo-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50"
      >
        Sau →
      </button>
    </div>
  );
};

/**
 * Component Modal hiển thị chi tiết hóa đơn và nút hành động.
 */
const BookingDetailsModal = ({ booking, onClose, callApi }) => {
  if (!booking) return null;

  // 1. State cho trạng thái Loading
  const [isPaying, setIsPaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isHotel = booking.type === BookingType.HOTEL;
  const { status, paymentMethod, price } = booking;

  // 2. Logic cho nút Thanh toán/Hành động
  let actionButtonText = "";
  let actionButtonClasses = "";
  let actionDisabled = false; // Vô hiệu hóa cho nút thanh toán/hành động chính

  if (status === BookingStatus.PENDING) {
    if (paymentMethod === PaymentMethod.VNPAY) {
      actionButtonText = "💳 Thanh toán VNPay";
      actionButtonClasses = "bg-green-600 hover:bg-green-700";
    } else if (paymentMethod === PaymentMethod.CASH) {
      actionButtonText = "💵 Thanh toán bằng Tiền mặt";
      actionButtonClasses = "bg-yellow-600 hover:bg-yellow-700";
      actionDisabled = true;
    }
  } else if (status === BookingStatus.CONFIRMED) {
    actionButtonText = "🎉 Đã Thanh Toán";
    actionButtonClasses = "bg-gray-500 cursor-not-allowed";
    actionDisabled = true;
  } else if (status === BookingStatus.CANCELLED) {
    actionButtonText = "❌ Thanh toán bị Hủy";
    actionButtonClasses = "bg-red-500 cursor-not-allowed";
    actionDisabled = true;
  }

  // 💡 BIẾN VÔ HIỆU HÓA ĐÃ CHỈNH SỬA
  // Nút Thanh toán/Hành động chính bị vô hiệu hóa khi: logic business (actionDisabled) HOẶC đang loading
  const paymentActionDisabled = actionDisabled || isPaying || isExporting;

  // Nút Xuất Hóa Đơn CHỈ bị vô hiệu hóa khi đang có quá trình loading (thanh toán hoặc xuất)
  const exportActionDisabled = isPaying || isExporting;

  // 3. Hàm render chi tiết (Giữ nguyên)
  const renderDetails = () => {
    if (isHotel) {
      const d = booking.details;
      return (
        <div className="space-y-3 p-4 border rounded-lg bg-indigo-50/50">
          <p className="font-bold text-indigo-700">🏨 Chi Tiết Đặt Khách Sạn</p>
          <p>
            Tên Khách sạn: **{d.hotelName}** ({d.hotelStar} sao)
          </p>
          <p>
            Phòng: {d.roomName} ({d.bookingRoomType || "N/A"})
          </p>
          <p>Địa chỉ: {d.hotelAddress}</p>
          <p>Check-in: **{format(new Date(d.checkIn), "dd/MM/yyyy")}**</p>
          <p>
            Check-out: **{format(new Date(d.checkOut), "dd/MM/yyyy")}** (
            {d.duration} {d.bookingRoomType === "HOURLY" ? "giờ" : "ngày"})
          </p>
        </div>
      );
    } else {
      const d = booking.details;
      return (
        <div className="space-y-3 p-4 border rounded-lg bg-green-50/50">
          <p className="font-bold text-green-700">🗺️ Chi Tiết Đặt Tour</p>
          <p>Tên Tour: **{d.tourName}**</p>
          <p>Số người: {d.people}</p>
          <p>Thời lượng: {d.duration} ngày</p>
          <p>
            Ngày khởi hành: **{format(new Date(d.startDate), "dd/MM/yyyy")}**
          </p>
          <p>Ngày kết thúc: **{format(new Date(d.endDate), "dd/MM/yyyy")}**</p>
        </div>
      );
    }
  };

  // 4. Hàm xử lý hành động (Thanh toán)
  const handleAction = async () => {
    if (paymentActionDisabled) return; // Dùng biến mới

    setIsPaying(true);

    try {
      console.log(`Bắt đầu thanh toán cho mã ${booking.bookingCode}`);
      const response = await callApi(
        "get",
        `payment/vn-pay/${booking.bookingId}`
      );

      if (!response.success) {
        alert(response.message);
        setIsPaying(false);
        return;
      }

      const paymentUrl = response.data;
      onClose(); // Đóng modal trước khi chuyển hướng

      window.location.href = paymentUrl; // Chuyển hướng đến VNPay
    } catch (error) {
      alert(`Thanh toán thất bại: ${error.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  // 5. Hàm xử lý Xuất Hóa Đơn
  const handleExportInvoice = async () => {
    if (exportActionDisabled) return; // Dùng biến mới

    setIsExporting(true);

    try {
      console.log(`Bắt đầu xuất hóa đơn cho mã ${booking.bookingCode}`);
      // Mô phỏng API call cho việc xuất hóa đơn
      const response = await callApi(
        "get",
        `bookings/invoice/${booking.bookingId}`
      );
      if (response.success)
        alert(
          `Xuất hóa đơn thành công (Mô phỏng) cho mã ${booking.bookingCode}`
        );
      else alert(response.message);
    } catch (error) {
      alert(`Xuất hóa đơn thất bại: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 6. JSX (Đã cập nhật logic disabled cho cả 2 nút)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 scale-100">
        {/* Header (Giữ nguyên) */}
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 rounded-t-xl">
          <h3 className="text-2xl font-bold text-white">
            🧾 Hóa Đơn Đơn Hàng #{booking.bookingCode}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-light"
          >
            &times;
          </button>
        </div>

        {/* Content - Bill Details (Giữ nguyên) */}
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
            <span className="text-lg font-medium text-gray-600">
              Trạng thái:
            </span>
            <span
              className={`px-4 py-1 text-md font-bold rounded-full border ${getStatusClasses(
                status
              )}`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          </div>

          <div className="flex justify-between text-xl font-bold border-t pt-3">
            <span className="text-gray-700">TỔNG CỘNG:</span>
            <span className="text-red-700">{price.toLocaleString()} VND</span>
          </div>

          {renderDetails()}
        </div>

        {/* Footer - Actions (ĐÃ CẬP NHẬT) */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex flex-col space-y-3">
          {/* Nút Thanh toán/Hành động */}
          <button
            onClick={handleAction}
            disabled={paymentActionDisabled} // Dùng biến đã chỉnh sửa
            className={`w-full py-3 text-white font-semibold rounded-lg transition duration-200 flex justify-center items-center ${
              isPaying ? "bg-green-700 cursor-wait" : actionButtonClasses
            } ${
              paymentActionDisabled && !isPaying
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            {isPaying ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              actionButtonText
            )}
          </button>

          {/* Nút Xuất Hóa Đơn */}
          <button
            onClick={handleExportInvoice}
            disabled={exportActionDisabled} // 💡 Dùng biến exportActionDisabled mới (chỉ bị cấm khi loading)
            className={`w-full py-3 text-indigo-600 font-semibold border border-indigo-600 rounded-lg bg-white hover:bg-indigo-50 transition duration-200 flex justify-center items-center ${
              exportActionDisabled
                ? "opacity-60 cursor-not-allowed" // Vô hiệu hóa khi loading
                : ""
            } ${
              isExporting
                ? "opacity-70 cursor-wait" // Thêm hiệu ứng đang chờ khi đang xuất
                : ""
            }`}
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xuất hóa đơn...
              </>
            ) : (
              "Xuất Hóa Đơn"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 4. MAIN COMPONENT (Đã cập nhật)
// =========================================================

export const BookingManagementPage = () => {
  // ... (useApi hook if needed) ...
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  // 💡 THÊM STATE MỚI CHO LOẠI ĐƠN HÀNG (HOTEL/TOUR)
  const [filterType, setFilterType] = useState("ALL"); // Giá trị mặc định là "ALL"

  const [searchCode, setSearchCode] = useState("");
  // Dùng state này để lưu booking đang được chọn để hiển thị modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { callApi } = useApi();

  // --- Hằng số cho loại đơn hàng (Giả định) ---
  const BookingType = {
    ALL: "TẤT CẢ",
    HOTEL: "HOTEL",
    TOUR: "TOUR",
  };

  // --- Fetch Data (Mô phỏng) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 💡 Giả sử API vẫn lấy tất cả và lọc ở Frontend, hoặc bạn có thể truyền filterType vào API
        const response = await callApi("get", "bookings/by-customer");
        if (!response.success) {
          alert(response.message);
          setLoading(false);
          return;
        }
        setAllBookings(response.data);
        setLoading(false);
      } catch (e) {
        setError("Không thể tải dữ liệu đơn hàng.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Lọc và Phân Trang (Đã Cập Nhật) ---
  const filteredBookings = useMemo(() => {
    let list = allBookings;

    // 1. Lọc theo TRẠNG THÁI
    if (filterStatus !== "ALL") {
      list = list.filter((b) => b.status === filterStatus);
    }

    // 💡 2. Lọc theo LOẠI ĐƠN HÀNG
    if (filterType !== "ALL") {
      // Giả sử mỗi booking có trường 'type'
      list = list.filter((b) => b.type === filterType);
    }

    // 3. Lọc theo MÃ ĐƠN
    if (searchCode.trim()) {
      const lowerSearch = searchCode.trim().toLowerCase();
      list = list.filter((b) =>
        b.bookingCode.toLowerCase().includes(lowerSearch)
      );
    }

    // Đặt lại trang về 1 khi các bộ lọc thay đổi
    setCurrentPage(1);
    return list;
  }, [allBookings, filterStatus, filterType, searchCode]); // 💡 Thêm filterType vào dependency

  const currentBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  // --- Handlers (Giữ nguyên) ---
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // Mở modal
  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
  };

  // Đóng modal
  const closeDetailsModal = () => {
    setSelectedBooking(null);
  };

  // --- UI Loading/Error (Giữ nguyên) ---
  if (loading)
    return (
      <div className="p-10 text-center text-xl font-medium text-indigo-600">
        🌀 Đang tải danh sách đơn hàng...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-xl font-bold text-red-600">
        ❌ Lỗi: {error}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-indigo-500 pb-2">
        📦 Quản Lý Đơn Hàng Của Tôi
      </h1>

      {/* --- Bộ Lọc và Tìm Kiếm (Đã Cập Nhật) --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Bộ Lọc Mã Đơn (Giữ nguyên) */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tìm theo Mã Đơn
          </label>
          <input
            type="text"
            placeholder="Nhập mã booking code..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 💡 BỘ LỌC THEO LOẠI ĐƠN HÀNG */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lọc theo Loại
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">Tất cả ({allBookings.length})</option>
            {/* Lọc các giá trị duy nhất cho loại đơn hàng, hoặc sử dụng hằng số BookingType */}
            <option value={BookingType.HOTEL}>Khách sạn</option>
            <option value={BookingType.TOUR}>Tour</option>
            {/* ... thêm các loại khác nếu cần ... */}
          </select>
        </div>

        {/* Bộ Lọc theo Trạng Thái (Giữ nguyên) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lọc theo Trạng Thái
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">Tất cả ({allBookings.length})</option>
            {Object.values(BookingStatus).map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}(
                {allBookings.filter((b) => b.status === status).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Bảng Đơn Hàng (Giữ nguyên) --- */}
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
        {currentBookings.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-lg">
            Không tìm thấy đơn hàng nào phù hợp với tiêu chí lọc.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentBookings.map((booking) => (
              <BookingItem
                key={booking.bookingId}
                booking={booking}
                onOpenModal={openDetailsModal} // Truyền handler mở modal
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Phân Trang (Pagination) --- */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}

      {/* --- Modal Chi Tiết Hóa Đơn --- */}
      <BookingDetailsModal
        booking={selectedBooking}
        onClose={closeDetailsModal}
        callApi={callApi}
      />
    </div>
  );
};
