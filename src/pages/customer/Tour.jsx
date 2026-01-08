import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  DollarSign,
  Search,
  Clock,
  Users,
  ArrowRight,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { VIETNAM_PROVINCES } from "../../utils/contain";

const PAGE_LIMIT = 5;

const INITIAL_FILTERS = {
  name: "",
  city: "",
  startDate: "",
  endDate: "",
  minPrice: 0,
  maxPrice: 10000000,
  pageSize: PAGE_LIMIT,
};

const TourPage = () => {
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);

  const [searchFilters, setSearchFilters] = useState(INITIAL_FILTERS);
  const { callApi } = useApi();

  const fetchTours = useCallback(async (page, currentFilters) => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: page,
      limit: currentFilters.pageSize,
    });
    if (currentFilters.name) params.append("tourName", currentFilters.name);
    if (currentFilters.city) params.append("tourCity", currentFilters.city);
    if (currentFilters.startDate)
      params.append("startDate", currentFilters.startDate);
    if (currentFilters.endDate)
      params.append("endDate", currentFilters.endDate);

    params.append("priceMin", currentFilters.minPrice);
    params.append("priceMax", currentFilters.maxPrice);

    const response = await callApi("get", `tours?${params.toString()}`);
    if (!response.success) {
      alert(response.message);
      setTours([]);
      setTotalPages(0);
      setIsLoading(false);
    } else {
      setTimeout(() => {
        setTours(response.data.result);
        setCurrentPage(response.data.currentPages);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setIsLoading(false);
      }, 150);
    }
  }, []);

  useEffect(() => {
    fetchTours(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchTours]);

  const handleFilterChange = (e) => {
    const { name, value, type } = e.target;
    setDraftFilters((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchFilters(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setSearchFilters(INITIAL_FILTERS);
  };

  const handleViewDetail = (tourId) => {
    navigate(`/client/tours/${tourId}/details`);
  };

  const TourCard = ({ tour }) => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const formatDuration = (duration) => {
      return duration > 1 ? `${duration} Ngày` : `${duration} Ngày`;
    };

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row transform transition duration-300 hover:scale-[1.01] hover:shadow-xl">
        <div className="relative w-full md:w-1/3 h-48 md:h-auto flex-shrink-0">
          <img
            src={
              tour.tourImageUrl ||
              "https://via.placeholder.com/600x400?text=Tour+Image"
            }
            alt={tour.tourName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
              {tour.tourName}
            </h3>
            <div className="bg-red-600 text-white text-md font-bold px-3 py-1 rounded-full shadow-lg flex items-center ml-4">
              <DollarSign size={16} className="mr-1" />
              {formatCurrency(tour.tourPrice)}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {tour.tourDescription}
          </p>

          <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 border-t pt-3 flex-grow">
            <p className="flex items-center">
              <MapPin size={16} className="text-indigo-500 mr-2" />
              <span className="font-semibold">{tour.tourCity}</span>
            </p>
            <p className="flex items-center">
              <Clock size={16} className="text-amber-500 mr-2" />
              {formatDuration(tour.tourDuration)}
            </p>
            <p className="flex items-center col-span-2">
              <Calendar size={16} className="text-sky-500 mr-2" />
              <span className="font-medium">Khởi hành:</span> {tour.tourStart}{" "}
              <ArrowRight size={14} className="mx-2 text-gray-400" /> Kết thúc:{" "}
              {tour.tourEnd}
            </p>
            <p className="flex items-center">
              <Users size={16} className="text-green-500 mr-2" />
              Tối đa: {tour.tourMaxPeople} người
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleViewDetail(tour.tourId)}
              className="flex items-center justify-center bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 shadow-md hover:shadow-lg"
            >
              XEM CHI TIẾT
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = ({ totalPages, currentPage, setPage, totalElements }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-4 bg-white rounded-xl shadow-lg">
        <p className="text-sm text-gray-600 mb-3 sm:mb-0">
          Hiển thị kết quả:{" "}
          <span className="font-bold text-indigo-600">
            {(currentPage - 1) * searchFilters.pageSize + 1}
          </span>
          -{" "}
          <span className="font-bold text-indigo-600">
            {Math.min(currentPage * searchFilters.pageSize, totalElements)}
          </span>
          trên tổng số{" "}
          <span className="font-bold text-indigo-600">{totalElements}</span>{" "}
          Tour.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Trước
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setPage(number)}
              className={`px-3 py-1 text-sm rounded-lg font-semibold transition ${
                number === currentPage
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
          ✈️ Khám Phá Tour Du Lịch
        </h1>
        <p className="text-gray-500">
          Tìm kiếm chuyến đi hoàn hảo tiếp theo của bạn.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xl h-fit sticky top-4 border-t-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
            <Search size={24} className="mr-2 text-indigo-500" />
            Tìm kiếm & Lọc
          </h2>

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">
                Tên Tour / Điểm đến
              </label>
              <input
                type="text"
                name="name"
                value={draftFilters.name}
                onChange={handleFilterChange}
                placeholder="Ví dụ: Vịnh Hạ Long, Đà Lạt..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2 flex items-center">
                <MapPin size={18} className="mr-2 text-indigo-500" />
                Thành Phố Khởi hành/Đến
              </label>

              <div className="relative">
                <select
                  name="city"
                  value={draftFilters.city}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none pr-10 bg-white"
                >
                  <option value="">--- tất cả thành phố ---</option>
                  {VIETNAM_PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar size={18} className="mr-2 text-sky-500" /> Khoảng Thời
                Gian
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ngày Bắt Đầu
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={draftFilters.startDate}
                    onChange={handleFilterChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ngày Kết Thúc
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={draftFilters.endDate}
                    onChange={handleFilterChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                <DollarSign size={18} className="mr-2 text-red-500" /> Khoảng
                Giá
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tối Thiểu
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={draftFilters.minPrice}
                    onChange={handleFilterChange}
                    min="0"
                    step="100000"
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tối Đa
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={draftFilters.maxPrice}
                    onChange={handleFilterChange}
                    max="100000000"
                    step="1000000"
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
              >
                <Search size={20} className="mr-2" /> Áp Dụng Bộ Lọc
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center py-2 px-4 text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300"
              >
                <X size={20} className="mr-1" /> Xóa Bộ Lọc
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Khám Phá Tour Du Lịch (
            <span className="text-indigo-600">
              {isLoading ? "..." : totalElements}
            </span>
            )
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="ml-3 text-lg font-medium text-indigo-600">
                Đang tải dữ liệu tour...
              </p>
            </div>
          ) : (
            <>
              {tours.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {tours.map((tour) => (
                      <TourCard key={tour.tourId} tour={tour} />
                    ))}
                  </div>

                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setPage={setCurrentPage}
                    totalElements={totalElements}
                  />
                </>
              ) : (
                <div className="text-center p-12 bg-white rounded-xl shadow-lg">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Không tìm thấy Tour nào
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Vui lòng thử điều chỉnh lại các tiêu chí tìm kiếm của bạn.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourPage;
