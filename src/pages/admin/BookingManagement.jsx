import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useApi } from "../../hooks/useApi";

const LIMIT_OPTIONS = [
  { value: 10, label: "10 / trang" },
  { value: 25, label: "25 / trang" },
  { value: 50, label: "50 / trang" },
];

const STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "Chờ xử lý",
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    value: "CONFIRMED",
    label: "Đã xác nhận",
    color: "text-green-600 bg-green-100",
  },
  { value: "CANCELLED", label: "Đã hủy", color: "text-red-600 bg-red-100" },
];

const TYPE_OPTIONS = [
  { value: "TOUR", label: "Tour" },
  { value: "HOTEL", label: "Khách sạn" },
];

const METHOD_OPTIONS = [
  { value: "VNPay", label: "VNPay (Chuyển khoản)" },
  { value: "CASH", label: "Tiền mặt" },
];

const getStatusDisplay = (status) =>
  STATUS_OPTIONS.find((opt) => opt.value === status) || {
    label: status,
    color: "text-gray-600 bg-gray-100",
  };

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount || 0
  );

export default function BookingManagement() {
  const { callApi } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: null,
    booking_type: null,
    booking_code: "",
    customer: "",
    payment_method: null,
  });

  const [searchCode, setSearchCode] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedLimit, setSelectedLimit] = useState(10);

  const fetchBookings = useCallback(
    async (currentFilters) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("page", currentFilters.page.toString());
      params.append("limit", currentFilters.limit.toString());

      if (currentFilters.status) params.append("status", currentFilters.status);
      if (currentFilters.booking_type)
        params.append("booking_type", currentFilters.booking_type);
      if (currentFilters.booking_code)
        params.append("booking_code", currentFilters.booking_code.trim());
      if (currentFilters.customer)
        params.append("customer", currentFilters.customer.trim());
      if (currentFilters.payment_method)
        params.append("payment_method", currentFilters.payment_method);

      try {
        const response = await callApi(
          "get",
          `bookings/by-admin?${params.toString()}`
        );
        setData(response.data);

        setFilters(currentFilters);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu đặt chỗ. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  useEffect(() => {
    fetchBookings(filters);
  }, []);

  const handleFilterSelectChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setSelectedLimit(newLimit);
    const newFilters = {
      ...filters,
      limit: newLimit,
      page: 1,
    };
    fetchBookings(newFilters);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newFilters = {
      ...filters,
      booking_code: searchCode,
      customer: searchCustomer,
      page: 1,
    };
    fetchBookings(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (!data || newPage < 1 || newPage > data.totalPages || loading) return;

    const newFilters = { ...filters, page: newPage };
    fetchBookings(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: selectedLimit,
      status: null,
      booking_type: null,
      booking_code: "",
      customer: "",
      payment_method: null,
    };
    setSearchCode("");
    setSearchCustomer("");

    fetchBookings(defaultFilters);
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const currentPage = data.currentPages;
    const totalPages = data.totalPages;

    const renderPageButton = (page, isCurrent = false) => (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        disabled={loading || isCurrent}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out 
                    ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 disabled:opacity-70"
                    }`}
      >
        {page}
      </button>
    );

    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages, 5);
    } else if (currentPage > totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPageButton(i, i === currentPage));
    }

    if (startPage > 1) {
      pages.unshift(
        <span key="start-dots" className="px-3 py-1 text-gray-500">
          ...
        </span>
      );
      pages.unshift(renderPageButton(1));
    }
    if (endPage < totalPages) {
      pages.push(
        <span key="end-dots" className="px-3 py-1 text-gray-500">
          ...
        </span>
      );
      pages.push(renderPageButton(totalPages));
    }

    return (
      <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="text-sm text-gray-600">
          Hiển thị{" "}
          <span className="font-semibold text-gray-900">
            {data.result.length}
          </span>{" "}
          /{" "}
          <span className="font-semibold text-gray-900">
            {data.totalElements}
          </span>{" "}
          đơn đặt chỗ.
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex space-x-1">{pages}</div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
            aria-label="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="limit-select" className="text-sm text-gray-700">
            Hiển thị:
          </label>
          <select
            id="limit-select"
            value={selectedLimit}
            onChange={handleLimitChange}
            disabled={loading}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label.split(" / ")[0]}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Quản lý Đặt chỗ 📋
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterSelectChange("status", e.target.value)
              }
              className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">-- Trạng thái --</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Loại đơn
            </label>
            <select
              value={filters.booking_type || ""}
              onChange={(e) =>
                handleFilterSelectChange("booking_type", e.target.value)
              }
              className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">-- Loại đơn --</option>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Thanh toán
            </label>
            <select
              value={filters.payment_method || ""}
              onChange={(e) =>
                handleFilterSelectChange("payment_method", e.target.value)
              }
              className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">-- Phương thức --</option>
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="booking_code"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Mã đơn
            </label>
            <input
              type="text"
              id="booking_code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Mã đơn..."
            />
          </div>

          <div>
            <label
              htmlFor="customer"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Khách hàng
            </label>
            <input
              type="text"
              id="customer"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Tên hoặc Email..."
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-shrink-0 flex items-center justify-center h-9 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <Search size={16} className="mr-1" /> Tìm
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex-shrink-0 flex items-center justify-center h-9 w-9 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PT Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-blue-600">
                  <Loader2 className="animate-spin inline mr-2" size={20} />{" "}
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-red-600 font-medium"
                >
                  Lỗi: {error}
                </td>
              </tr>
            ) : data?.result?.length > 0 ? (
              data.result.map((booking) => {
                const statusDisplay = getStatusDisplay(booking.status);
                return (
                  <tr key={booking.bookingId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                      {booking.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {TYPE_OPTIONS.find((t) => t.value === booking.type)
                        ?.label ||
                        booking.type ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customerName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                      {formatCurrency(booking.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {METHOD_OPTIONS.find(
                        (m) => m.value === booking.paymentMethod
                      )?.label || booking.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.color}`}
                      >
                        {statusDisplay.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy đơn đặt chỗ nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}
