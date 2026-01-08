import { useState } from "react";

const MAX_LENGTH = 20;

const TruncatedDescription = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description || description.length <= MAX_LENGTH) {
    return (
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
        {description}
      </p>
    );
  }

  const truncatedText = description.substring(0, MAX_LENGTH) + "...";

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
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

export default TruncatedDescription;
