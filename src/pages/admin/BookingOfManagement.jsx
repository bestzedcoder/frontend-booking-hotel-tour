import { useState, useCallback, useMemo } from "react";
import {
  Search,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
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

export const BookingOfManagement = () => {
  const { callApi } = useApi();

  const [originalData, setOriginalData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearched, setIsSearched] = useState(false);

  const [uiFilters, setUiFilters] = useState({
    page: 1,
    limit: 10,
    status: null,
    booking_type: null,
    payment_method: null,
    ownerUsername: "",
  });

  const [searchOwnerUsername, setSearchOwnerUsername] = useState("");

  const { displayedData, totalElements, totalPages, currentPages } =
    useMemo(() => {
      let filtered = originalData;
      const { status, booking_type, payment_method, page, limit } = uiFilters;

      if (status) {
        filtered = filtered.filter((booking) => booking.status === status);
      }

      if (booking_type) {
        filtered = filtered.filter((booking) => booking.type === booking_type);
      }

      if (payment_method) {
        filtered = filtered.filter(
          (booking) => booking.paymentMethod === payment_method
        );
      }

      const count = filtered.length;
      const totalPgs = Math.ceil(count / limit);
      const currentPageIndex = page > totalPgs ? totalPgs || 1 : page;

      const startIndex = (currentPageIndex - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filtered.slice(startIndex, endIndex);

      return {
        displayedData: paginatedData,
        totalElements: count,
        totalPages: totalPgs,
        currentPages: currentPageIndex,
      };
    }, [originalData, uiFilters]);

  const fetchBookings = useCallback(
    async (username) => {
      if (!username) return;

      setLoading(true);
      setError(null);
      setOriginalData([]);
      setIsSearched(false);

      try {
        const response = await callApi(
          "get",
          `bookings/by-admin/business?business=${username}`
        );

        const bookings = response.data.result || response.data;

        setOriginalData(bookings);
        setIsSearched(true);

        setUiFilters((prev) => ({
          ...prev,
          ownerUsername: username,
          page: 1,
          limit: prev.limit,
        }));
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(`Không thể tải dữ liệu đặt chỗ cho Owner "${username}".`);
        setOriginalData([]);
        setIsSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  const handleFilterSelectChange = (field, value) => {
    setUiFilters((prev) => ({
      ...prev,
      [field]: value || null,
      page: 1,
    }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setUiFilters((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const username = searchOwnerUsername.trim();
    if (!username) {
      setError("Vui lòng nhập Username của Owner để tìm kiếm.");
      setOriginalData([]);
      setUiFilters((prev) => ({ ...prev, ownerUsername: "" }));
      setIsSearched(true);
      return;
    }

    fetchBookings(username);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setUiFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleClearFilters = () => {
    setOriginalData([]);
    setSearchOwnerUsername("");
    setUiFilters({
      page: 1,
      limit: 10,
      status: null,
      booking_type: null,
      payment_method: null,
      ownerUsername: "",
    });
    setError(null);
    setIsSearched(false);
  };

  const renderPagination = () => {
    if (!originalData.length || totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="text-sm text-gray-600">
          Hiển thị{" "}
          <span className="font-semibold text-gray-900">
            {displayedData.length}
          </span>{" "}
          / <span className="font-semibold text-gray-900">{totalElements}</span>{" "}
          đơn đặt chỗ (của Owner **{uiFilters.ownerUsername}**).
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPages - 1)}
            disabled={currentPages === 1 || loading}
            className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="px-3 py-1 text-sm font-medium text-gray-700">
            Trang {currentPages} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPages + 1)}
            disabled={currentPages === totalPages || loading}
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
            value={uiFilters.limit}
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserCheck size={28} className="text-green-600" /> Quản lý Đơn đặt chỗ
        theo Owner
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-end"
        >
          <div className="lg:col-span-2">
            <label
              htmlFor="owner-username"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Username Owner (Bắt buộc)
            </label>
            <div className="flex">
              <input
                type="text"
                id="owner-username"
                value={searchOwnerUsername}
                onChange={(e) => setSearchOwnerUsername(e.target.value)}
                className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Nhập username của Owner..."
                disabled={loading}
              />
              <button
                type="submit"
                className="flex items-center justify-center h-9 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <Search size={16} className="mr-1" /> Tìm
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={uiFilters.status || ""}
              onChange={(e) =>
                handleFilterSelectChange("status", e.target.value)
              }
              className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={!originalData.length || loading}
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
              value={uiFilters.booking_type || ""}
              onChange={(e) =>
                handleFilterSelectChange("booking_type", e.target.value)
              }
              className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={!originalData.length || loading}
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
              value={uiFilters.payment_method || ""}
              onChange={(e) =>
                handleFilterSelectChange("payment_method", e.target.value)
              }
              className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={!originalData.length || loading}
            >
              <option value="">-- Phương thức --</option>
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
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
            ) : isSearched && !originalData.length && !error ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Owner **{uiFilters.ownerUsername}** không có đơn đặt chỗ nào.
                </td>
              </tr>
            ) : displayedData.length > 0 ? (
              displayedData.map((booking) => {
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
                  Vui lòng nhập **Username Owner** và ấn tìm kiếm để tải dữ
                  liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
};
