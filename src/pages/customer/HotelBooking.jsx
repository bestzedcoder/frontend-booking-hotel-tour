import { useState, useEffect, useMemo } from "react";
import {
  addDays,
  addHours,
  parseISO,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";

const parseDate = (str) => (str ? parseISO(str) : null);

const getMinMaxDates = (bookingType) => {
  const now = new Date();
  if (bookingType === "DAILY") {
    const today = startOfDay(now);
    const maxDate = addDays(today, 1);

    return {
      min: format(today, "yyyy-MM-dd"),
      max: format(maxDate, "yyyy-MM-dd"),
    };
  } else {
    const maxDateTime = addHours(now, 24);
    return {
      min: format(now, "yyyy-MM-dd'T'HH:mm"),
      max: format(maxDateTime, "yyyy-MM-dd'T'HH:mm"),
    };
  }
};

export const HotelBookingPage = () => {
  const navigate = useNavigate();
  const { hotelId, roomId } = useParams();
  const { callApi } = useApi();

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [booking, setBooking] = useState({
    bookingType: "DAILY",
    paymentMethod: "CASH",
    checkIn: "",
    checkOut: "",
    duration: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await callApi("get", `hotels/${hotelId}/room/${roomId}`);
        res.success ? setApiData(res.data) : setError(res.message);
      } catch (e) {
        setError("Không thể kết nối máy chủ!");
      }
      setLoading(false);
    };
    fetchData();
  }, [hotelId, roomId, callApi]);

  useEffect(() => {
    if (!booking.checkIn) return;

    const start = parseDate(booking.checkIn);
    const dur = Number(booking.duration) || 1;

    const end =
      booking.bookingType === "DAILY"
        ? addDays(start, dur)
        : addHours(start, dur);

    const formatType =
      booking.bookingType === "DAILY" ? "yyyy-MM-dd" : "yyyy-MM-dd'T'HH:mm";

    setBooking((b) => ({ ...b, checkOut: format(end, formatType) }));
  }, [booking.checkIn, booking.duration, booking.bookingType]);

  const totalPrice = useMemo(() => {
    if (!apiData) return 0;
    const unit =
      booking.bookingType === "HOURLY"
        ? apiData.pricePerHour
        : apiData.pricePerDay;
    return unit * booking.duration;
  }, [apiData, booking.bookingType, booking.duration]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "checkIn" && value) {
      const checkInDate = parseDate(value);
      const { min, max } = getMinMaxDates(booking.bookingType);
      const minDate = parseDate(min.replace("T", " "));
      const maxDate = parseDate(max.replace("T", " "));

      if (
        checkInDate &&
        (isBefore(checkInDate, minDate) || isAfter(checkInDate, maxDate))
      ) {
        alert(
          `Ngày/giờ check-in phải trong vòng 1 ngày kể từ hiện tại! (Từ ${format(
            minDate,
            "dd/MM/yyyy HH:mm"
          )} đến ${format(maxDate, "dd/MM/yyyy HH:mm")})`
        );
        return;
      }
    }

    setBooking((b) => ({
      ...b,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!apiData || isSubmitting) return;

    setIsSubmitting(true);

    const isDaily = booking.bookingType === "DAILY";

    const payload = {
      ...booking,
      totalPrice,
      checkIn: isDaily
        ? format(parseDate(booking.checkIn), "yyyy-MM-dd")
        : format(parseDate(booking.checkIn), "yyyy-MM-dd'T'HH:mm:ss"),
      checkOut: isDaily
        ? format(parseDate(booking.checkOut), "yyyy-MM-dd")
        : format(parseDate(booking.checkOut), "yyyy-MM-dd'T'HH:mm:ss"),
    };

    console.log("SEND BOOKING:", payload);

    const response = await callApi(
      "post",
      `bookings/hotel/${hotelId}/room/${roomId}`,
      payload
    );

    if (!response.success) {
      alert(response.message);
      setIsSubmitting(false);
      return;
    }
    alert(response.message);
    setIsSubmitting(false);
    const code = response.data;
    navigate(`/client/processing/${code}/hotel`);
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (error || !apiData)
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        ❌ {error || "Không có dữ liệu!"}
      </div>
    );

  const { roomName, hotelName, hotelCity, hotelAddress, hotelPhone } = apiData;

  const dateLimits = getMinMaxDates(booking.bookingType);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
      >
        ← Quay lại
      </button>

      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">
          🛎️ Xác Nhận Đặt Phòng
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Phòng <b>{roomName}</b> tại <b>{hotelName}</b>
        </p>

        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <h3 className="font-bold text-xl mb-4 text-indigo-600">
              📝 Chi Tiết Đặt Phòng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-medium">Loại đặt phòng</label>
                <select
                  name="bookingType"
                  value={booking.bookingType}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="DAILY">
                    DAILY - {apiData.pricePerDay.toLocaleString()} VND/ngày
                  </option>
                  <option value="HOURLY">
                    HOURLY - {apiData.pricePerHour.toLocaleString()} VND/giờ
                  </option>
                </select>
              </div>

              <div>
                <label className="font-medium">Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={booking.paymentMethod}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="VNPay">VNPay</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Check-in</label>
                <input
                  type={
                    booking.bookingType === "DAILY" ? "date" : "datetime-local"
                  }
                  name="checkIn"
                  value={booking.checkIn}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  min={dateLimits.min}
                  max={dateLimits.max}
                />
              </div>

              <div>
                <label className="font-medium">
                  Số {booking.bookingType === "DAILY" ? "ngày" : "giờ"}
                </label>
                <input
                  type="number"
                  min="1"
                  name="duration"
                  value={booking.duration}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-bold mb-2">🏨 Khách sạn</h4>
              <p>Tên: {hotelName}</p>
              <p>
                Địa chỉ: {hotelAddress}, {hotelCity}
              </p>
              <p>Điện thoại: {hotelPhone}</p>
            </div>
          </div>

          <div className="border p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-xl mb-4 text-red-600">
              🧾 Tóm Tắt Thanh Toán
            </h3>

            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Nhận phòng:</span>
                <b>
                  {booking.checkIn
                    ? format(
                        parseDate(booking.checkIn),
                        booking.bookingType === "DAILY"
                          ? "dd/MM/yyyy"
                          : "dd/MM/yyyy HH:mm"
                      )
                    : "Chưa chọn"}
                </b>
              </div>

              <div className="flex justify-between">
                <span>Trả phòng:</span>
                <b>
                  {booking.checkOut
                    ? format(
                        parseDate(booking.checkOut),
                        booking.bookingType === "DAILY"
                          ? "dd/MM/yyyy"
                          : "dd/MM/yyyy HH:mm"
                      )
                    : "---"}
                </b>
              </div>

              <div className="flex justify-between">
                <span>Thời lượng:</span>
                <b>
                  {booking.duration}{" "}
                  {booking.bookingType === "DAILY" ? "ngày" : "giờ"}
                </b>
              </div>

              <div className="flex justify-between pt-3 border-t mt-3 text-xl">
                <span>Giá trị đơn hàng:</span>
                <b className="text-red-600">
                  {totalPrice.toLocaleString()} VND
                </b>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!booking.checkIn || isSubmitting}
              className={`mt-6 w-full py-3 text-white rounded-lg text-lg transition duration-150 ease-in-out
                ${
                  !booking.checkIn || isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 active:bg-red-800 transform active:scale-98"
                }`}
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt Phòng Ngay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
