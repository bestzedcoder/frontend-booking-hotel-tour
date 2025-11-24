import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilSquareIcon,
  GlobeAltIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { VIETNAM_PROVINCES } from "../../utils/contain";
import { useApi } from "../../hooks/useApi";

// --- Dữ liệu giả mô phỏng API ---
const mockTours = [
  {
    tourId: 1,
    tourName: "Khám phá Vịnh Hạ Long 3 Ngày",
    tourCity: "Hạ Long",
    tourStart: "2025-12-01",
    tourEnd: "2025-12-03",
    tourPrice: 8000000,
    tourDuration: 3,
    tourMaxPeople: 20,
  },
  {
    tourId: 2,
    tourName: "Tour ẩm thực Sài Gòn 1 Ngày",
    tourCity: "Hồ Chí Minh",
    tourStart: "2025-12-10",
    tourEnd: "2025-12-10",
    tourPrice: 1200000,
    tourDuration: 1,
    tourMaxPeople: 15,
  },
  {
    tourId: 3,
    tourName: "Du lịch văn hóa Cố đô Huế",
    tourCity: "Huế",
    tourStart: "2026-01-05",
    tourEnd: "2026-01-08",
    tourPrice: 6500000,
    tourDuration: 4,
    tourMaxPeople: 25,
  },
  {
    tourId: 4,
    tourName: "Trekking Fansipan 2 Ngày",
    tourCity: "Sa Pa",
    tourStart: "2025-11-25",
    tourEnd: "2025-11-26",
    tourPrice: 9000000,
    tourDuration: 2,
    tourMaxPeople: 10,
  },
  {
    tourId: 5,
    tourName: "Nghỉ dưỡng biển Nha Trang",
    tourCity: "Nha Trang",
    tourStart: "2026-02-14",
    tourEnd: "2026-02-18",
    tourPrice: 15000000,
    tourDuration: 5,
    tourMaxPeople: 30,
  },
  {
    tourId: 6,
    tourName: "Thám hiểm Đảo Phú Quốc",
    tourCity: "Phú Quốc",
    tourStart: "2026-03-01",
    tourEnd: "2026-03-04",
    tourPrice: 10500000,
    tourDuration: 4,
    tourMaxPeople: 22,
  },
  {
    tourId: 7,
    tourName: "Du lịch Miền Tây Sông Nước",
    tourCity: "Cần Thơ",
    tourStart: "2025-11-15",
    tourEnd: "2025-11-17",
    tourPrice: 4800000,
    tourDuration: 3,
    tourMaxPeople: 18,
  },
];

// Hàm format tiền tệ (giữ nguyên)
const formatCurrencyVND = (amount) => {
  const number = Number(amount);
  if (isNaN(number)) return "";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

// --- Component Modal Xác Nhận Xóa (Giữ nguyên) ---
const DeleteConfirmationModal = ({ tour, isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  // ... (JSX của Modal giữ nguyên) ...
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-start border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-red-600 flex items-center">
              <TrashIcon className="w-6 h-6 mr-2" />
              Xác Nhận Xóa Tour
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-700 mb-6 text-lg">
            Bạn **chắc chắn** muốn xóa mục này không?
            <br />
            <span className="mt-2 block text-sm font-semibold text-red-600">
              CẢNH BÁO: Hành động này không thể hoàn tác!
            </span>
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Xóa Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component Chính TourManagementPage ---
export const TourManagementPage = () => {
  // --- STATE DỮ LIỆU ---
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { callApi } = useApi();

  // --- STATE TÌM KIẾM (Cho các ô input, thay đổi theo từng phím gõ) ---
  const [searchParams, setSearchParams] = useState({
    tourName: "",
    tourCity: "",
    priceMin: "",
    priceMax: "",
    startDate: "",
    endDate: "",
  });

  // --- STATE TÌM KIẾM ĐÃ ÁP DỤNG (Chỉ thay đổi khi nhấn nút Tìm Kiếm) ---
  const [appliedSearchParams, setAppliedSearchParams] = useState({
    tourName: "",
    tourCity: "",
    priceMin: "",
    priceMax: "",
    startDate: "",
    endDate: "",
  });

  // --- STATE PHÂN TRANG (Đồng bộ với PageResponse) ---
  const [pagination, setPagination] = useState({
    page: 1, // currentPages
    limit: 5, // pageSizes
    totalItems: 0, // totalElements
    totalPages: 1, // totalPages
  });

  // --- STATE MODAL XÓA ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState(null);

  // --- HÀM XỬ LÝ ---
  const createQueryString = (params) => {
    const query = Object.keys(params)
      .filter(
        (key) =>
          params[key] !== "" &&
          params[key] !== null &&
          params[key] !== undefined
      )
      .map((key) => {
        // Đảm bảo mã hóa URL cho các giá trị (ví dụ: tên tour có dấu cách)
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      })
      .join("&");
    return query;
  };

  // useCallback: Chỉ gọi API khi tham số ĐÃ ÁP DỤNG hoặc phân trang thay đổi
  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // SỬ DỤNG appliedSearchParams VÀ pagination.page/limit
      const params = {
        ...appliedSearchParams,
        page: pagination.page,
        limit: pagination.limit,
      };
      const queryString = createQueryString(params);
      const response = await callApi("get", `tours/owner?${queryString}`);
      if (response.success) {
        setTours(response.data.result);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.totalElements,
          totalPages: response.data.totalPages,
          page: response.data.currentPages,
          limit: response.data.pageSizes,
        }));
      } else {
        setError(response.message || "Lỗi khi tải dữ liệu tour.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
      setTours([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    // Các tham số tìm kiếm đã áp dụng
    appliedSearchParams.tourName,
    appliedSearchParams.tourCity,
    appliedSearchParams.priceMin,
    appliedSearchParams.priceMax,
    // Không cần ngày tháng vì chưa dùng trong mock
  ]);

  // useEffect: Gọi API khi các dependency (tham số đã áp dụng hoặc trang) thay đổi
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    // Cập nhật state searchParams (chỉ thay đổi input)
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // 1. Reset trang về 1
    setPagination((prev) => ({ ...prev, page: 1 }));

    // 2. Cập nhật appliedSearchParams để kích hoạt fetchTours qua useEffect
    // Nếu page đã là 1, việc cập nhật này sẽ kích hoạt.
    // Nếu page khác 1, việc reset page về 1 sẽ kích hoạt.
    setAppliedSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      // Việc thay đổi pagination.page sẽ kích hoạt fetchTours qua useEffect
    }
  };

  const openDeleteModal = (tour) => {
    setTourToDelete(tour);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (tourToDelete) {
      const response = await callApi("delete", `tours/${tourToDelete.tourId}`);
      if (response.success) {
        fetchTours();
      }
      alert(response.message);
      setTourToDelete(null);
      setIsModalOpen(false);
    }
  };

  // --- TRÌNH BÀY JSX (Không thay đổi) ---
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {tourToDelete && (
        <DeleteConfirmationModal
          tour={tourToDelete}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Header và Nút Thêm Tour */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
          <GlobeAltIcon className="w-7 h-7 mr-3 text-green-600" />
          Quản Lý Tour Của Tôi (Đối tác Kinh doanh)
        </h1>
        <Link
          to="create"
          className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition duration-300 transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm Tour Mới
        </Link>
      </header>

      {/* --- Bộ Lọc Tìm Kiếm --- */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-xl border border-gray-100">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Bộ Lọc Tìm Kiếm
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Hàng 1: Tên Tour, Thành phố */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label
                htmlFor="tourName"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Tên Tour
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="tourName"
                  id="tourName"
                  value={searchParams.tourName}
                  onChange={handleSearchChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm sm:text-sm p-2 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Nhập tên tour..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="tourCity"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Thành Phố
              </label>
              <select
                name="tourCity"
                id="tourCity"
                value={searchParams.tourCity}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-300 shadow-sm sm:text-sm p-2.5 bg-white focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Tất cả Thành phố</option>
                {VIETNAM_PROVINCES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hàng 2: Giá Min/Max (VNĐ), Ngày Start/End */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2">
            {/* Giá Min (VNĐ) */}
            <div>
              <label
                htmlFor="priceMin"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Giá Min (VNĐ)
              </label>
              <input
                type="number"
                name="priceMin"
                id="priceMin"
                value={searchParams.priceMin}
                onChange={handleSearchChange}
                step="100000"
                className="w-full rounded-lg border border-gray-300 shadow-sm sm:text-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Từ 100,000"
              />
            </div>

            {/* Giá Max (VNĐ) */}
            <div>
              <label
                htmlFor="priceMax"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Giá Max (VNĐ)
              </label>
              <input
                type="number"
                name="priceMax"
                id="priceMax"
                value={searchParams.priceMax}
                onChange={handleSearchChange}
                step="100000"
                className="w-full rounded-lg border border-gray-300 shadow-sm sm:text-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Đến 100,000"
              />
            </div>

            {/* Ngày Bắt Đầu */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Ngày Bắt Đầu
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={searchParams.startDate}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-300 shadow-sm sm:text-sm p-2 bg-white focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Ngày Kết Thúc */}
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Ngày Kết Thúc
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={searchParams.endDate}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-300 shadow-sm sm:text-sm p-2 bg-white focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Nút Tìm Kiếm nằm cuối form */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150 text-base transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span>Tìm Kiếm</span>
            </button>
          </div>
        </form>
      </div>

      {/* --- Danh Sách Tour (Bảng - Hiển thị trạng thái) --- */}
      <div className="bg-white rounded-lg shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-indigo-600 flex items-center justify-center">
            <ArrowPathIcon className="w-6 h-6 mr-2 animate-spin" />
            Đang tải danh sách tour...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p className="font-semibold">Lỗi:</p>
            <p>{error}</p>
            <button
              onClick={fetchTours}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-5/12"
                  >
                    Tên Tour
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-2/12"
                  >
                    City
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12"
                  >
                    Bắt Đầu
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12"
                  >
                    Kết Thúc
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12"
                  >
                    Giá (VNĐ)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12"
                  >
                    Max People
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12"
                  >
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {tours.length > 0 ? (
                  tours.map((tour) => (
                    <tr
                      key={tour.tourId}
                      className="text-sm hover:bg-indigo-50/50 transition duration-100"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                        {tour.tourName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {tour.tourCity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-center">
                        {tour.tourStart}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-center">
                        {tour.tourEnd}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-700 text-right">
                        {formatCurrencyVND(tour.tourPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-center">
                        {tour.tourMaxPeople}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex space-x-1 justify-center items-center">
                          <Link
                            to={`${tour.tourId}\\details`}
                            className="p-1.5 rounded-full text-blue-500 bg-blue-100/70 hover:bg-blue-200 transition duration-150"
                            title="Chi tiết Tour"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(tour)}
                            className="p-1.5 rounded-full text-red-500 bg-red-100/70 hover:bg-red-200 transition duration-150"
                            title="Xóa Tour"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500 text-base"
                    >
                      Không tìm thấy tour nào theo tiêu chí tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân Trang */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 text-sm">
          <div className="text-gray-700">
            Hiển thị{" "}
            <span className="font-semibold">
              {/* Tính toán index bắt đầu: (page - 1) * limit + 1 */}
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            đến{" "}
            <span className="font-semibold">
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalItems
              )}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{pagination.totalItems}</span> kết
            quả
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="px-4 py-1.5 bg-green-500 text-white font-semibold rounded-lg shadow-sm">
              {/* currentPages */}
              {pagination.page}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={
                pagination.page === pagination.totalPages ||
                pagination.totalItems === 0
              }
              className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
