import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle,
  BookOpen,
  Send,
  Sunrise,
  Compass,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

const TourDetails = () => {
  const { id: tourId } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { callApi } = useApi();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const fetchDetails = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await callApi("get", `tours/${id}/info`);
      if (response.success) {
        setTour(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi kết nối máy chủ.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetails(tourId);
  }, [tourId, fetchDetails]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="ml-4 text-xl font-medium text-indigo-600">
          Đang tải chi tiết Tour...
        </p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="container mx-auto p-8 text-center min-h-screen bg-white shadow-lg rounded-xl mt-10">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          Lỗi Tải Dữ Liệu 😥
        </h2>
        <p className="text-gray-700 mb-6">
          {error || "Không tìm thấy thông tin tour này. Tour ID không hợp lệ."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center mx-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay Lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay Lại Danh Sách Tour
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-8 border-t-4 border-indigo-600">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            {tour.tourName}
          </h2>

          <AutoImageCarousel
            images={tour.imageTourUrls}
            tourName={tour.tourName}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-y py-4 my-4">
            <InfoBox
              Icon={MapPin}
              label="Địa điểm"
              value={tour.tourCity}
              color="text-indigo-600"
            />
            <InfoBox
              Icon={Clock}
              label="Thời gian"
              value={`${tour.duration} Ngày`}
              color="text-amber-600"
            />
            <InfoBox
              Icon={Calendar}
              label="Khởi hành"
              value={tour.startDate}
              color="text-sky-600"
            />
            <InfoBox
              Icon={Users}
              label="Tối đa"
              value={`${tour.maxPeople} Người`}
              color="text-green-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <BookOpen size={24} className="mr-2 text-indigo-600" />
                Mô Tả Chi Tiết Tour
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {tour.tourDescription}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2 flex items-center">
                <Calendar size={28} className="mr-3 text-red-600" />
                Hành Trình Khám Phá Tuyệt Vời
              </h3>
              <TourScheduleList schedules={tour.tourSchedules} />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            {tour.owner && <OwnerInfoBox owner={tour.owner} />}

            <div className="sticky top-20 bg-indigo-50 p-6 rounded-xl shadow-xl border border-indigo-200">
              <h3 className="text-xl font-bold text-indigo-800 mb-4 border-b pb-2">
                Thông tin Đặt Tour
              </h3>

              <div className="space-y-3 mb-6">
                <p className="flex justify-between items-center text-xl font-medium text-gray-700">
                  Giá trọn gói chỉ từ:
                  <span className="text-3xl font-extrabold text-red-600">
                    {formatCurrency(tour.tourPrice)}
                  </span>
                </p>
                <p className="text-sm text-gray-500 italic">
                  *Giá trên áp dụng cho 01 người lớn
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="flex items-start text-sm text-gray-600">
                  <CheckCircle
                    size={18}
                    className="text-green-500 mr-2 mt-1 flex-shrink-0"
                  />
                  <span>Bảo hiểm du lịch trọn gói trong suốt chuyến đi.</span>
                </p>
                <p className="flex items-start text-sm text-gray-600">
                  <CheckCircle
                    size={18}
                    className="text-green-500 mr-2 mt-1 flex-shrink-0"
                  />
                  <span>
                    Khách sạn/Du thuyền tiêu chuẩn 4-5 sao (tùy chọn).
                  </span>
                </p>
                <p className="flex items-start text-sm text-gray-600">
                  <CheckCircle
                    size={18}
                    className="text-green-500 mr-2 mt-1 flex-shrink-0"
                  />
                  <span>Toàn bộ các bữa ăn theo lịch trình đã định.</span>
                </p>
              </div>

              <button
                onClick={() => navigate(`/tours/${tourId}/booking`)}
                className="w-full flex items-center justify-center py-3 px-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 transition duration-300 shadow-xl shadow-red-300/50 mt-4"
              >
                ĐẶT TOUR NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerInfoBox = ({ owner }) => (
  <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-green-500">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
      <User size={24} className="mr-2 text-green-600" />
      Người Quản Lý Tour
    </h3>

    <div className="flex items-center space-x-4 mb-4">
      <img
        src={
          owner.avatarUrl ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        alt={owner.fullName}
        className="w-16 h-16 rounded-full object-cover border-2 border-green-400 flex-shrink-0"
      />
      <div>
        <p className="text-lg font-bold text-gray-900">{owner.fullName}</p>
        <p className="text-sm text-gray-500">Chuyên viên tư vấn Du lịch</p>
      </div>
    </div>

    <div className="space-y-3">
      <a
        href={`tel:${owner.phoneNumber}`}
        className="flex items-center justify-center py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition shadow-md"
      >
        <Phone size={18} className="mr-2" />
        Gọi Ngay: {owner.phoneNumber}
      </a>
      <button
        onClick={() => alert(`Chat với ${owner.fullName} qua Zalo/Message`)}
        className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition border"
      >
        <MessageSquare size={18} className="mr-2 text-indigo-500" />
        Chat Tư Vấn
      </button>
    </div>
  </div>
);

const AutoImageCarousel = ({ images, tourName, intervalTime = 5000 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [images.length, intervalTime]);

  if (images.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden mb-6 shadow-xl w-full h-96 flex items-center justify-center bg-gray-200">
        <p className="text-gray-500">Không có ảnh Tour</p>
      </div>
    );
  }

  const mainImageUrl = images[currentImageIndex];

  return (
    <div className="rounded-xl overflow-hidden mb-6 shadow-2xl relative">
      <div className="relative h-96 w-full">
        <img
          key={currentImageIndex}
          src={mainImageUrl}
          alt={`${tourName} - Ảnh ${currentImageIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-100"
          style={{ opacity: 1 }}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white scale-110 shadow-md"
                  : "bg-gray-400 bg-opacity-70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ Icon, label, value, color }) => (
  <div className="flex flex-col items-center">
    <Icon size={28} className={color} />
    <span className="text-xs font-medium text-gray-500 mt-1">{label}</span>
    <span className="text-md font-semibold text-gray-800">{value}</span>
  </div>
);

const TimelineItem = ({ day, title, description, Icon, isLast }) => {
  const boxColor =
    day % 2 === 1
      ? "bg-indigo-50 border-indigo-200"
      : "bg-white border-sky-100";
  const titleColor = day % 2 === 1 ? "text-indigo-800" : "text-sky-800";
  const shadowStyle =
    day % 2 === 1
      ? "shadow-lg shadow-indigo-100/50"
      : "shadow-lg shadow-sky-100/50";

  return (
    <div className="flex relative pb-10">
      {!isLast && (
        <div className="h-full w-1 absolute inset-0 left-5 transform -translate-x-1/2 bg-gray-300"></div>
      )}

      <div className="z-10 w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white flex-shrink-0 shadow-xl shadow-red-300/50 relative">
        <Icon size={20} />
      </div>

      <div className="flex-grow pl-6 pt-1">
        <div
          className={`p-4 rounded-xl border ${boxColor} ${shadowStyle} transform hover:scale-[1.01] transition duration-300 ease-in-out`}
        >
          <h4 className="flex items-center text-xl font-bold mb-1">
            <span className="text-lg font-extrabold mr-2 text-red-600">
              Ngày {day}:
            </span>
            <span className={titleColor}>{title}</span>
          </h4>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

const TourScheduleList = ({ schedules }) => {
  const iconSequence = [Send, Sunrise, Compass, MapPin];

  return (
    <div className="space-y-0">
      {schedules.map((schedule, index) => {
        const CurrentIcon = iconSequence[index % iconSequence.length];

        return (
          <TimelineItem
            key={schedule.tourScheduleId}
            day={index + 1}
            title={schedule.title}
            description={schedule.description}
            Icon={CurrentIcon}
            isLast={index === schedules.length - 1}
          />
        );
      })}
      <div className="flex relative pt-4">
        <div className="z-10 w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0 shadow-lg relative">
          <CheckCircle size={20} />
        </div>
        <div className="flex-grow pl-6 pt-1">
          <h4 className="text-xl font-bold text-green-700 mb-1 pt-2">
            Hành trình kết thúc! Cảm ơn quý khách đã tin tưởng.
          </h4>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
