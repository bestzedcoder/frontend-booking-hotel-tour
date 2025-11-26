import { useState, useMemo, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { VIETNAM_PROVINCES } from "../../utils/contain";

const TourManagement = () => {
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterOwner, setFilterOwner] = useState("");

  const [searchParams, setSearchParams] = useState({
    tourName: "",
    tourCity: "",
    owner: "",
    page: 1,
  });

  const [tours, setTours] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const { callApi } = useApi();

  const cities = useMemo(() => {
    return VIETNAM_PROVINCES.sort();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: searchParams.page.toString(),
      limit: "10",
      ...(searchParams.tourName && { tourName: searchParams.tourName }),
      ...(searchParams.tourCity && { tourCity: searchParams.tourCity }),
      ...(searchParams.owner && { owner: searchParams.owner }),
    });

    console.log(searchParams);

    let response;
    try {
      response = await callApi("get", `/tours/admin?${params.toString()}`);

      if (!response.success) {
        alert(response.message || "Failed to fetch tours.");
        setLoading(false);
        return;
      }
      setPageData(response.data);
      setTours(response.data.result);
    } catch (error) {
      console.error("[TourManagement] Fetch Error:", error);
      alert("An error occurred while fetching tours.");
      setTours([]);
      setPageData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hàm xử lý mở modal xác nhận xóa
  const handleDelete = async (tourId) => {
    setDeleteConfirm(tourId);
  };

  // Hàm xử lý xác nhận xóa tour
  const confirmDelete = async (tourId) => {
    setDeleteLoading(true);
    try {
      // Giả định API endpoint để xóa tour
      const response = await callApi("delete", `/tours/${tourId}`);
      alert(response.message || "Tour deleted successfully!");
      setDeleteConfirm(null);
      fetchTours(); // Tải lại danh sách sau khi xóa
    } catch (err) {
      console.error("[v0] Delete Error:", err);
      alert("An error occurred while deleting the tour.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hàm xử lý hủy xóa tour
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Hàm xử lý đặt lại bộ lọc
  const handleResetFilters = () => {
    setFilterName("");
    setFilterCity("");
    setFilterOwner("");
    setSearchParams({
      tourName: "",
      tourCity: "",
      owner: "",
      page: 1,
    });
  };

  // Hàm xử lý tìm kiếm/lọc
  const handleSearch = () => {
    setSearchParams({
      tourName: filterName,
      tourCity: filterCity,
      owner: filterOwner,
      page: 1, // Luôn reset về trang 1 khi thực hiện tìm kiếm mới
    });
  };

  // Hàm xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const totalPages = pageData?.totalPages || 1;
  const totalElements = pageData?.totalElements || 0;
  const currentPageFromApi = pageData?.currentPages || searchParams.page;
  const isPreviousDisabled = searchParams.page === 1 || loading;
  const isNextDisabled = searchParams.page === totalPages || loading;

  // Hàm định dạng giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Giả định API trả về chuỗi ISO date (e.g., 'YYYY-MM-DD')
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Tour Management 🌎
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and monitor all tours in your system
          </p>
        </div>

        {/* --- Card thống kê --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
              Total Tours
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalElements}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
              Current Page Results
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {tours.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
              Current Page
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {currentPageFromApi} / {totalPages}
            </p>
          </div>
        </div>

        {/* --- Search & Filter --- */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Search & Filter
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
              <button
                onClick={handleResetFilters}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tour Name
              </label>
              <input
                type="text"
                placeholder="Search tour..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                City
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Owner
              </label>
              <input
                type="text"
                placeholder="Search by owner username..."
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex items-end">
              {loading ? (
                <div className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm text-blue-900 dark:text-blue-300">
                    Loading...
                  </span>
                </div>
              ) : (
                <div className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    Found:{" "}
                    <span className="font-semibold">{totalElements}</span> tours
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Tour List and Pagination --- */}
        {!loading && tours.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tours.map((tour) => (
                <div
                  key={tour.tourId}
                  className={`flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow ${
                    deleteLoading && deleteConfirm === tour.tourId
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  {/* Phần Ảnh */}
                  <div className="h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img
                      src={tour.tourImageUrl || "/placeholder.svg"}
                      alt={tour.tourName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Phần Nội dung và Nút */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Nội dung chính */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-2 flex-1">
                          {tour.tourName}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                          ID: {tour.tourId}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                        <p>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            City:
                          </span>{" "}
                          {tour.tourCity}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Duration:
                          </span>{" "}
                          {tour.tourDuration} days
                        </p>
                        <p>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Max People:
                          </span>{" "}
                          {tour.tourMaxPeople}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Dates:
                          </span>{" "}
                          {formatDate(tour.tourStart)} -{" "}
                          {formatDate(tour.tourEnd)}
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatPrice(tour.tourPrice)}
                        </p>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                        {tour.tourDescription}
                      </p>
                    </div>

                    {/* Nút Delete Tour */}
                    <button
                      onClick={() => handleDelete(tour.tourId)}
                      disabled={deleteLoading}
                      className={`w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 ${
                        deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {deleteLoading && deleteConfirm === tour.tourId ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete Tour
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Pagination --- */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing page{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentPageFromApi}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {totalPages}
                </span>{" "}
                (Total:{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {totalElements}
                </span>{" "}
                tours)
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, searchParams.page - 1))
                  }
                  disabled={isPreviousDisabled}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    const isVisible =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= searchParams.page - 1 &&
                        pageNumber <= searchParams.page + 1);

                    // Logic hiển thị dấu "..."
                    if (!isVisible && i > 0 && i < totalPages - 1) {
                      const showDotsBefore =
                        pageNumber === 2 && searchParams.page > 2;
                      const showDotsAfter =
                        pageNumber === totalPages - 1 &&
                        searchParams.page < totalPages - 1;

                      if (showDotsBefore || showDotsAfter) {
                        return (
                          <span
                            key={`dots-${i}`}
                            className="px-2 text-slate-500 dark:text-slate-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    if (!isVisible) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          searchParams.page === pageNumber
                            ? "bg-blue-600 text-white"
                            : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    handlePageChange(
                      Math.min(totalPages, searchParams.page + 1)
                    )
                  }
                  disabled={isNextDisabled}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* --- Loading State --- */
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <svg
              className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Loading tours...
            </p>
          </div>
        ) : (
          /* --- No Results State --- */
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <svg
              className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 00-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No tours found
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>

      {/* --- Delete Confirmation Modal --- */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-700 transform transition-all">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Confirm Delete Tour
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                Are you sure you want to **permanently delete** this tour (ID:{" "}
                {deleteConfirm})?
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This action cannot be undone. The tour will be removed from the
                system.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourManagement;
