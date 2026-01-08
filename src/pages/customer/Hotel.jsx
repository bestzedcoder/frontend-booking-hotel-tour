// HotelSearchPage.jsx - Phiên bản Ultra-Premium Refined ✨ (Tích hợp API Mock)

import { useState, useEffect } from "react";
import { STAR_RATINGS, VIETNAM_PROVINCES } from "../../utils/contain";
import { useApi } from "../../hooks/useApi";
import { Link } from "react-router-dom";

const getStarIcon = (star) => {
  const starMap = {
    FIVE_STAR: 5,
    FOUR_STAR: 4,
    THREE_STAR: 3,
    TWO_STAR: 2,
    ONE_STAR: 1,
  };
  const starCount = starMap[star] || 3;
  return Array(starCount).fill("⭐").join("");
};

const StarRating = ({ star }) => (
  <div className="text-yellow-500 text-lg">{getStarIcon(star)}</div>
);

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    pageNumbers.push(1);
    if (startPage > 2) pageNumbers.push("...");
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-5 py-2 border border-gray-300 rounded-l-xl bg-white text-gray-700 font-semibold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Trước
      </button>

      {pageNumbers.map((number, index) =>
        number === "..." ? (
          <span key={index} className="px-5 py-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(number)}
            className={`
                            px-5 py-2 font-extrabold transition duration-200 shadow-sm
                            ${
                              number === currentPage
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-300/50"
                                : "bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
                            }
                        `}
          >
            {number}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-5 py-2 border border-gray-300 rounded-r-xl bg-white text-gray-700 font-semibold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sau →
      </button>
    </div>
  );
};

const SearchAndFilter = ({ searchParams, onParamsChange, onSearch }) => {
  const handleStarChange = (starValue) => {
    const starElement = STAR_RATINGS.find(
      (r) => r.value === starValue
    )?.element;
    onParamsChange({ ...searchParams, star: starElement });
  };

  const handleCityChange = (e) => {
    onParamsChange({ ...searchParams, city: e.target.value });
  };

  const handleNameChange = (e) => {
    onParamsChange({ ...searchParams, name: e.target.value });
  };

  const currentStarValue =
    STAR_RATINGS.find((r) => r.element === searchParams.star)?.value || 0;

  return (
    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-indigo-100 border border-indigo-50 mb-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-indigo-100 via-purple-50 to-yellow-50 pointer-events-none rounded-3xl"></div>

      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 relative tracking-tight">
        🔍 Tìm Kiếm Khách Sạn Cao Cấp
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 relative">
        <div className="flex-1">
          <label className="text-sm font-bold text-gray-600 uppercase block mb-2">
            Tỉnh/Thành
          </label>
          <div className="relative">
            <select
              value={searchParams.city ?? "Tất cả tỉnh thành"}
              onChange={handleCityChange}
              className="appearance-none w-full text-lg font-semibold text-gray-800 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-indigo-400 focus:border-indigo-400 bg-white shadow-inner transition-all duration-150"
            >
              {["Tất cả tỉnh thành", ...VIETNAM_PROVINCES].map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
              <svg className="fill-current h-6 w-6" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <label className="text-sm font-bold text-gray-600 uppercase block mb-2">
            Tên khách sạn
          </label>
          <input
            type="text"
            value={searchParams.name}
            onChange={handleNameChange}
            placeholder="Nhập tên hoặc khu vực..."
            className="w-full text-lg font-semibold text-gray-800 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-indigo-400 focus:border-indigo-400 shadow-inner transition-all duration-150"
          />
        </div>

        <div className="lg:self-end pt-0 lg:pt-8">
          <button
            onClick={onSearch}
            className="w-full lg:w-auto px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.05] shadow-lg shadow-indigo-400/50 tracking-wider"
          >
            TÌM
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 mt-4 relative">
        <h4 className="text-sm font-bold text-gray-600 uppercase mb-3">
          Hạng Sao Phổ Biến:
        </h4>
        <div className="flex flex-wrap gap-3">
          {STAR_RATINGS.map((rating) => (
            <button
              key={rating.value}
              onClick={() => handleStarChange(rating.value)}
              className={`px-4 py-2 text-sm font-extrabold rounded-full border-2 transition duration-200
                                ${
                                  currentStarValue === rating.value
                                    ? "bg-yellow-400 text-gray-900 border-yellow-500 shadow-md shadow-yellow-200"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-indigo-300"
                                }`}
            >
              {rating.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const HotelCardPremium = ({ hotel }) => (
  <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-xl hover:shadow-3xl transition duration-500 ease-in-out border border-gray-100 transform hover:-translate-y-1">
    <div className="w-full md:w-2/5 relative h-72 md:h-96 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
      <img
        src={hotel.imageUrl}
        alt={hotel.hotelName}
        className="w-full h-full object-cover transition duration-500 transform hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>

    <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
      <div className="flex-grow pr-4">
        <h3 className="text-3xl font-black text-gray-900 mb-2 hover:text-indigo-700 transition cursor-pointer">
          {hotel.hotelName}
        </h3>

        <div className="flex items-center space-x-2 mb-4">
          <StarRating star={hotel.star} />
          <span className="text-sm font-semibold text-gray-500">
            {hotel.star.replace("_", " ").toLowerCase()}
          </span>
        </div>

        <p className="text-base text-gray-600 flex items-center mt-1 mb-4 font-medium">
          <svg
            className="w-5 h-5 mr-2 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a6 6 0 00-6 6c0 4.17 6 11 6 11s6-6.83 6-11a6 6 0 00-6-6zm0 9a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
          {hotel.address}, <strong>{hotel.city}</strong>
        </p>

        <p className="text-base text-gray-700 leading-relaxed mb-5 border-l-4 border-yellow-400 pl-3 italic line-clamp-3">
          {hotel.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            🏊 Hồ bơi
          </span>
          <span className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            🌐 Wi-Fi
          </span>
          <span className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            🅿️ Bãi đỗ xe
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-end items-end pl-4 flex-shrink-0 mt-6">
        <Link
          to={`/client/hotels/${hotel.hotelId}/details`}
          className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg hover:from-rose-600 hover:to-red-700 transition duration-300 transform hover:scale-[1.05] text-lg tracking-wide text-center"
        >
          XEM CHI TIẾT
        </Link>
        <p className="text-xs text-gray-500 mt-3 italic">
          Chi tiết & Đặt phòng
        </p>
      </div>
    </div>
  </div>
);

const ITEMS_PER_PAGE = 5;

const HotelSearchPage = () => {
  const [searchParams, setSearchParams] = useState({
    city: "",
    name: "",
    star: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { callApi } = useApi();

  const fetchHotels = async (params, page) => {
    setIsLoading(true);
    console.log({ params });
    const { name, city, star } = params;

    const paramsUrl = new URLSearchParams({
      page,
      limit: ITEMS_PER_PAGE,
    });

    if (name) paramsUrl.append("hotelName", name);
    if (city) paramsUrl.append("city", city);
    if (star) paramsUrl.append("hotelStar", star);

    const response = await callApi(
      "get",
      `/hotels/search?${paramsUrl.toString()}`
    );
    if (!response.success) {
      alert(response.message);
      setIsLoading(false);
      return;
    }
    console.log({ response });
    setSearchResults(response.data.result);
    setTotalResults(response.data.totalElements);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHotels(searchParams, currentPage);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchHotels(searchParams, 1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchHotels(searchParams, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleParamsChange = (newParams) => {
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 md:px-8 py-12">
        <SearchAndFilter
          searchParams={searchParams}
          onParamsChange={handleParamsChange}
          onSearch={handleSearch}
        />

        <div className="mt-8">
          <p className="text-3xl font-extrabold text-gray-900 mb-8 pb-3 border-b-4 border-indigo-200 inline-block">
            Khám Phá Khách Sạn ({totalResults})
          </p>

          {isLoading && (
            <div className="text-center py-10 bg-white rounded-xl shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-indigo-700">
                Đang tìm kiếm khách sạn cao cấp...
              </p>
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="space-y-8">
              {searchResults.map((hotel) => (
                <HotelCardPremium key={hotel.hotelId} hotel={hotel} />
              ))}
            </div>
          )}

          {!isLoading && searchResults.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl shadow-md border-l-4 border-red-500">
              <p className="text-xl font-bold text-red-700 mb-2">
                Không tìm thấy khách sạn nào!
              </p>
              <p className="text-gray-600">
                Vui lòng thử điều chỉnh lại bộ lọc tìm kiếm của bạn.
              </p>
            </div>
          )}

          <Pagination
            totalItems={totalResults}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
};

export default HotelSearchPage;
