import { useState, useMemo, useEffect, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { STAR_RATINGS, VIETNAM_PROVINCES } from "../../utils/contain";

const HotelManagement = () => {
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStar, setFilterStar] = useState("");

  const [searchParams, setSearchParams] = useState({
    name: "",
    city: "",
    star: "",
    page: 1,
  });

  const [hotels, setHotels] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { callApi } = useApi();

  // Get unique cities and stars for filter options
  const cities = useMemo(() => {
    return VIETNAM_PROVINCES.sort();
  }, []);

  const stars = useMemo(() => {
    return STAR_RATINGS.filter((s) => s.value > 0)
      .map((s) => s.value)
      .sort((a, b) => b - a);
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      console.log({ searchParams });
      const params = new URLSearchParams({
        page: searchParams.page.toString(),
        limit: "10",
        ...(searchParams.name && { hotelName: searchParams.name }),
        ...(searchParams.city && { city: searchParams.city }),
        ...(searchParams.star && {
          hotelStar: STAR_RATINGS.find(
            (s) => String(s.value) === searchParams.star
          ).element,
        }),
      });

      console.log(searchParams);

      const response = await callApi(
        "get",
        `/hotels/search?${params.toString()}`
      );
      console.log({ response });
      if (response.data) {
        setPageData(response.data);
        setHotels(response.data.result || []);
      }
    } catch (err) {
      console.error("[v0] API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [searchParams]);

  // Delete hotel handler
  const handleDelete = async (hotelId) => {
    setDeleteConfirm(hotelId);
  };

  const confirmDelete = async (hotelId) => {
    setDeleteLoading(true);
    try {
      const response = await callApi("delete", `/hotels/${hotelId}`);
      alert(response.message);
      setDeleteConfirm(null);
      fetchHotels();
    } catch (err) {
      console.error("[v0] Delete Error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleResetFilters = () => {
    setFilterName("");
    setFilterCity("");
    setFilterStar("");
    setSearchParams({
      name: "",
      city: "",
      star: "",
      page: 1,
    });
  };

  const handleSearch = () => {
    setSearchParams({
      name: filterName,
      city: filterCity,
      star: filterStar,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const [loading, setLoading] = useState(false);

  const totalPages = pageData?.totalPages || 1;
  const totalElements = pageData?.totalElements || 0;
  const currentPageFromApi = pageData?.currentPages || searchParams.page;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Hotel Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and monitor all hotels in your system
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
              Total Hotels
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
              {hotels.length}
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

        {/* Filters Section */}
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
            {/* Search by name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Hotel Name
              </label>
              <input
                type="text"
                placeholder="Search hotel..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Filter by city */}
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

            {/* Filter by star */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Star Rating
              </label>
              <select
                value={filterStar}
                onChange={(e) => setFilterStar(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="">All Stars</option>
                {stars.map((star) => {
                  const rating = STAR_RATINGS.find((s) => s.value === star);
                  return (
                    <option key={star} value={star}>
                      {rating?.label || `${star} Stars`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Loading indicator */}
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
                    <span className="font-semibold">{totalElements}</span>{" "}
                    hotels
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        {!loading && hotels.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {hotels.map((hotel) => (
                <div
                  key={hotel.hotelId}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow ${
                    deleteLoading && deleteConfirm === hotel.hotelId
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  {/* Image */}
                  <div className="h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img
                      src={hotel.imageUrl || "/placeholder.svg"}
                      alt={hotel.hotelName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-2 flex-1">
                        {hotel.hotelName}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                        ID: {hotel.hotelId}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="mb-3">
                      <StarRating star={hotel.star} />
                    </div>

                    {/* City & Address */}
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          City:
                        </span>{" "}
                        {hotel.city}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Address:
                        </span>{" "}
                        {hotel.address}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {hotel.description}
                    </p>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(hotel.hotelId)}
                      disabled={deleteLoading}
                      className={`w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {deleteLoading && deleteConfirm === hotel.hotelId ? (
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
                          Delete Hotel
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
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
                hotels)
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, searchParams.page - 1))
                  }
                  disabled={searchParams.page === 1 || loading}
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

                    if (!isVisible && i > 0 && i < totalPages - 1) {
                      if (
                        i === 1 ||
                        (i > 1 &&
                          ![...Array(totalPages)]
                            .map((_, j) => j + 1)
                            .slice(0, i)
                            .some((p) => Math.abs(p - searchParams.page) <= 1))
                      ) {
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
                  disabled={searchParams.page === totalPages || loading}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
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
              Loading hotels...
            </p>
          </div>
        ) : (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No hotels found
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>

      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-700 transform transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Confirm Delete
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                Are you sure you want to delete this hotel?
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This action cannot be undone. The hotel will be permanently
                removed from the system.
              </p>
            </div>

            {/* Footer */}
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
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManagement;

const StarRating = ({ star }) => {
  const count = Number(STAR_RATINGS.find((s) => s.element === star)?.value);
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < count
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-300 text-gray-300"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
};
