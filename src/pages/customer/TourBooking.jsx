import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ArrowLeft,
  Minus,
  Plus,
  CreditCard,
  CheckCircle,
  Banknote,
  Send,
  Loader2,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

const SERVICE_FEE_RATE = 0;

const TourBookingPage = () => {
  const navigate = useNavigate();
  const { id: tourId } = useParams();

  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { callApi } = useApi();

  const [people, setPeople] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("VNPay");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await callApi("get", `tours/${tourId}/booking-info`);
    if (!response.success) {
      alert(response.message);
      setError(response.message);
      setTour(null);
    } else {
      setTour(response.data);
    }
    setTour(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (tourId) {
      fetchDetails();
    } else {
      setIsLoading(false);
      setError("Không tìm thấy ID Tour trong URL.");
    }
  }, [tourId, fetchDetails]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalPrice = useMemo(() => {
    if (!tour) {
      return { subtotal: 0, serviceFee: 0, total: 0 };
    }

    const subtotal = tour.price * people;
    const serviceFee = subtotal * SERVICE_FEE_RATE;
    const total = subtotal + serviceFee;

    return { subtotal, serviceFee, total };
  }, [people, tour]);

  const handleBooking = useCallback(async () => {
    if (!tour) return;

    setIsSubmitting(true);
    const bookingData = {
      people,
      paymentMethod,
    };

    const response = await callApi(
      "post",
      `bookings/tour/${tourId}`,
      bookingData
    );
    if (!response.success) {
      alert(response.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    alert(
      `Đặt Tour ${tour.tourName} thành công!\nTổng tiền: ${formatCurrency(
        totalPrice.total
      )}\nPhương thức: ${paymentMethod}`
    );
    const code = response.data;
    navigate(`/client/processing/${code}/tour`);
  }, [tour, people, paymentMethod, totalPrice.total, formatCurrency]);

  const handlePeopleChange = (change) => {
    setPeople((prev) => Math.max(1, prev + change));
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="ml-4 text-xl font-medium text-indigo-600">
          Đang tải thông tin Tour...
        </p>
      </div>
    );

  if (error || !tour)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-8 text-center">
        <div className="bg-white p-10 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Lỗi Truy Cập Dữ Liệu 😥
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            {error || "Thông tin Tour không hợp lệ hoặc đã bị gỡ."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            <ArrowLeft size={20} className="mr-2" /> Quay Lại
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition font-medium mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay Lại Chi Tiết Tour
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Xác Nhận Đặt Tour
          </h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-red-600 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {tour.tourName}
          </h2>
          <div className="flex flex-wrap gap-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin size={16} className="mr-1 text-red-500" /> {tour.tourCity}
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1 text-red-500" />{" "}
              {tour.startDate} - {tour.endDate}
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-1 text-red-500" /> {tour.duration}{" "}
              Ngày
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Users size={24} className="mr-2 text-indigo-600" />
                1. Số Lượng Khách Tham Gia
              </h3>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50">
                <span className="text-lg font-medium text-gray-700">
                  Người lớn (Giá: {formatCurrency(tour.price)})
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handlePeopleChange(-1)}
                    disabled={people <= 1 || isSubmitting}
                    className="p-2 bg-white text-indigo-600 border border-indigo-300 rounded-full hover:bg-indigo-100 disabled:opacity-50 transition"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-2xl font-extrabold w-8 text-center text-indigo-800">
                    {people}
                  </span>
                  <button
                    onClick={() => handlePeopleChange(1)}
                    disabled={isSubmitting}
                    className="p-2 bg-white text-indigo-600 border border-indigo-300 rounded-full hover:bg-indigo-100 disabled:opacity-50 transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                *Tối thiểu 1 người. Vui lòng liên hệ nếu số lượng vượt quá giới
                hạn tour.
              </p>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CreditCard size={24} className="mr-2 text-green-600" />
                2. Chọn Phương Thức Thanh Toán
              </h3>

              <div className="space-y-4">
                <PaymentOption
                  id="vnpay"
                  label="Thanh Toán Qua VNPay"
                  icon={CreditCard}
                  description="Thanh toán trực tuyến bằng thẻ nội địa/quốc tế. Nhanh chóng & Bảo mật."
                  isChecked={paymentMethod === "VNPay"}
                  onCheck={() => setPaymentMethod("VNPay")}
                  color="text-blue-600"
                  disabled={isSubmitting}
                />

                <PaymentOption
                  id="cash"
                  label="Thanh Toán Bằng Tiền Mặt"
                  icon={Banknote}
                  description="Thanh toán trực tiếp tại văn phòng hoặc chuyển khoản ngân hàng."
                  isChecked={paymentMethod === "CASH"}
                  onCheck={() => setPaymentMethod("CASH")}
                  color="text-amber-600"
                  disabled={isSubmitting}
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="sticky top-12 bg-white p-6 rounded-xl shadow-2xl border border-red-200">
              <h3 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2 flex items-center">
                <DollarSign size={24} className="mr-2 text-red-600" />
                Hóa Đơn Tóm Tắt
              </h3>

              <div className="space-y-3 mb-6">
                <BillRow
                  label="Giá Tour cơ bản (x Người)"
                  value={formatCurrency(tour.price)}
                  detail={`x ${people} Khách`}
                />
                <BillRow
                  label="Tổng phụ (Tạm tính)"
                  value={formatCurrency(totalPrice.subtotal)}
                  isSubtotal
                />
                <BillRow
                  label={`Thuế & Phí dịch vụ (${SERVICE_FEE_RATE * 100}%)`}
                  value={formatCurrency(totalPrice.serviceFee)}
                  isFee
                />
              </div>

              <div className="border-t pt-4">
                <p className="flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>TỔNG TIỀN THANH TOÁN:</span>
                  <span className="text-3xl font-extrabold text-red-600">
                    {formatCurrency(totalPrice.total)}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1 italic">
                  Phương thức:{" "}
                  <span className="font-semibold text-indigo-600">
                    {paymentMethod === "VNPay"
                      ? "VNPay (Trực tuyến)"
                      : "Tiền mặt/Chuyển khoản"}
                  </span>
                </p>
              </div>

              <button
                onClick={handleBooking}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 transition duration-300 shadow-xl shadow-red-300/50 mt-6 disabled:bg-red-400"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={24} className="animate-spin mr-2" />
                    Đang Xử Lý...
                  </>
                ) : (
                  <>
                    <Send size={20} className="mr-2" />
                    HOÀN TẤT ĐẶT TOUR
                  </>
                )}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillRow = ({
  label,
  value,
  detail,
  isSubtotal = false,
  isFee = false,
}) => (
  <div
    className={`flex justify-between items-center ${
      isSubtotal ? "border-b pb-2" : ""
    }`}
  >
    <div className="flex flex-col">
      <span className={`text-md ${isFee ? "text-gray-600" : "text-gray-700"}`}>
        {label}
      </span>
      {detail && (
        <span className="text-xs text-indigo-500 font-medium">{detail}</span>
      )}
    </div>
    <span
      className={`text-lg font-semibold ${
        isFee ? "text-green-600" : "text-gray-800"
      }`}
    >
      {value}
    </span>
  </div>
);

const PaymentOption = ({
  id,
  label,
  icon: Icon,
  description,
  isChecked,
  onCheck,
  color,
  disabled,
}) => (
  <label
    htmlFor={id}
    className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition duration-300 ${
      disabled
        ? "opacity-60 cursor-not-allowed"
        : isChecked
        ? `border-green-500 bg-green-50 shadow-md`
        : `border-gray-200 bg-white hover:border-indigo-300`
    }`}
  >
    <input
      type="radio"
      id={id}
      name="paymentMethod"
      checked={isChecked}
      onChange={onCheck}
      disabled={disabled}
      className="hidden"
    />

    <div
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 ${
        isChecked ? "border-green-500 bg-green-500" : "border-gray-400"
      }`}
    >
      {isChecked && <CheckCircle size={16} className="text-white" />}
    </div>

    <div className="flex-grow">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-800">{label}</span>
        <Icon
          size={24}
          className={`${color} ${
            isChecked ? "text-green-600" : "text-gray-400"
          }`}
        />
      </div>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  </label>
);

export default TourBookingPage;
