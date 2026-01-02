import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { useApi } from "../../hooks/useApi";

const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};
const PaymentMethod = { CASH: "CASH", VNPAY: "VNPay" };
const BookingType = {
  ALL: "TẤT CẢ",
  HOTEL: "HOTEL",
  TOUR: "TOUR",
};
const ITEMS_PER_PAGE = 8;

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

const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    return format(new Date(isoString), "HH:mm dd/MM/yyyy");
  } catch (e) {
    return "Invalid Date";
  }
};

const BookingItem = ({ booking, onOpenModal }) => {
  const isHotel = booking.type === BookingType.HOTEL;
  const mainDetail = isHotel
    ? booking.details.hotelName
    : booking.details.tourName;

  return (
    <div className="bg-white hover:bg-indigo-50 transition duration-200 border-b border-gray-100">
      <div className="grid grid-cols-12 items-center p-4 sm:p-6 gap-y-3">
        <div className="col-span-12 lg:col-span-3 flex flex-col">
          <span className="text-lg font-bold text-indigo-700">
            #{booking.bookingCode}
          </span>
          <span className="text-sm text-gray-500 line-clamp-1">
            {isHotel ? "🏨 Khách sạn" : "🗺️ Tour"} | {mainDetail}
          </span>
        </div>

        <div className="col-span-6 sm:col-span-4 lg:col-span-2 flex flex-col items-start lg:items-center">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border mb-1 ${getStatusClasses(
              booking.status
            )}`}
          >
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </span>
          <span className="font-bold text-red-600 text-sm">
            {booking.price.toLocaleString()}đ
          </span>
        </div>

        <div className="col-span-6 sm:col-span-4 lg:col-span-3 text-sm text-gray-600">
          <span className="font-semibold text-gray-700 block mb-1">Tạo:</span>
          {formatDateTime(booking.createdAt)}
        </div>

        <div className="hidden lg:flex col-span-3 text-sm text-gray-600 flex-col">
          <span className="font-semibold text-gray-700 block mb-1">
            Cập nhật:
          </span>
          {formatDateTime(booking.updatedAt)}
        </div>

        <div className="col-span-12 sm:col-span-4 lg:col-span-1 flex justify-end items-center space-x-2">
          <span className="text-sm text-gray-600 hidden sm:inline">
            {getPaymentIcon(booking.paymentMethod)}
          </span>
          <button
            className="p-2 rounded-full text-indigo-500 hover:bg-indigo-200 transition"
            title="Xem chi tiết"
            onClick={() => onOpenModal(booking)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

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

const BookingDetailsModal = ({ booking, onClose, callApi }) => {
  if (!booking) return null;

  const [isPaying, setIsPaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isHotel = booking.type === BookingType.HOTEL;
  const { status, paymentMethod, price } = booking;

  let actionButtonText = "";
  let actionButtonClasses = "";
  let actionDisabled = false;

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

  const paymentActionDisabled = actionDisabled || isPaying || isExporting;
  const exportActionDisabled = isPaying || isExporting;

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

  const handleAction = async () => {
    if (paymentActionDisabled) return;

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
      onClose();

      window.location.href = paymentUrl;
    } catch (error) {
      alert(`Thanh toán thất bại: ${error.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  const handleExportInvoice = async () => {
    if (exportActionDisabled) return;

    setIsExporting(true);

    try {
      console.log(`Bắt đầu xuất hóa đơn cho mã ${booking.bookingCode}`);
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 scale-100">
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

          <div className="text-sm text-gray-500 border-b pb-3 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Ngày tạo:</span>
              <span>{formatDateTime(booking.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Cập nhật cuối:</span>
              <span>{formatDateTime(booking.updatedAt)}</span>
            </div>
          </div>

          <div className="flex justify-between text-xl font-bold border-t pt-3">
            <span className="text-gray-700">TỔNG CỘNG:</span>
            <span className="text-red-700">{price.toLocaleString()} VND</span>
          </div>

          {renderDetails()}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex flex-col space-y-3">
          <button
            onClick={handleAction}
            disabled={paymentActionDisabled}
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

          <button
            onClick={handleExportInvoice}
            disabled={exportActionDisabled}
            className={`w-full py-3 text-indigo-600 font-semibold border border-indigo-600 rounded-lg bg-white hover:bg-indigo-50 transition duration-200 flex justify-center items-center ${
              exportActionDisabled ? "opacity-60 cursor-not-allowed" : ""
            } ${isExporting ? "opacity-70 cursor-wait" : ""}`}
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

export const BookingManagementPage = () => {
  const { callApi } = useApi();

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const [searchCode, setSearchCode] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await callApi("get", "bookings/by-customer");
        if (!response.success) {
          setError(response.message);
          setLoading(false);
          return;
        }
        setAllBookings(response.data);
      } catch (e) {
        setError("Không thể tải dữ liệu đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [callApi]);

  const filteredBookings = useMemo(() => {
    let list = allBookings;

    if (filterStatus !== "ALL") {
      list = list.filter((b) => b.status === filterStatus);
    }

    if (filterType !== "ALL") {
      list = list.filter((b) => b.type === filterType);
    }

    if (searchCode.trim()) {
      const lowerSearch = searchCode.trim().toLowerCase();
      list = list.filter((b) =>
        b.bookingCode.toLowerCase().includes(lowerSearch)
      );
    }

    setCurrentPage(1);
    return list;
  }, [allBookings, filterStatus, filterType, searchCode]);

  const currentBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
  };

  const closeDetailsModal = () => {
    setSelectedBooking(null);
  };

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

      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
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

        <div className="md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lọc theo Loại
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">Tất cả ({allBookings.length})</option>
            <option value={BookingType.HOTEL}>Khách sạn</option>
            <option value={BookingType.TOUR}>Tour</option>
          </select>
        </div>

        <div className="md:w-48">
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

      <div className="hidden lg:grid grid-cols-12 p-4 bg-indigo-100/70 text-indigo-800 font-bold rounded-t-xl text-sm border-b border-indigo-200">
        <div className="col-span-3">Mã Đơn & Chi tiết</div>
        <div className="col-span-2 flex justify-center">Trạng thái & Giá</div>
        <div className="col-span-3">Thời gian Tạo</div>
        <div className="col-span-3">Thời gian Cập nhật</div>
        <div className="col-span-1 flex justify-end">Actions</div>
      </div>

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
                onOpenModal={openDetailsModal}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}

      <BookingDetailsModal
        booking={selectedBooking}
        onClose={closeDetailsModal}
        callApi={callApi}
      />
    </div>
  );
};
