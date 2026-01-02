import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  RefreshCcw,
  Edit,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

const BOOKING_STATUS = {
  PENDING: {
    label: "Chờ xử lý",
    color: "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "text-green-700 bg-green-50 ring-green-600/20",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-700 bg-red-50 ring-red-600/20",
  },
};

const PAYMENT_METHOD = {
  VNPay: {
    label: "Trực tuyến",
    icon: <CreditCard className="w-4 h-4 mr-1" />,
  },
  CASH: { label: "Tiền mặt", icon: <Banknote className="w-4 h-4 mr-1" /> },
};

const BOOKING_TYPES = {
  TOUR: "Tour du lịch",
  HOTEL: "Khách sạn",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (isNaN(date)) return "Invalid Date";

    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Lỗi định dạng";
  }
};

const BookingManagementBusinessPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { callApi } = useApi();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalElements: 0,
  });

  const [filters, setFilters] = useState({
    code: "",
    customer: "",
    status: "",
    type: "",
    start_date: "",
    end_date: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    code: "",
    customer: "",
    status: "",
    type: "",
    start_date: "",
    end_date: "",
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...appliedFilters,
      });

      const response = await callApi(
        "get",
        `bookings/by-business?${params.toString()}`
      );

      if (!response?.success) {
        if (response?.message) alert(response.message);
        setBookings([]);
        setPagination((prev) => ({
          ...prev,
          page: 1,
          totalPages: 1,
          totalElements: 0,
        }));
        return;
      }

      setBookings(response.data.result);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      }));
    } catch (error) {
      console.error("Fetch bookings failed:", error);
      alert("Có lỗi xảy ra khi tải dữ liệu.");
      setBookings([]);
      setPagination((prev) => ({
        ...prev,
        page: 1,
        totalPages: 1,
        totalElements: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, appliedFilters, callApi]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (filters.start_date && !filters.end_date) {
      alert("Vui lòng chọn ngày kết thúc (Đến ngày)!");
      return;
    }

    if (!filters.start_date && filters.end_date) {
      alert("Vui lòng chọn ngày bắt đầu (Từ ngày)!");
      return;
    }

    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);
      if (start > end) {
        alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        return;
      }
    }

    setPagination((prev) => ({ ...prev, page: 1 }));
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    const emptyFilters = {
      code: "",
      customer: "",
      status: "",
      type: "",
      start_date: "",
      end_date: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(e.target.value),
      page: 1,
    }));
  };

  const openUpdateModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking) return;

    console.log(
      `Updating booking ${selectedBooking.bookingId} to ${newStatus}`
    );

    const response = await callApi(
      "put",
      `bookings/update-status/${selectedBooking.bookingId}`,
      {
        status: newStatus,
      }
    );

    alert(response.message);

    if (!response.success) return;

    setIsModalOpen(false);
    fetchBookings();
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.page - delta && i <= pagination.page + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý Booking
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Theo dõi và cập nhật trạng thái đơn hàng từ phía Business
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-slate-700 transition-all shadow-sm"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
          >
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Mã Booking
              </label>
              <input
                type="text"
                name="code"
                placeholder="VD: BK-..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-sm transition-all"
                value={filters.code}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Khách hàng
              </label>
              <input
                type="text"
                name="customer"
                placeholder="Tên/SĐT..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-sm transition-all"
                value={filters.customer}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Loại dịch vụ
              </label>
              <select
                name="type"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-sm transition-all"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                {Object.entries(BOOKING_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Trạng thái
              </label>
              <select
                name="status"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-sm transition-all"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                {Object.entries(BOOKING_STATUS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Từ ngày
              </label>
              <input
                type="date"
                name="start_date"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-sm transition-all"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Đến ngày
              </label>
              <input
                type="date"
                name="end_date"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-sm transition-all"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-span-1 lg:col-span-6 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto flex justify-center items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm shadow-blue-200"
              >
                <Search className="w-4 h-4 mr-2" />
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Mã Booking
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Thanh toán
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-center w-32">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="w-12 h-12 text-slate-200 mb-3" />
                        <p className="font-medium text-slate-600">
                          Không tìm thấy kết quả nào
                        </p>
                        <p className="text-sm">
                          Hãy thử thay đổi bộ lọc tìm kiếm
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr
                      key={item.bookingId}
                      className="hover:bg-blue-50/50 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center">
                          <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 text-xs mr-2">
                            #{item.bookingId}
                          </span>
                          {item.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center">
                          {PAYMENT_METHOD[item.paymentMethod]?.icon}
                          {PAYMENT_METHOD[item.paymentMethod]?.label ||
                            item.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="text-xs font-mono">
                          {formatDateTime(item.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${
                            BOOKING_STATUS[item.status]?.color ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {BOOKING_STATUS[item.status]?.label || item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openUpdateModal(item)}
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all"
                          title="Cập nhật trạng thái"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  className="border border-gray-300 rounded bg-white px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span>dòng / trang</span>
              </div>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="hidden sm:inline">
                Tổng <b>{pagination.totalElements}</b> kết quả
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors mr-1"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === "..." ? (
                    <span className="px-2 text-gray-400 text-xs">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[32px] h-8 flex items-center justify-center rounded text-sm font-medium transition-all ${
                        pagination.page === pageNum
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : "text-slate-600 hover:bg-gray-200 bg-white border border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors ml-1"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Edit
                      className="h-5 w-5 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3
                      className="text-lg font-semibold leading-6 text-slate-900"
                      id="modal-title"
                    >
                      Cập nhật trạng thái
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-4">
                        Thay đổi trạng thái cho đơn đặt chỗ{" "}
                        <span className="font-mono font-medium text-slate-700">
                          {selectedBooking?.code}
                        </span>
                      </p>

                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-slate-600">
                        <p>
                          <span className="font-medium mr-1">Ngày tạo:</span>
                          <span className="font-mono">
                            {formatDateTime(selectedBooking?.createdAt)}
                          </span>
                        </p>
                        {selectedBooking?.updatedAt && (
                          <p className="mt-1">
                            <span className="font-medium mr-1">
                              Cập nhật cuối:
                            </span>
                            <span className="font-mono">
                              {formatDateTime(selectedBooking.updatedAt)}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {Object.entries(BOOKING_STATUS).map(([key, config]) => (
                          <label
                            key={key}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                              newStatus === key
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={key}
                              checked={newStatus === key}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                              <span
                                className={`text-sm font-medium ${
                                  newStatus === key
                                    ? "text-blue-900"
                                    : "text-slate-900"
                                }`}
                              >
                                {config.label}
                              </span>
                            </div>
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${config.color
                                .split(" ")[0]
                                .replace("text-", "bg-")}`}
                            ></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto transition-colors"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagementBusinessPage;
