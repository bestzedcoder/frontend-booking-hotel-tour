import { useState, useEffect } from "react";
import { RoomStatus, RoomType } from "../../utils/contain";

const RoomFormModal = ({
  isOpen,
  onClose,
  isEditing,
  initialData,
  onCreate,
  onUpdate,
  isSaving,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (isEditing && initialData) {
        // Chế độ Edit: Sao chép toàn bộ dữ liệu phòng
        setFormData({ ...initialData });
      } else {
        // Chế độ Create: Thiết lập giá trị mặc định cho DTO
        setFormData({
          roomType: "",
          pricePerHour: "",
          pricePerDay: "",
          quantity: 1, // Mặc định số lượng là 1
        });
      }
    }
  }, [isOpen, isEditing, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Chuyển đổi giá trị thành số nếu là input type="number"
    const newValue = type === "number" && value !== "" ? Number(value) : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  // Hàm Validation (Giống yêu cầu từ server)
  const validate = () => {
    let currentErrors = {};

    if (!formData.roomType) {
      currentErrors.roomType = "Loại phòng không được để trống.";
    }

    if (!formData.pricePerHour || Number(formData.pricePerHour) <= 0) {
      currentErrors.pricePerHour = "Giá theo giờ phải lớn hơn 0.";
    }

    if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) {
      currentErrors.pricePerDay = "Giá theo ngày phải lớn hơn 0.";
    }

    // Chỉ kiểm tra quantity khi ở chế độ thêm mới (Create)
    if (!isEditing) {
      if (!formData.quantity || Number(formData.quantity) < 1) {
        currentErrors.quantity = "Số lượng phòng phải ít nhất là 1.";
      }
    }

    // Nếu ở chế độ chỉnh sửa, cần roomName
    if (isEditing && !formData.roomName) {
      currentErrors.roomName = "Tên phòng không được để trống.";
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (isEditing) {
        // Đảm bảo các giá trị số là kiểu Number
        const dataToUpdate = {
          roomStatus: formData.status,
          pricePerHour: Number(formData.pricePerHour),
          pricePerDay: Number(formData.pricePerDay),
        };
        onUpdate(dataToUpdate, formData.roomId);
      } else {
        // Dữ liệu tạo mới (CreateRoomDto)
        const dataToCreate = {
          roomType: formData.roomType,
          pricePerHour: Number(formData.pricePerHour),
          pricePerDay: Number(formData.pricePerDay),
          quantity: Number(formData.quantity),
        };
        onCreate(dataToCreate);
      }
    }
  };

  const allRoomTypes = Object.values(RoomType);
  const allRoomStatuses = Object.values(RoomStatus);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          {isEditing ? "✏️ Sửa thông tin Phòng" : "➕ Thêm Phòng Mới"}
        </h3>

        <form onSubmit={handleSubmit}>
          {isEditing && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Tên Phòng
              </label>
              <div className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 bg-gray-100 text-gray-700">
                {formData.roomName}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Loại Phòng <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <div className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 bg-gray-100 text-gray-700">
                {formData.roomType}
              </div>
            ) : (
              <select
                name="roomType"
                value={formData.roomType || ""}
                onChange={handleChange}
                className={`shadow-sm border rounded w-full py-2 px-3 text-gray-700 bg-white focus:ring-blue-500 focus:border-blue-500 ${
                  errors.roomType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  Chọn Loại Phòng
                </option>
                {allRoomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
            {errors.roomType && !isEditing && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.roomType}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Giá theo Giờ (VND/giờ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="pricePerHour"
              value={formData.pricePerHour || ""}
              onChange={handleChange}
              min="100000"
              step="100000"
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pricePerHour ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Giá phải lớn hơn 0"
            />
            {errors.pricePerHour && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.pricePerHour}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Giá theo Ngày (VND/ngày) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="pricePerDay"
              value={formData.pricePerDay || ""}
              onChange={handleChange}
              min="100000"
              step="100000"
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pricePerDay ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Giá phải lớn hơn 0"
            />
            {errors.pricePerDay && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.pricePerDay}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Số lượng Phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity || 1}
                onChange={handleChange}
                className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.quantity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ít nhất 1"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.quantity}
                </p>
              )}
            </div>
          )}

          {isEditing && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Trạng thái (Status)
              </label>
              <select
                name="status"
                value={formData.status || RoomStatus.AVAILABLE}
                onChange={handleChange}
                className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 bg-white focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              >
                {allRoomStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md font-semibold transition border ${
                isSaving
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed border-gray-300"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed text-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSaving
                ? "Đang lưu..."
                : isEditing
                ? "Lưu Thay Đổi"
                : "Tạo Phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomFormModal;
