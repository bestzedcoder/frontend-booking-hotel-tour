import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { VIETNAM_PROVINCES } from "../../utils/contain";

const formatCurrencyVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const SpinnerIcon = (props) => <ArrowPathIcon {...props} />;

const initialTourData = {
  tourId: null,
  tourName: "",
  tourDescription: "",
  tourCity: "",
  tourPrice: 0,
  startDate: "",
  endDate: "",
  duration: 0,
  maxPeople: 0,
  imageTourUrls: [],
  tourSchedules: [],
};

export const TourDetailsPage = () => {
  const { id } = useParams();
  const tourId = id;
  const { callApi } = useApi();
  const navigate = useNavigate();

  const [tourData, setTourData] = useState(initialTourData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [imageNewFiles, setImageNewFiles] = useState([]);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  const [isEditingSchedule, setIsEditingSchedule] = useState({});
  const [editScheduleData, setEditScheduleData] = useState({});
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState({});

  const fetchTourDetails = useCallback(async () => {
    if (!tourId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await callApi("get", `tours/${tourId}/details`);
      if (response && response.success) {
        setTourData(response.data);
        setEditFormData(response.data);
        setImageNewFiles([]);
      } else {
        setError(response?.message || "Không tìm thấy thông tin tour.");
      }
    } catch (err) {
      setError("Lỗi kết nối server hoặc tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [tourId, callApi]);

  useEffect(() => {
    if (tourId) {
      fetchTourDetails();
    }
  }, [fetchTourDetails, tourId]);

  if (isLoading)
    return (
      <div className="p-8 text-center text-indigo-600">
        Đang tải chi tiết Tour...
      </div>
    );
  if (error)
    return <div className="p-8 text-center text-red-600">Lỗi: {error}</div>;
  if (!tourData.tourId)
    return (
      <div className="p-8 text-center text-gray-500">
        Không có dữ liệu tour.
      </div>
    );

  const handleStartEditInfo = () => {
    setIsEditingInfo(true);
    setEditFormData(tourData);
    setImageNewFiles([]);
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
    setEditFormData(tourData);
    setImageNewFiles([]);
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    const processedValue =
      name === "tourPrice" || name === "maxPeople"
        ? value === ""
          ? ""
          : Number(value)
        : value;
    setEditFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleRemoveOldImage = (urlToRemove) => {
    setEditFormData((prev) => ({
      ...prev,
      imageTourUrls: prev.imageTourUrls.filter((url) => url !== urlToRemove),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageNewFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setImageNewFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleConfirmEditInfo = async () => {
    const totalImages =
      editFormData.imageTourUrls.length + imageNewFiles.length;
    if (totalImages === 0) {
      alert("Vui lòng giữ lại ít nhất một hình ảnh (hoặc thêm ảnh mới).");
      return;
    }

    if (
      !editFormData.tourName.trim() ||
      !editFormData.tourCity.trim() ||
      !editFormData.tourDescription.trim() ||
      !editFormData.tourPrice ||
      editFormData.maxPeople < 1
    ) {
      alert("Vui lòng điền đầy đủ và chính xác các thông tin cơ bản của Tour.");
      return;
    }

    setIsUpdatingInfo(true);

    const data = new FormData();
    const updateRequest = {
      tourName: editFormData.tourName,
      tourCity: editFormData.tourCity,
      tourDescription: editFormData.tourDescription,
      tourPrice: Number(editFormData.tourPrice),
      maxPeople: Number(editFormData.maxPeople),
      imageOlds: editFormData.imageTourUrls,
    };

    data.append(
      "data",
      new Blob([JSON.stringify(updateRequest)], { type: "application/json" })
    );
    imageNewFiles.forEach((file) => {
      data.append("images", file);
    });

    try {
      const response = await callApi("put", `tours/${tourId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.success) {
        alert("Cập nhật thông tin Tour thành công!");
        setIsEditingInfo(false);
        fetchTourDetails();
      } else {
        alert(`Lỗi: ${response.message || "Không thể cập nhật thông tin."}`);
      }
    } catch (err) {
      alert("Lỗi kết nối server khi cập nhật.");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleStartEditSchedule = (schedule) => {
    setIsEditingSchedule((prev) => ({
      ...prev,
      [schedule.tourScheduleId]: true,
    }));
    setEditScheduleData((prev) => ({
      ...prev,
      [schedule.tourScheduleId]: {
        title: schedule.title,
        description: schedule.description,
      },
    }));
  };

  const handleCancelEditSchedule = (scheduleId) => {
    setIsEditingSchedule((prev) => ({ ...prev, [scheduleId]: false }));
    setEditScheduleData((prev) => {
      const newState = { ...prev };
      delete newState[scheduleId];
      return newState;
    });
  };

  const handleScheduleInputChange = (scheduleId, name, value) => {
    setEditScheduleData((prev) => ({
      ...prev,
      [scheduleId]: { ...prev[scheduleId], [name]: value },
    }));
  };

  const handleConfirmEditSchedule = async (scheduleId) => {
    const scheduleData = editScheduleData[scheduleId];
    if (!scheduleData.title.trim() || !scheduleData.description.trim()) {
      alert("Tiêu đề và mô tả lịch trình không được để trống.");
      return;
    }

    setIsUpdatingSchedule((prev) => ({ ...prev, [scheduleId]: true }));

    try {
      const updateRequest = {
        title: scheduleData.title,
        description: scheduleData.description,
      };

      const scheduleIndex = tourData.tourSchedules.findIndex(
        (s) => s.tourScheduleId === scheduleId
      );
      const dayNumber = scheduleIndex !== -1 ? scheduleIndex + 1 : "N/A";

      const response = await callApi(
        "put",
        `tours/${tourId}/schedule/${scheduleId}`,
        updateRequest
      );

      if (response.success) {
        alert(`Cập nhật lịch trình Ngày ${dayNumber} thành công!`);
        handleCancelEditSchedule(scheduleId);
        fetchTourDetails();
      } else {
        alert(`Lỗi: ${response.message || "Không thể cập nhật lịch trình."}`);
      }
    } catch (err) {
      alert("Lỗi kết nối server khi cập nhật lịch trình.");
    } finally {
      setIsUpdatingSchedule((prev) => ({ ...prev, [scheduleId]: false }));
    }
  };

  const displayData = isEditingInfo ? editFormData : tourData;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Chi tiết Tour: {tourData.tourName}
      </h1>
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 hover:text-indigo-800 mb-6"
      >
        &larr; Quay lại
      </button>

      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="text-2xl font-semibold text-indigo-700">
            Thông tin Tour
          </h2>
          {!isEditingInfo ? (
            <button
              onClick={handleStartEditInfo}
              className="flex items-center space-x-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleConfirmEditInfo}
                disabled={isUpdatingInfo}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition 
                        ${
                          isUpdatingInfo
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
              >
                {isUpdatingInfo ? (
                  <SpinnerIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckIcon className="w-5 h-5" />
                )}
                <span>{isUpdatingInfo ? "Đang cập nhật..." : "Xác nhận"}</span>
              </button>
              <button
                onClick={handleCancelEditInfo}
                disabled={isUpdatingInfo}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition 
                        ${
                          isUpdatingInfo
                            ? "bg-gray-200 cursor-not-allowed text-gray-500"
                            : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                        }`}
              >
                <XMarkIcon className="w-5 h-5" />
                <span>Hủy</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputField
            label="Tên Tour"
            name="tourName"
            value={displayData.tourName}
            isEditing={isEditingInfo}
            onChange={handleInfoChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
              <MapPinIcon className="w-4 h-4 mr-1 text-indigo-500" />
              Thành phố
            </label>
            {isEditingInfo ? (
              <select
                name="tourCity"
                value={editFormData.tourCity}
                onChange={handleInfoChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 bg-white"
              >
                <option value="">Chọn thành phố</option>
                {VIETNAM_PROVINCES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 block w-full bg-gray-100 rounded-lg p-2 text-gray-800">
                {VIETNAM_PROVINCES.find((c) => c.value === tourData.tourCity)
                  ?.label || tourData.tourCity}
              </p>
            )}
          </div>

          <InputField
            label="Giá Tour (VNĐ)"
            name="tourPrice"
            type="number"
            value={displayData.tourPrice}
            isEditing={isEditingInfo}
            onChange={handleInfoChange}
            readOnly={!isEditingInfo}
            suffix={
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrencyVND(tourData.tourPrice)}
              </p>
            }
          />

          <InputField
            label="Số người tối đa"
            name="maxPeople"
            type="number"
            value={displayData.maxPeople}
            isEditing={isEditingInfo}
            onChange={handleInfoChange}
            icon={<UsersIcon className="w-4 h-4 mr-1 text-indigo-500" />}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
              <ClockIcon className="w-4 h-4 mr-1 text-indigo-500" />
              Thời gian (Ngày)
            </label>
            <p className="mt-1 block w-full bg-gray-100 rounded-lg p-2 text-gray-800 font-semibold">
              {tourData.duration} ngày (Từ {tourData.startDate} đến{" "}
              {tourData.endDate})
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Mô tả Tour
          </label>
          <textarea
            name="tourDescription"
            rows="4"
            value={displayData.tourDescription}
            readOnly={!isEditingInfo}
            onChange={handleInfoChange}
            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 ${
              isEditingInfo ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <PhotoIcon className="w-5 h-5 mr-2" />
            Hình ảnh Tour (
            {displayData.imageTourUrls?.length + imageNewFiles.length})
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {displayData.imageTourUrls?.map((url, index) => (
              <div key={url} className="relative group aspect-w-16 aspect-h-9">
                <img
                  src={url}
                  alt={`Old Image ${index}`}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
                {isEditingInfo && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOldImage(url)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity z-10"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {imageNewFiles.map((file, index) => (
              <div
                key={index}
                className="relative group aspect-w-16 aspect-h-9"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New Image ${index}`}
                  className="w-full h-full object-cover rounded-lg shadow-md border-2 border-green-500"
                />
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Mới
                </div>
                {isEditingInfo && (
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity z-10"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {isEditingInfo && (
              <label
                htmlFor="new-image-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer h-full hover:bg-gray-100 transition p-4 text-center"
              >
                <PlusIcon className="w-6 h-6 text-gray-500" />
                <span className="text-sm text-gray-500 mt-1">Thêm ảnh mới</span>
                <input
                  id="new-image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {isEditingInfo && (
            <p className="text-sm text-red-500 mt-4">
              Lưu ý: Cần ít nhất 1 ảnh (ảnh cũ hoặc ảnh mới) khi xác nhận cập
              nhật.
            </p>
          )}
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-5 border-b pb-3">
          Lịch Trình ({tourData.duration} Ngày)
        </h2>

        <div className="space-y-6">
          {tourData.tourSchedules.map((schedule, index) => {
            const isEditing = isEditingSchedule[schedule.tourScheduleId];
            const isScheduleUpdating =
              isUpdatingSchedule[schedule.tourScheduleId];
            const currentEditData =
              editScheduleData[schedule.tourScheduleId] || schedule;

            return (
              <div
                key={schedule.tourScheduleId}
                className="border p-4 rounded-lg bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    <CalendarDaysIcon className="w-5 h-5 mr-2 inline-block text-blue-600" />
                    Ngày {index + 1}
                  </h3>

                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEditSchedule(schedule)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Chỉnh sửa</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleConfirmEditSchedule(schedule.tourScheduleId)
                        }
                        disabled={isScheduleUpdating}
                        className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition
                            ${
                              isScheduleUpdating
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                      >
                        {isScheduleUpdating ? (
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                        <span>
                          {isScheduleUpdating ? "Đang lưu" : "Xác nhận"}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          handleCancelEditSchedule(schedule.tourScheduleId)
                        }
                        disabled={isScheduleUpdating}
                        className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition
                            ${
                              isScheduleUpdating
                                ? "bg-gray-200 cursor-not-allowed text-gray-500"
                                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                            }`}
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Hủy</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={currentEditData.title}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      handleScheduleInputChange(
                        schedule.tourScheduleId,
                        "title",
                        e.target.value
                      )
                    }
                    className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 ${
                      isEditing ? "bg-white border-blue-400" : "bg-gray-100"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    rows="3"
                    value={currentEditData.description}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      handleScheduleInputChange(
                        schedule.tourScheduleId,
                        "description",
                        e.target.value
                      )
                    }
                    className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 ${
                      isEditing ? "bg-white border-blue-400" : "bg-gray-100"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  icon,
  suffix,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
      {icon}
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      readOnly={!isEditing}
      onChange={onChange}
      step="100000"
      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 ${
        isEditing ? "bg-white" : "bg-gray-100"
      }`}
    />
    {suffix}
  </div>
);
