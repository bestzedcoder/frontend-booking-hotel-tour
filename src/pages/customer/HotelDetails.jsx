import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { RoomStatus, RoomType } from "../../utils/contain";

const getStarIcon = (star) => {
  const starMap = {
    FIVE_STAR: 5,
    FOUR_STAR: 4,
    THREE_STAR: 3,
    TWO_STAR: 2,
    ONE_STAR: 1,
  };
  const starCount = starMap[star] || 3;
  return Array(starCount).fill("⭐").join("");
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const StarRating = ({ star }) => (
  <div className="text-yellow-400 text-2xl">{getStarIcon(star)}</div>
);

const getRoomTypeLabel = (type) => {
  switch (type) {
    case RoomType.STANDARD:
      return "Phòng Tiêu Chuẩn";
    case RoomType.DELUXE:
      return "Phòng Cao Cấp";
    case RoomType.SUITE:
      return "Phòng Suite";
    case RoomType.FAMILY:
      return "Phòng Gia Đình";
    default:
      return "Khác";
  }
};

const ImageSlider = ({
  images,
  hotelName,
  hotelStar,
  hotelAddress,
  hotelCity,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goToPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative h-[550px] overflow-hidden shadow-2xl rounded-b-3xl">
      <div
        className="w-full h-full flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${hotelName} - Ảnh ${i + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-16">
        <div className="text-white">
          <StarRating star={hotelStar} />
          <h1 className="text-6xl font-extrabold mt-1 mb-2">{hotelName}</h1>
          <p className="text-xl flex items-center opacity-90">
            <svg
              className="w-5 h-5 mr-2 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6c0 4.17 6 11 6 11s6-6.83 6-11a6 6 0 00-6-6zm0 9a3 3 0 110-6 3 3 0 010 6z" />
            </svg>
            {hotelAddress}, {hotelCity}
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-6 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full transition text-white shadow-xl backdrop-blur-sm z-10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute top-1/2 right-6 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full transition text-white shadow-xl backdrop-blur-sm z-10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-3 w-3 rounded-full transition-all duration-300 shadow-md ${
              currentIndex === i ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const RoomCardAvailable = ({ room, handleClick }) => (
  <div className="flex bg-white rounded-2xl shadow-xl border-t-4 border-indigo-400 p-6 items-center hover:shadow-2xl hover:border-red-500 transition duration-300">
    <div className="flex-grow pr-6">
      <h4 className="text-3xl font-extrabold text-gray-900 mb-1 hover:text-indigo-700 transition">
        {room.roomName}
      </h4>
      <p className="text-sm font-bold text-indigo-600 mb-3 border-b border-indigo-100 pb-2 inline-block">
        {getRoomTypeLabel(room.roomType)} | TRẠNG THÁI: SẴN SÀNG
      </p>
      <div className="flex space-x-6 text-base text-gray-600 font-medium">
        <span>🛌 Tối đa 2 người</span> <span>📐 35m²</span>
      </div>
    </div>
    <div className="flex-shrink-0 text-right pl-6 flex items-center space-x-6">
      <div className="border-r border-gray-200 pr-6">
        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">
          Giá/Ngày
        </p>
        <p className="text-4xl font-black text-red-600 my-1">
          {formatCurrency(room.pricePerDay)}
        </p>
        <p className="text-xs text-gray-400">Giá cố định 24h</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">
          Giá/Giờ
        </p>
        <p className="text-2xl font-black text-indigo-700 my-1">
          {formatCurrency(room.pricePerHour)}
        </p>
        <button
          onClick={() => handleClick(room.roomId)}
          className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition hover:scale-105 active:scale-95 mt-3"
        >
          ĐẶT PHÒNG NGAY
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ selectedRoomType }) => {
  const message = selectedRoomType
    ? `Hiện tại không có phòng loại ${getRoomTypeLabel(
        selectedRoomType
      )} nào trống. Vui lòng chọn loại phòng khác.`
    : "Rất tiếc! Tất cả các phòng trong khách sạn này hiện tại đều đã được đặt.";

  return (
    <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
      <svg
        className="w-20 h-20 text-indigo-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h4 className="text-2xl font-extrabold text-gray-800 mb-2">
        Không tìm thấy phòng trống
      </h4>
      <p className="text-gray-600 text-lg">{message}</p>
      <p className="mt-4 text-sm text-gray-500">
        Bạn có thể thử lại sau hoặc liên hệ trực tiếp với khách sạn.
      </p>
    </div>
  );
};

const OwnerContactCard = ({ owner }) => (
  <div className="p-5 bg-indigo-100 rounded-xl shadow-xl border-t-4 border-indigo-600">
    <div className="flex items-center mb-3 border-b pb-2 border-indigo-300">
      <span className="text-xl mr-2 text-indigo-700">🧑‍💼</span>
      <h4 className="text-lg font-bold text-indigo-900">
        Liên Hệ Quản Lý Khách Sạn
      </h4>
    </div>
    <p className="text-lg font-bold text-gray-800 mb-1 flex items-center">
      <span className="text-red-500 mr-2">👤</span> {owner.fullName}
    </p>
    <div className="flex items-center text-gray-700 mt-2">
      <svg
        className="w-5 h-5 mr-2 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      <a
        href={`tel:${owner.phoneNumber}`}
        className="text-xl font-extrabold text-red-600 hover:text-indigo-700 transition underline"
      >
        {owner.phoneNumber}
      </a>
    </div>
  </div>
);

const RoomTypeFilter = ({ selectedType, onSelect }) => (
  <div className="flex flex-wrap gap-3 mb-6 items-center">
    <h4 className="text-lg font-bold text-gray-700">Loại Phòng:</h4>
    <button
      onClick={() => onSelect(null)}
      className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition duration-200 ${
        selectedType === null
          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
          : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:shadow-sm"
      }`}
    >
      Tất Cả
    </button>
    {Object.values(RoomType).map((type) => (
      <button
        key={type}
        onClick={() => onSelect(type)}
        className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition duration-200 ${
          selectedType === type
            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:shadow-sm"
        }`}
      >
        {getRoomTypeLabel(type)}
      </button>
    ))}
  </div>
);

const Pagination = ({
  totalRooms,
  roomsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalRooms / roomsPerPage);
  if (totalPages <= 1) return null;

  const pages = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50 transition duration-200"
      >
        ← Trước
      </button>
      {pages.map((num, i) =>
        num === "..." ? (
          <span key={i} className="px-3 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(num)}
            className={`px-4 py-2 rounded-lg font-bold transition duration-200 ${
              num === currentPage
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white hover:bg-indigo-100 text-gray-700"
            }`}
          >
            {num}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50 transition duration-200"
      >
        Sau →
      </button>
    </div>
  );
};

const ROOMS_PER_PAGE = 5;

const HotelDetailsPage = () => {
  const { id: hotelId } = useParams();
  const { callApi } = useApi();
  const [hotelData, setHotelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setIsLoading(true);
      const res = await callApi("get", `/hotels/${hotelId}/details`);
      if (res?.success) setHotelData(res.data);
      setIsLoading(false);
    };
    fetchHotelDetails();
  }, [hotelId, callApi]);

  const availableRooms =
    hotelData?.rooms?.filter((r) => r.status === RoomStatus.AVAILABLE) || [];

  const filtered = selectedRoomType
    ? availableRooms.filter((r) => r.roomType === selectedRoomType)
    : availableRooms;

  const currentRooms = filtered.slice(
    (currentPage - 1) * ROOMS_PER_PAGE,
    currentPage * ROOMS_PER_PAGE
  );

  const paginate = (page) => {
    const totalPages = Math.ceil(filtered.length / ROOMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRoomType]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl font-bold text-indigo-700">
            Đang tải chi tiết khách sạn...
          </p>
        </div>
      </div>
    );

  if (!hotelData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-10 rounded-xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-red-600">LỖI 404</h1>
          <p className="text-xl text-gray-700 mt-3">
            Không tìm thấy thông tin khách sạn với ID: {hotelId}.
          </p>
          <p className="text-gray-500 mt-2">Vui lòng kiểm tra lại đường dẫn.</p>
        </div>
      </div>
    );

  const handleBooking = (roomId) => {
    navigate(`/client/hotels/${hotelId}/room/${roomId}/booking`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ImageSlider
        images={hotelData.hotelImages}
        hotelName={hotelData.hotelName}
        hotelStar={hotelData.hotelStar}
        hotelAddress={hotelData.hotelAddress}
        hotelCity={hotelData.hotelCity}
      />
      <main className="container mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl sticky top-4 space-y-5">
              <h3 className="text-2xl font-extrabold mb-3 border-b-2 pb-2 text-gray-900 border-indigo-400">
                <span className="text-yellow-500 mr-2">⭐</span> Tổng Quan Khách
                Sạn
              </h3>

              <blockquote
                className="text-base text-gray-700 italic border-l-4 border-indigo-600 pl-4 py-1 bg-indigo-50 rounded-r-lg 
                     truncate"
              >
                {hotelData.hotelDescription}
              </blockquote>

              <div className="space-y-3 pt-2 border-b pb-4">
                <p className="flex items-center text-base">
                  <span className="font-semibold text-gray-700 w-24">
                    Hạng:
                  </span>
                  <span className="text-red-500 font-bold text-xl ml-2">
                    {getStarIcon(hotelData.hotelStar)}
                  </span>
                </p>
                <p className="flex items-center text-base">
                  <span className="font-semibold text-gray-700 w-24">
                    Điện thoại:
                  </span>
                  <span className="text-indigo-600 font-medium ml-2 hover:underline">
                    {hotelData.hotelPhone}
                  </span>
                </p>
                <p className="flex items-start text-base">
                  <span className="font-semibold text-gray-700 w-24">
                    Địa chỉ:
                  </span>
                  <span className="text-gray-700 font-normal ml-2">
                    {hotelData.hotelAddress}
                  </span>
                </p>
              </div>

              {hotelData.owner && <OwnerContactCard owner={hotelData.owner} />}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 pb-2 border-b-2 border-red-500">
              Danh Sách Phòng Trống ({filtered.length})
            </h3>
            <RoomTypeFilter
              selectedType={selectedRoomType}
              onSelect={setSelectedRoomType}
            />
            <div className="space-y-6">
              {currentRooms.length > 0 ? (
                currentRooms.map((room) => (
                  <RoomCardAvailable
                    key={room.roomId}
                    room={room}
                    handleClick={handleBooking}
                  />
                ))
              ) : (
                <EmptyState selectedRoomType={selectedRoomType} />
              )}
            </div>
            {filtered.length > ROOMS_PER_PAGE && (
              <Pagination
                totalRooms={filtered.length}
                roomsPerPage={ROOMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={paginate}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetailsPage;
