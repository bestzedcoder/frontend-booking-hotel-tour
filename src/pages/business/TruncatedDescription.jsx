import { useState } from "react";

const MAX_LENGTH = 20;

const TruncatedDescription = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Nếu mô tả ngắn hoặc rỗng, hiển thị toàn bộ
  if (!description || description.length <= MAX_LENGTH) {
    return (
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
        {description}
      </p>
    );
  }

  // Cắt chuỗi
  const truncatedText = description.substring(0, MAX_LENGTH) + "...";

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {/* Sử dụng 'whitespace-pre-line' ở đây
        để văn bản dài TỰ ĐỘNG XUỐNG DÒNG khi tràn lề 
        và vẫn tôn trọng ký tự xuống dòng (\n) trong dữ liệu gốc.
      */}
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
        {isExpanded ? description : truncatedText}
      </p>

      <button
        onClick={toggleExpanded}
        className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-1 transition duration-150"
      >
        {isExpanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </div>
  );
};

// ... sử dụng component này trong trang chi tiết của bạn ...

export default TruncatedDescription; // Export để sử dụng
