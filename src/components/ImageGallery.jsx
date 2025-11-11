import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0)
    return (
      <div className="text-center text-gray-500 italic">
        Không có ảnh khách sạn
      </div>
    );

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Ảnh chính */}
      <div className="relative group">
        <img
          src={images[currentIndex]}
          alt="Hotel"
          className="w-full h-[480px] object-cover rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Nút điều hướng */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute top-1/2 -translate-y-1/2 left-3 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 -translate-y-1/2 right-3 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Ảnh nhỏ bên dưới */}
      {images.length > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`thumbnail-${i}`}
              onClick={() => setCurrentIndex(i)}
              className={`w-24 h-20 object-cover rounded-lg cursor-pointer transition-all duration-300 ${
                i === currentIndex
                  ? "ring-4 ring-blue-500 scale-105"
                  : "opacity-70 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
