// HotelEditModal.jsx

import { useState, useEffect, useMemo } from "react";

const HotelEditModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  starRatings,
  provinces,
  isSaving,
}) => {
  const [name, setName] = useState("");
  const [stars, setStars] = useState("");
  const [province, setProvince] = useState("");
  // Mảng URL của ảnh cũ (đã có trên server)
  const [oldImageUrls, setOldImageUrls] = useState([]);
  // Mảng File của ảnh mới (chưa upload)
  const [newImages, setNewImages] = useState([]);

  // 1. Cập nhật State khi Modal mở hoặc initialData thay đổi
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.hotelName || "");
      const found = starRatings.find(
        (r) => r.element === initialData.hotelStar
      );
      setStars(found ? String(found.value) : "");
      setProvince(initialData.hotelCity || "");
      setOldImageUrls(initialData.hotelImages || []);
      setNewImages([]); // Reset ảnh mới khi mở modal mới
    }
  }, [isOpen, initialData]);

  // 2. Cleanup: Thu hồi URL tạm thời khi component unmount hoặc modal đóng
  useEffect(() => {
    // Hàm cleanup chạy khi effect này chạy lại hoặc component unmount
    return () => {
      newImages.forEach((file) => {
        if (file.url) {
          // Kiểm tra nếu URL tạm đã được tạo
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [newImages]); // Chạy lại khi danh sách ảnh mới thay đổi

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithUrl = files.map((file) => {
      // Tạo URL tạm thời và lưu nó vào đối tượng File để dễ quản lý
      file.url = URL.createObjectURL(file);
      return file;
    });
    setNewImages((prev) => [...prev, ...filesWithUrl]);
    e.target.value = null;
  };

  const handleRemoveOldImage = (urlToRemove) => {
    setOldImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleRemoveNewImage = (fileToRemove) => {
    // Thu hồi URL tạm thời ngay lập tức
    URL.revokeObjectURL(fileToRemove.url);
    setNewImages((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      hotelId: initialData.hotelId,
      name,
      stars: Number(stars),
      province,
      oldImageUrls,
      newImages, // Truyền mảng File (có chứa URL tạm thời)
    };

    onSave(updatedData);
  };

  // 3. Hiển thị Ảnh Hiện Tại & Ảnh Mới (View)
  const previewImages = useMemo(() => {
    const oldPreviews = oldImageUrls.map((url) => ({
      id: url,
      url,
      isNew: false,
    }));

    // Sử dụng URL đã được lưu trong đối tượng File
    const newPreviews = newImages.map((file) => ({
      id: file.url, // Sử dụng URL tạm thời làm key
      url: file.url,
      isNew: true,
      file,
    }));

    return [...oldPreviews, ...newPreviews];
  }, [oldImageUrls, newImages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            ⚙️ Chỉnh Sửa Khách sạn
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={isSaving}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trường Tên Khách sạn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Khách sạn
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Trường Số Sao và Tỉnh/Thành phố (giữ nguyên logic) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Sao (Hiện tại: **{initialData.hotelStar || "N/A"}**)
              </label>
              <select
                value={stars}
                onChange={(e) => setStars(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>
                  Chọn số sao
                </option>
                {starRatings.map((rating) => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố (Hiện tại: **{province || "N/A"}**)
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>
                  Chọn tỉnh/thành phố
                </option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quản lý Ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quản lý Ảnh Khách sạn (Tổng: **{previewImages.length}** ảnh)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isSaving}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <div className="mt-4 grid grid-cols-3 gap-3">
              {previewImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                >
                  <img
                    src={img.url}
                    alt="Ảnh khách sạn"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      img.isNew
                        ? handleRemoveNewImage(img.file)
                        : handleRemoveOldImage(img.url)
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none text-xs hover:bg-red-700 transition disabled:opacity-50"
                    title={img.isNew ? "Xóa ảnh mới" : "Xóa ảnh cũ"}
                    disabled={isSaving}
                  >
                    &times;
                  </button>
                  <span
                    className={`absolute bottom-0 left-0 px-2 py-0.5 text-xs text-white ${
                      img.isNew ? "bg-green-500" : "bg-blue-500"
                    }`}
                  >
                    {img.isNew ? "Mới" : "Cũ"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Nút Lưu */}
          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed text-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelEditModal;
