import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Hotel,
  MapPin,
  Plus,
  Search,
  Star,
  Trash2,
  X,
  UploadCloud,
} from "lucide-react";

import { STAR_RATINGS, VIETNAM_PROVINCES } from "../../utils/contain";
import { useApi } from "../../hooks/useApi";
import { Link } from "react-router-dom";

const PAGE_LIMIT = 10;

// --- SIMULATE API CALL ---

/**
 * Mô phỏng việc gọi API searchHotels trả về PageResponse<T>
 */

// Custom Alert/Confirmation - Thay thế cho window.alert/confirm
const handleAlert = (message) => console.log(message);

// --- CREATE HOTEL MODAL COMPONENT ---

const CreateHotelModal = ({
  isOpen,
  onClose,
  onSave,
  provinces,
  starRatings,
  callApi,
}) => {
  const initialHotelState = {
    hotelName: "",
    hotelAddress: "",
    hotelCity: "",
    hotelStar: 0,
    hotelDescription: "",
    images: [],
  };
  const [isLoading, setIsLoading] = useState(false);
  const [hotel, setHotel] = useState(initialHotelState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset form state and errors when modal is opened/closed
    if (!isOpen) {
      setHotel(initialHotelState);
      setErrors({});
    }
  }, [isOpen]);

  // Hàm Validation (Kiểm tra dữ liệu đầu vào)
  const validate = () => {
    let newErrors = {};
    const descLength = hotel.hotelDescription.length;

    // hotelName (NotBlank)
    if (!hotel.hotelName.trim())
      newErrors.hotelName = "Tên khách sạn không được để trống.";

    // hotelAddress (NotBlank)
    if (!hotel.hotelAddress.trim())
      newErrors.hotelAddress = "Địa chỉ không được để trống.";

    // hotelCity (NotBlank)
    if (!hotel.hotelCity)
      newErrors.hotelCity = "Thành phố không được để trống.";

    // hotelStar (NotNull - Dùng 0 làm giá trị mặc định "chưa chọn")
    if (hotel.hotelStar === 0)
      newErrors.hotelStar = "Hạng sao không được để trống.";

    // hotelDescription (NotBlank & Size Max 1000)
    if (!hotel.hotelDescription.trim()) {
      newErrors.hotelDescription = "Mô tả không được để trống.";
    } else if (descLength > 1000) {
      newErrors.hotelDescription = `Mô tả tối đa 1000 ký tự (hiện tại: ${descLength}).`;
    }

    // images (Multiple, check if at least one selected)
    if (hotel.images.length === 0)
      newErrors.images = "Vui lòng chọn ít nhất một hình ảnh.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHotel((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStarChange = (e) => {
    const value = parseInt(e.target.value);
    setHotel((prev) => ({ ...prev, hotelStar: value }));
    setErrors((prev) => ({ ...prev, hotelStar: "" }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;

    setHotel((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      const formData = new FormData();

      // Chuyển object hotelData thành JSON string và gắn vào field "data"
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              hotelName: hotel.hotelName,
              hotelAddress: hotel.hotelAddress,
              hotelCity: hotel.hotelCity,
              hotelStar: STAR_RATINGS[hotel.hotelStar].element,
              hotelDescription: hotel.hotelDescription,
            }),
          ],
          { type: "application/json" }
        )
      );

      // Thêm tất cả ảnh
      hotel.images.forEach((file) => {
        formData.append("images", file); // backend nhận MultipartFile[]
      });

      // Gọi API
      const response = await callApi("post", "/hotels/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!response.success) {
        alert(response.message);
        setIsLoading(false);
        return;
      }
      alert(response.message);
      setIsLoading(false);
      onSave(hotel);
    }
  };

  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-6 border-b border-gray-100 bg-green-50 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-green-700 flex items-center">
            <Plus className="w-6 h-6 mr-2" /> Tạo Khách Sạn Mới
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotel Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Khách Sạn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hotelName"
                value={hotel.hotelName}
                onChange={handleChange}
                placeholder="Ví dụ: Khách Sạn Nguyệt Quế"
                className={`w-full p-3 border ${
                  errors.hotelName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-green-500 focus:border-green-500 transition`}
              />
              {errors.hotelName && (
                <p className="text-xs text-red-500 mt-1">{errors.hotelName}</p>
              )}
            </div>

            {/* Hotel Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa Chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hotelAddress"
                value={hotel.hotelAddress}
                onChange={handleChange}
                placeholder="Ví dụ: 100/1 Võ Nguyên Giáp, Quận Sơn Trà"
                className={`w-full p-3 border ${
                  errors.hotelAddress ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-green-500 focus:border-green-500 transition`}
              />
              {errors.hotelAddress && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.hotelAddress}
                </p>
              )}
            </div>

            {/* Hotel City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thành Phố <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="hotelCity"
                  value={hotel.hotelCity}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.hotelCity ? "border-red-500" : "border-gray-300"
                  } rounded-lg appearance-none bg-white focus:ring-green-500 focus:border-green-500 transition`}
                >
                  <option value="">--- Chọn Thành phố ---</option>
                  {provinces.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              </div>
              {errors.hotelCity && (
                <p className="text-xs text-red-500 mt-1">{errors.hotelCity}</p>
              )}
            </div>

            {/* Hotel Star */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạng Sao <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="hotelStar"
                  value={hotel.hotelStar}
                  onChange={handleStarChange}
                  className={`w-full p-3 border ${
                    errors.hotelStar ? "border-red-500" : "border-gray-300"
                  } rounded-lg appearance-none bg-white focus:ring-green-500 focus:border-green-500 transition`}
                >
                  <option value="">--- Chọn Hạng Sao ---</option>
                  {starRatings.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              </div>
              {errors.hotelStar && (
                <p className="text-xs text-red-500 mt-1">{errors.hotelStar}</p>
              )}
            </div>
          </div>

          {/* Hotel Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô Tả Khách Sạn ({hotel.hotelDescription.length}/1000){" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="hotelDescription"
              value={hotel.hotelDescription}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              placeholder="Nhập mô tả chi tiết về khách sạn, dịch vụ và tiện ích nổi bật (tối đa 1000 ký tự)."
              className={`w-full p-3 border ${
                errors.hotelDescription ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-green-500 focus:border-green-500 transition resize-none`}
            />
            {errors.hotelDescription && (
              <p className="text-xs text-red-500 mt-1">
                {errors.hotelDescription}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="border p-4 rounded-xl border-dashed border-gray-300 hover:border-green-500 transition duration-200">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <UploadCloud className="w-5 h-5 mr-2 text-green-600" />
              Hình Ảnh Khách Sạn (Chọn nhiều ảnh){" "}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {errors.images && (
              <p className="text-xs text-red-500 mt-1">{errors.images}</p>
            )}

            {hotel.images.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Đã chọn: <strong>{hotel.images.length}</strong> file
              </p>
            )}
          </div>
        </form>

        <footer className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang lưu...
              </span>
            ) : (
              "Lưu Khách Sạn"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const HotelManagementPage = () => {
  // State 1: Input của người dùng (chưa thực hiện tìm kiếm)
  const [filterName, setFilterName] = useState("");
  const [filterStars, setFilterStars] = useState(0);
  const [filterCity, setFilterCity] = useState("");

  // State 2: Tham số tìm kiếm chính thức (chỉ thay đổi khi nhấn Search)
  const [searchParams, setSearchParams] = useState({
    name: "",
    stars: 0,
    city: "",
    page: 1,
  });

  // State 3: Phân trang và kết quả
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hotelData, setHotelData] = useState({
    currentPages: 1,
    success: true,
    message: "",
    pageSizes: PAGE_LIMIT,
    totalPages: 0,
    totalElements: 0,
    result: [],
  });

  const { callApi } = useApi();

  const fetchHotels = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      limit: PAGE_LIMIT,
    });

    if (filterName) params.append("hotelName", filterName);
    if (filterCity) params.append("city", filterCity);
    if (filterStars)
      params.append("hotelStar", STAR_RATINGS[filterStars].element);

    const response = await callApi("get", `/hotels?${params.toString()}`);
    if (!response.success) {
      alert(response.message);
      setLoading(false);
      return;
    }
    setHotelData({ ...response?.data });
    setLoading(false);
  };

  // State 4: Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIC TÌM KIẾM VÀ PHÂN TRANG ---

  // Hàm kích hoạt tìm kiếm mới
  const handleSearch = () => {
    // 1. Cập nhật tham số tìm kiếm chính thức từ input
    setSearchParams({
      name: filterName,
      stars: filterStars,
      city: filterCity,
      page: 1,
    });
    // 2. Luôn reset về trang 1 khi thực hiện tìm kiếm mới
    setCurrentPage(1);
  };

  // useEffect để tự động fetch data khi searchParams hoặc currentPage thay đổi
  useEffect(() => {
    // Ngăn fetch khi đang tải
    if (loading) return;
    fetchHotels();
  }, [searchParams]);

  // Hành động CRUD mock
  const handleAdd = () => setIsModalOpen(true);

  // Xử lý lưu dữ liệu từ Modal (Mô phỏng API POST thành công)
  const handleSaveHotel = (newHotelData) => {
    handleAlert(`Đã thêm thành công Khách sạn mới: ${newHotelData.hotelName}.`);

    setIsModalOpen(false);
    handleSearch();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa Khách sạn ID: ${id}?`
    );
    if (!confirmed) return; // nếu user nhấn Cancel thì dừng
    // Thực hiện xóa
    const response = await callApi("delete", `/hotels/${id}`);
    if (!response.success) {
      alert(`Xóa thất bại: ${response.message}`);
      return;
    }
    fetchHotels();
    alert("Xóa khách sạn thành công!");
    handleAlert(`Yêu cầu xác nhận xóa Khách sạn ID: ${id}.`);
  };

  // --- UI COMPONENTS ---

  const PaginationControls = () => (
    <div className="flex flex-col md:flex-row justify-between items-center px-4 py-3 bg-white border-t rounded-b-xl">
      <p className="text-sm text-gray-700 mb-2 md:mb-0">
        Hiển thị{" "}
        <span className="font-medium">
          {hotelData.totalElements === 0
            ? 0
            : (currentPage - 1) * PAGE_LIMIT + 1}
        </span>{" "}
        đến{" "}
        <span className="font-medium">
          {Math.min(currentPage * PAGE_LIMIT, hotelData.totalElements)}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-medium">{hotelData.totalElements}</span> kết quả
      </p>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setCurrentPage((prev) => Math.max(1, prev - 1));
            setSearchParams({ ...searchParams, page, currentPage });
          }}
          disabled={currentPage <= 1 || loading}
          className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-1">
          {/* Hiển thị trang hiện tại và tổng số trang */}
          <span className="px-3 py-2 bg-green-500 text-white rounded-lg font-semibold">
            {currentPage}
          </span>
          <span className="text-gray-600">/</span>
          <span className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700">
            {hotelData.totalPages}
          </span>
        </div>
        <button
          onClick={() => {
            setCurrentPage((prev) => Math.min(hotelData.totalPages, prev + 1));
            setSearchParams({ ...searchParams, page: currentPage });
          }}
          disabled={
            currentPage >= hotelData.totalPages ||
            loading ||
            hotelData.totalPages === 0
          }
          className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className=" p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      {/* 1. Header & Nút Thêm Mới */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
          <Hotel className="w-7 h-7 mr-3 text-green-600" />
          Quản Lý Khách Sạn Của Tôi (Đối tác Kinh doanh)
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition duration-300 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm Khách Sạn
        </button>
      </header>

      {/* 2. Thanh Tìm Kiếm và Bộ Lọc */}
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Bộ Lọc Tìm Kiếm
        </h2>
        <div className="grid md:grid-cols-4 gap-5 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-md">
          {/* Lọc theo Tên Khách Sạn */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Tên Khách Sạn
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập tên khách sạn..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              />
            </div>
          </div>

          {/* Lọc theo Số Sao */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Số Sao
            </label>
            <div className="relative">
              <select
                value={filterStars}
                onChange={(e) => setFilterStars(parseInt(e.target.value))}
                className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
              >
                <option value={0}>Tất cả Sao</option>
                {STAR_RATINGS.filter((s) => s.value > 0).map((star) => (
                  <option key={star.value} value={star.value}>
                    {star.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Lọc theo Thành phố */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Thành Phố
            </label>
            <div className="relative">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full py-2.5 pl-3 pr-8 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
              >
                <option value="">Tất cả Thành phố</option>
                {VIETNAM_PROVINCES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Nút Tìm Kiếm */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center justify-center w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 active:scale-95 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? "Đang tải..." : "Tìm kiếm"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bảng Hiển Thị Kết Quả */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-10 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
            <span className="mt-4 text-lg font-semibold text-green-700">
              Đang tải dữ liệu...
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Tên Khách Sạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                  Địa Chỉ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thành Phố
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sao
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[300px]">
                  Mô Tả Ngắn
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Hành Động
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {hotelData.result.length > 0 ? (
                hotelData.result.map((hotel) => {
                  const starCount =
                    STAR_RATINGS.find((s) => s.element === hotel.star)?.value ||
                    0;

                  return (
                    <tr
                      key={hotel.hotelId}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      {/* Tên khách sạn */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {hotel.hotelName}
                      </td>

                      {/* Địa chỉ */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 h-full">
                        <div className="flex items-center gap-1 h-full">
                          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="truncate">{hotel.address}</span>
                        </div>
                      </td>

                      {/* Thành phố */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {hotel.city}
                      </td>

                      {/* Hạng sao */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm h-full">
                        <div className="flex items-center justify-center h-full">
                          {Array(starCount)
                            .fill()
                            .map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-0.5"
                              />
                            ))}
                        </div>
                      </td>

                      {/* Mô tả */}
                      <td
                        className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                        title={hotel.description}
                      >
                        {hotel.description}
                      </td>

                      {/* Hành động */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center justify-center gap-2">
                        <Link
                          to={`/business/my-hotels/${hotel.hotelId}/details`}
                          title="Chi tiết"
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition inline-flex"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(hotel.hotelId)}
                          title="Xóa"
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    {loading
                      ? "Đang tìm kiếm..."
                      : "Không tìm thấy khách sạn nào phù hợp với tiêu chí tìm kiếm."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Bộ Điều Khiển Phân Trang */}
        {/* Chỉ hiển thị nếu có dữ liệu */}
        {hotelData.totalElements > 0 && <PaginationControls />}
      </div>

      {/* 5. Create Hotel Modal */}
      <CreateHotelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHotel}
        provinces={VIETNAM_PROVINCES}
        starRatings={STAR_RATINGS}
        callApi={callApi}
      />
    </div>
  );
};

export default HotelManagementPage;
