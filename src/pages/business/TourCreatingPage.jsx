import { useState, useEffect } from "react";
import {
  GlobeAltIcon,
  CalendarDaysIcon,
  WalletIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  MinusCircleIcon,
  PlusIcon,
  PhotoIcon, // Thêm PhotoIcon cho phần hình ảnh
  XCircleIcon,
  ArrowLeftIcon, // Thêm XCircleIcon để xóa ảnh
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { VIETNAM_PROVINCES } from "../../utils/contain";
import { useApi } from "../../hooks/useApi";

// Định dạng tiền tệ VNĐ (Giữ nguyên)
const formatCurrencyVND = (amount) => {
  const number = Number(amount);
  if (isNaN(number)) return "0";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(number);
};

// Hàm định dạng ngày hôm nay (Giữ nguyên)
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Component chính
export const TourCreatingPage = () => {
  const { callApi } = useApi();
  const [formData, setFormData] = useState({
    tourName: "",
    tourCity: VIETNAM_PROVINCES[0],
    tourDescription: "",
    tourPrice: 100000,
    startDate: getTodayDate(),
    endDate: "",
    duration: 1,
    maxPeople: 1,
    tourImages: [], // Thêm mảng để lưu trữ các File ảnh
  });

  const [tourSchedule, setTourSchedule] = useState([
    { day: 1, title: "", description: "" },
  ]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Logic tự động cập nhật TourSchedule theo Duration (Giữ nguyên)
  useEffect(() => {
    const currentDuration = formData.duration || 1;
    const newSchedule = [];
    for (let i = 1; i <= currentDuration; i++) {
      const existingSchedule = tourSchedule.find((s) => s.day === i);
      newSchedule.push(
        existingSchedule || { day: i, title: "", description: "" }
      );
    }
    setTourSchedule(newSchedule);
  }, [formData.duration]);

  // 2. Logic tự động tính EndDate (Giữ nguyên)
  useEffect(() => {
    const { startDate, duration } = formData;
    const days = parseInt(duration) || 1;

    if (startDate && days > 0) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + days - 1);

      const yyyy = start.getFullYear();
      const mm = String(start.getMonth() + 1).padStart(2, "0");
      const dd = String(start.getDate()).padStart(2, "0");

      setFormData((prev) => ({
        ...prev,
        endDate: `${yyyy}-${mm}-${dd}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, endDate: "" }));
    }
  }, [formData.startDate, formData.duration]);

  // Hàm xử lý quay lại
  const handleGoBack = () => {
    // Sử dụng navigate(-1) để quay lại trang trước đó trong lịch sử trình duyệt
    navigate(-1);
  };

  // Xử lý thay đổi cho các trường thông thường (Giữ nguyên)
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "duration" || name === "maxPeople") {
      newValue = parseInt(value) || 0;
      if (newValue < 1) newValue = 1;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // 3. Logic xử lý thay đổi cho Giá Tour (Giữ nguyên)
  const handlePriceChange = (increment) => {
    setFormData((prev) => {
      const newPrice = (prev.tourPrice || 0) + increment;
      return { ...prev, tourPrice: Math.max(0, newPrice) };
    });
  };

  const handlePriceInput = (e) => {
    let rawValue = e.target.value.replace(/[^0-9]/g, "");
    let numericValue = parseInt(rawValue) || 0;
    setFormData((prev) => ({ ...prev, tourPrice: Math.max(0, numericValue) }));
  };

  // Xử lý thay đổi cho Lịch trình (Giữ nguyên)
  const handleScheduleChange = (index, name, value) => {
    const updatedSchedule = [...tourSchedule];
    updatedSchedule[index][name] = value;
    setTourSchedule(updatedSchedule);
  };

  // 4. Xử lý tải lên nhiều hình ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      tourImages: [...prev.tourImages, ...files],
    }));
  };

  // 5. Xóa một hình ảnh đã chọn
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tourImages: prev.tourImages.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Xử lý Submit (Đã cập nhật: bao gồm tourImages)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.tourName)
      newErrors.tourName = "Tên tour không được để trống.";
    if (!formData.tourCity)
      newErrors.tourCity = "Thành phố không được để trống.";
    if (!formData.tourDescription)
      newErrors.tourDescription = "Mô tả tour không được để trống.";
    if (formData.tourPrice <= 0)
      newErrors.tourPrice = "Giá tour phải lớn hơn 0.";
    if (formData.duration <= 0)
      newErrors.duration = "Thời lượng tour phải lớn hơn 0.";
    if (formData.maxPeople <= 0)
      newErrors.maxPeople = "Số lượng người tối đa phải lớn hơn 0.";
    if (formData.tourImages.length === 0)
      newErrors.tourImages = "Vui lòng tải lên ít nhất một hình ảnh cho tour.";

    // Validation cho lịch trình
    const scheduleErrors = tourSchedule.some(
      (s) => !s.title.trim() || !s.description.trim()
    );
    if (scheduleErrors) {
      newErrors.tourSchedule =
        "Tất cả các ngày trong lịch trình phải có tiêu đề và mô tả.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true); // <--- BẮT ĐẦU LOADING

      const finalData = {
        tourName: formData.tourName,
        tourCity: formData.tourCity,
        tourDescription: formData.tourDescription,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        maxPeople: formData.maxPeople,
        tourPrice: formData.tourPrice,
        tourSchedule,
      };
      console.log("Dữ liệu gửi đi:", finalData);

      // Sử dụng try...catch để xử lý lỗi và finally để tắt loading
      try {
        const data = new FormData();

        // Chuyển object finalData thành JSON string và gắn vào field "data"
        data.append(
          "data",
          new Blob(
            [
              JSON.stringify({
                ...finalData,
              }),
            ],
            { type: "application/json" }
          )
        );

        // Thêm tất cả ảnh
        formData.tourImages.forEach((file) => {
          data.append("images", file);
        });

        const response = await callApi("post", `tours/create`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 2. XỬ LÝ THÀNH CÔNG
        if (response.success) {
          // Giả định API trả về { success: true }
          alert("Tạo Tour thành công!");
          navigate(-1); // <--- CHUYỂN HƯỚNG VỀ TRANG TRƯỚC
        } else {
          // Xử lý lỗi từ server (nếu có)
          alert(`Lỗi tạo tour: ${response.message || "Lỗi không xác định"}`);
          console.error("API Error:", response.message);
        }
      } catch (error) {
        // 3. XỬ LÝ LỖI MẠNG/SERVER
        alert("Đã xảy ra lỗi khi kết nối hoặc xử lý dữ liệu.");
        console.error("Submission Error:", error);
      } finally {
        // 4. KẾT THÚC LOADING
        setIsLoading(false); // <--- KẾT THÚC LOADING
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 pb-4 mb-6 relative">
        <button
          onClick={handleGoBack}
          className="absolute top-0 left-0 flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition duration-150 p-2 rounded-lg -ml-3"
          title="Quay lại trang trước"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Quay lại</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
          <GlobeAltIcon className="w-8 h-8 mr-3 text-indigo-600" />
          Tạo Tour Mới
        </h1>
        <p className="text-gray-500 mt-1 text-center">
          Điền thông tin chi tiết và xây dựng lịch trình cho tour của bạn.
        </p>
      </header>

      {/* NÚT SUBMIT ĐƯỢC ĐƯA LÊN ĐẦU */}
      <div className="flex justify-end mb-8 sticky top-0 z-10 bg-gray-50/90 py-2 -mx-8 px-8 border-b border-gray-200">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading} // <--- VÔ HIỆU HÓA KHI ĐANG TẢI
          className={`flex items-center space-x-2 px-8 py-3 font-bold rounded-xl shadow-lg shadow-indigo-200 transition duration-150 text-lg transform focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 ${
            isLoading
              ? "bg-indigo-400 cursor-not-allowed" // Màu khi Loading
              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02]" // Màu bình thường
          }`}
        >
          {/* Hiển thị Icon Loading nếu đang tải */}
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          ) : (
            <GlobeAltIcon className="w-5 h-5" />
          )}

          <span>{isLoading ? "Đang tạo Tour..." : "Lưu & Tạo Tour"}</span>
        </button>
      </div>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <section className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-indigo-700 mb-5 flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2" />
            1. Thông tin chung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên Tour */}
            <div>
              <label
                htmlFor="tourName"
                className="block text-sm font-medium text-gray-700"
              >
                Tên Tour *
              </label>
              <input
                type="text"
                name="tourName"
                id="tourName"
                value={formData.tourName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ví dụ: Khám phá Vịnh Hạ Long 3 Ngày"
                required
              />
              {errors.tourName && (
                <p className="mt-1 text-sm text-red-600">{errors.tourName}</p>
              )}
            </div>

            {/* Thành phố */}
            <div>
              <label
                htmlFor="tourCity"
                className="block text-sm font-medium text-gray-700"
              >
                Thành phố/Địa điểm *
              </label>
              <div className="relative mt-1">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                  name="tourCity"
                  id="tourCity"
                  value={formData.tourCity}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-2.5 pl-10 focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                  required
                >
                  {VIETNAM_PROVINCES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {/* Icon mũi tên cho dropdown */}
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {errors.tourCity && (
                <p className="mt-1 text-sm text-red-600">{errors.tourCity}</p>
              )}
            </div>

            {/* GIÁ TOUR (Input Number với Step 100,000) */}
            {/* GIÁ TOUR (Input Number với Step 100,000) */}
            <div>
              <label
                htmlFor="tourPrice"
                className="block text-sm font-medium text-gray-700"
              >
                Giá Tour (VNĐ) *
              </label>
              <div className="relative mt-1 flex rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => handlePriceChange(-100000)}
                  className="flex items-center justify-center p-2 border border-r-0 border-gray-300 bg-gray-50 rounded-l-lg text-gray-600 hover:bg-gray-200 transition duration-150"
                >
                  <MinusCircleIcon className="h-5 w-5" />
                </button>

                <div className="relative flex-grow">
                  {/* Icon ví tiền ở bên trái */}
                  <WalletIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="tourPrice"
                    id="tourPrice"
                    // HIỂN THỊ GIÁ TRỊ ĐÃ ĐỊNH DẠNG (ví dụ: "100.000")
                    value={formatCurrencyVND(formData.tourPrice)
                      .replace("₫", "")
                      .trim()}
                    onChange={handlePriceInput}
                    // Thêm padding bên phải (pr-12) để chừa chỗ cho nhãn VNĐ
                    className="block w-full rounded-none border-gray-300 p-2.5 pl-10 pr-12 text-right focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="100,000"
                    required
                  />
                  {/* Nhãn VNĐ luôn hiển thị bên phải input */}
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                    VNĐ
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePriceChange(100000)}
                  className="flex items-center justify-center p-2 border border-l-0 border-gray-300 bg-gray-50 rounded-r-lg text-gray-600 hover:bg-gray-200 transition duration-150"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              {errors.tourPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.tourPrice}</p>
              )}
            </div>

            {/* Số lượng người tối đa */}
            <div>
              <label
                htmlFor="maxPeople"
                className="block text-sm font-medium text-gray-700"
              >
                Số lượng người tối đa *
              </label>
              <div className="relative mt-1">
                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="maxPeople"
                  id="maxPeople"
                  value={formData.maxPeople}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-2.5 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              {errors.maxPeople && (
                <p className="mt-1 text-sm text-red-600">{errors.maxPeople}</p>
              )}
            </div>
          </div>

          {/* Mô tả Tour */}
          <div className="mt-6">
            <label
              htmlFor="tourDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Mô tả Tour *
            </label>
            <textarea
              name="tourDescription"
              id="tourDescription"
              rows="4"
              value={formData.tourDescription}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Mô tả chi tiết về hành trình, điểm nổi bật..."
              required
            ></textarea>
            {errors.tourDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.tourDescription}
              </p>
            )}
          </div>
        </section>
        {/* Phần 2: Ngày và Thời lượng (Giữ nguyên) */}
        <section className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-indigo-700 mb-5 flex items-center">
            <CalendarDaysIcon className="w-5 h-5 mr-2" />
            2. Thời gian Tour
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thời lượng (Duration) */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Thời lượng (Ngày) *
              </label>
              <div className="relative mt-1">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-2.5 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-indigo-500">
                Lịch trình bên dưới sẽ tự động tạo {formData.duration} ngày.
              </p>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            {/* Ngày Bắt Đầu */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Ngày Bắt Đầu *
              </label>
              <div className="relative mt-1">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-2.5 pl-10 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Ngày Kết Thúc (Tự động tính) */}
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                Ngày Kết Thúc (Tự động) *
              </label>
              <div className="relative mt-1">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formData.endDate}
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-2.5 pl-10 bg-gray-100 cursor-not-allowed text-gray-500"
                  readOnly
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Được tính toán từ Ngày Bắt Đầu và Thời lượng.
              </p>
            </div>
          </div>
        </section>
        {/* Phần 4: Hình ảnh Tour (Mới) */}
        <section className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-indigo-700 mb-5 flex items-center">
            <PhotoIcon className="w-5 h-5 mr-2" />
            4. Hình ảnh Tour
          </h2>
          <p className="mb-4 text-gray-600">
            Tải lên các hình ảnh đẹp nhất của tour (có thể chọn nhiều ảnh).
          </p>

          <div className="flex items-center justify-center w-full mb-6">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-150"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Nhấn để tải lên</span> hoặc
                  kéo và thả
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG hoặc GIF (Tối đa: 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          {errors.tourImages && (
            <p className="mb-4 text-sm text-red-600">{errors.tourImages}</p>
          )}

          {/* Xem trước hình ảnh đã chọn */}
          {formData.tourImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-700 mb-3">
                Hình ảnh đã chọn:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {formData.tourImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Tour Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Xóa ảnh này"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        {/* Phần 3: Lịch Trình Tour (Giữ nguyên) */}
        <section className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-indigo-700 mb-5 flex items-center">
            <CalendarDaysIcon className="w-5 h-5 mr-2" />
            3. Lịch Trình Chi Tiết ({formData.duration} Ngày)
          </h2>
          <p className="mb-6 text-gray-600">
            Hãy mô tả chi tiết hoạt động của từng ngày. Lịch trình sẽ tự động
            thay đổi theo Thời lượng tour bạn đã chọn.
          </p>

          <div className="space-y-8">
            {tourSchedule.map((schedule, index) => (
              <div
                key={schedule.day}
                className={`p-5 rounded-lg border-l-4 ${
                  schedule.title.trim() && schedule.description.trim()
                    ? "border-green-500 bg-green-50/50"
                    : "border-yellow-500 bg-yellow-50/50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Ngày {schedule.day}
                  </h3>
                  <MinusCircleIcon
                    className="w-5 h-5 text-gray-300"
                    title="Đã bị khóa theo Thời lượng"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tiêu đề lịch trình */}
                  <div>
                    <label
                      htmlFor={`title-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tiêu đề hoạt động *
                    </label>
                    <input
                      type="text"
                      id={`title-${index}`}
                      value={schedule.title}
                      onChange={(e) =>
                        handleScheduleChange(index, "title", e.target.value)
                      }
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={`Ví dụ: Tham quan Vịnh, Ăn tối trên du thuyền...`}
                      required
                    />
                  </div>

                  {/* Mô tả lịch trình */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`description-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mô tả chi tiết *
                    </label>
                    <textarea
                      id={`description-${index}`}
                      rows="3"
                      value={schedule.description}
                      onChange={(e) =>
                        handleScheduleChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Mô tả cụ thể hoạt động, thời gian và địa điểm..."
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.tourSchedule && (
            <p className="mt-4 text-sm text-red-600">{errors.tourSchedule}</p>
          )}
        </section>
      </form>
    </div>
  );
};
