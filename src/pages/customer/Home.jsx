import {
  Plane,
  Hotel,
  Users,
  MapPin,
  Sparkles,
  Code,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";

const featuredDestinations = [
  {
    name: "Vịnh Hạ Long",
    country: "Việt Nam",
    description:
      "Di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi, mặt nước xanh ngọc bích.",
    image: "https://placehold.co/600x400/1e40af/ffffff?text=Ha+Long+Bay",
    rating: 4.9,
    icon: MapPin,
  },
  {
    name: "Phuket",
    country: "Thái Lan",
    description:
      "Thiên đường biển đảo nổi tiếng với bãi cát trắng mịn, nước biển trong xanh và các khu nghỉ dưỡng sang trọng.",
    image: "https://placehold.co/600x400/047857/ffffff?text=Phuket+Beach",
    rating: 4.7,
    icon: Hotel,
  },
  {
    name: "Kyoto",
    country: "Nhật Bản",
    description:
      "Thành phố cổ kính với những ngôi đền hàng ngàn năm tuổi, vườn thiền và văn hóa truyền thống phong phú.",
    image: "https://placehold.co/600x400/9d174d/ffffff?text=Kyoto+Temples",
    rating: 4.8,
    icon: Star,
  },
];

const statsData = [
  {
    label: "Tour Đã Đặt",
    value: "1.2K",
    icon: TrendingUp,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    label: "Đối Tác Khách Sạn",
    value: "350+",
    icon: Hotel,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Khách Hàng Hạnh Phúc",
    value: "15K+",
    icon: Users,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    label: "Chuyến Bay Đã Lên Kế Hoạch",
    value: "5.8K",
    icon: Plane,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

const DestinationCard = ({ destination }) => (
  <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-[1.02] hover:shadow-2xl">
    <img
      src={destination.image}
      alt={destination.name}
      className="w-full h-48 object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src =
          "https://placehold.co/600x400/444444/ffffff?text=Travel+Image";
      }}
    />
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">{destination.name}</h3>
        <span className="flex items-center text-sm font-semibold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
          <Star className="w-4 h-4 mr-1 fill-yellow-500" /> {destination.rating}
        </span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2">
        {destination.description}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-sm text-indigo-600 font-medium flex items-center">
          <destination.icon className="w-4 h-4 mr-1 text-indigo-500" />
          {destination.country}
        </span>
        <button className="text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-full shadow-md transition duration-300">
          Xem Tour
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({ stat }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${stat.bg}`}
    >
      <stat.icon className={`w-6 h-6 ${stat.color}`} />
    </div>
    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
    <p className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
  </div>
);

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="relative overflow-hidden bg-white p-8 md:p-12 rounded-3xl shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <div className="absolute inset-0 opacity-10 bg-[url('https://placehold.co/1000x500/ffffff/ffffff?text=TRAVEL')] bg-cover bg-center mix-blend-multiply"></div>

          <div className="relative text-left z-10">
            <div className="flex items-center text-white/80 mb-4">
              <Zap className="w-6 h-6 mr-2 text-yellow-300 fill-yellow-300" />
              <span className="font-semibold tracking-wide uppercase text-sm">
                TravelMate Dashboard
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Chào Mừng Trở Lại, <br className="md:hidden" />
              <span className="text-yellow-300">
                Sẵn Sàng Cho Hành Trình Mới!
              </span>
            </h1>
            <p className="mt-4 text-indigo-200 max-w-2xl text-lg">
              Khám phá các điểm đến mới, quản lý đặt phòng và theo dõi hiệu suất
              tour du lịch của bạn.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm Khách sạn, Tour hoặc Địa điểm..."
                className="w-full sm:w-96 p-4 rounded-xl shadow-lg border-2 border-white/50 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                readOnly
              />
              <button className="flex items-center justify-center p-4 bg-yellow-400 text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-yellow-300 transition duration-300">
                <Plane className="w-5 h-5 mr-2" />
                Tìm kiếm
              </button>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-indigo-500" />
            Hiệu suất & Thống kê
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MapPin className="w-6 h-6 mr-3 text-pink-500" />
            Điểm Đến Nổi Bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((dest, index) => (
              <DestinationCard key={index} destination={dest} />
            ))}
          </div>
        </section>

        <section className="pt-8">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-8 md:p-10 rounded-3xl shadow-xl border-4 border-white/50 text-white flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="p-4 bg-white/20 rounded-full mr-4 shadow-inner">
                <Code className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Project By
                </h3>
                <p className="text-4xl font-extrabold mt-1 text-yellow-200">
                  BestZedCoder
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-light italic">
                "Code with passion, Travel with heart."
              </p>
              <div className="mt-2 flex justify-end">
                <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
