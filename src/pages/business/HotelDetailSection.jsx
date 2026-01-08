import { useState, useEffect } from "react";
import { STAR_RATINGS } from "../../utils/contain";
import TruncatedDescription from "./TruncatedDescription";

const HotelDetailSection = ({ hotelData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (hotelData.hotelImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % hotelData.hotelImages.length
        );
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [hotelData.hotelImages.length]);

  const StarRating = ({ star }) => {
    const totalStars = 5;
    const stars = Array(totalStars)
      .fill(null)
      .map((_, i) => (
        <span
          key={i}
          className={i < star ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ));
    return <div className="flex text-2xl">{stars}</div>;
  };

  const countStar = STAR_RATINGS.find(
    (s) => s.element === hotelData.hotelStar
  )?.value;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 relative overflow-hidden rounded-lg shadow-xl aspect-video">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {hotelData.hotelImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Hotel Image ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {hotelData.hotelImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-white" : "bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      </div>

      <div className="md:col-span-1 p-4 bg-white border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {hotelData.hotelName}
        </h2>
        <StarRating star={countStar ?? 0} />
        <p className="text-gray-600 mt-2 mb-4 italic">{hotelData.hotelCity}</p>

        <div className="space-y-2 text-sm">
          <p className="flex items-center">
            <span className="font-semibold w-24">Địa chỉ:</span>
            <span className="text-gray-700">{hotelData.hotelAddress}</span>
          </p>
          <p className="flex items-center">
            <span className="font-semibold w-24">Điện thoại:</span>
            <span className="text-gray-700">{hotelData.hotelPhone}</span>
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2 border-t pt-3">Mô tả</h3>
        <TruncatedDescription description={hotelData.hotelDescription} />
      </div>
    </div>
  );
};

export default HotelDetailSection;
