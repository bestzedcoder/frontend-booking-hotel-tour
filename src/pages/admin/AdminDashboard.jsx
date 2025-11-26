import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  ShoppingCart,
  Loader2,
  Map as MapIcon,
  TrendingUp,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- CẤU HÌNH UI ---

// 1. Map tên trạng thái từ Anh -> Việt
const STATUS_MAPPING = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

// 2. Map màu sắc tương ứng với trạng thái (để biểu đồ trực quan hơn)
const STATUS_COLORS = {
  pending: "#FFBB28", // Vàng
  confirmed: "#00C49F", // Xanh lá
  cancelled: "#FF4444", // Đỏ
  completed: "#0088FE", // Xanh dương
  default: "#8884d8", // Tím (mặc định)
};

const MetricCard = ({ icon: Icon, title, value, color, bg }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition-all hover:shadow-md">
    <div className={`p-4 rounded-full ${bg} ${color} mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
        {new Intl.NumberFormat("vi-VN").format(value)}
      </p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { callApi } = useApi();

  const [data, setData] = useState({
    summary: null,
    revenue: [],
    bookingStatus: [],
    userGrowth: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDateLabel = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return `T${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resSummary, resRevenue, resStatus, resUsers] = await Promise.all(
          [
            callApi("get", "/summary/admin"),
            callApi("get", "/summary/admin/revenue-by-month"),
            callApi("get", "/summary/admin/count-status-booking"),
            callApi("get", "/summary/admin/users-by-month"),
          ]
        );

        // 1. Xử lý Doanh thu
        const processedRevenue = (resRevenue.data || []).map((item) => ({
          name: formatDateLabel(item.month),
          revenue: item.revenue,
        }));

        // 2. Xử lý User (revenue -> count)
        const processedUsers = (resUsers.data || []).map((item) => ({
          name: formatDateLabel(item.month),
          count: item.revenue,
        }));

        // 3. Xử lý Trạng thái (Object -> Array)
        // API trả về: { pending: 0, cancelled: 5, confirmed: 6 }
        const statusRaw = resStatus.data || {};

        // Chuyển thành: [{ name: "Đã hủy", value: 5, originalKey: "cancelled" }, ...]
        const processedStatus = Object.entries(statusRaw)
          .map(([key, value]) => ({
            name: STATUS_MAPPING[key] || key, // Dùng tên tiếng Việt
            value: value, // Số lượng
            originalKey: key, // Giữ key gốc để lấy màu
          }))
          .filter((item) => item.value > 0); // (Tùy chọn) Ẩn các mục có giá trị 0 để biểu đồ đẹp hơn

        setData({
          summary: resSummary.data,
          revenue: processedRevenue,
          bookingStatus: processedStatus,
          userGrowth: processedUsers,
        });
      } catch (err) {
        console.error("Lỗi tải dashboard:", err);
        setError("Không thể tải dữ liệu Dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [callApi]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Đang tổng hợp số liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản Trị</h1>
        <p className="text-gray-500 mt-2">Tổng quan hiệu suất hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={Users}
          title="Người dùng"
          value={data.summary?.totalUsers || 0}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <MetricCard
          icon={Building2}
          title="Khách sạn"
          value={data.summary?.totalHotels || 0}
          color="text-green-600"
          bg="bg-green-100"
        />
        <MetricCard
          icon={MapIcon}
          title="Tour"
          value={data.summary?.totalTours || 0}
          color="text-purple-600"
          bg="bg-purple-100"
        />
        <MetricCard
          icon={ShoppingCart}
          title="Đơn đặt"
          value={data.summary?.totalBookings || 0}
          color="text-yellow-600"
          bg="bg-yellow-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Biểu đồ Doanh thu */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" /> Doanh thu theo
            tháng
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) =>
                    new Intl.NumberFormat("vi-VN", {
                      notation: "compact",
                    }).format(val)
                  }
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Trạng thái đơn (Đã cập nhật logic hiển thị) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CreditCard size={20} className="text-orange-500" /> Trạng thái đơn
          </h2>
          <div className="flex-1 min-h-[300px]">
            {data.bookingStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.bookingStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value" // Số lượng
                    nameKey="name" // Tên hiển thị (Tiếng Việt)
                  >
                    {data.bookingStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        // Lấy màu dựa trên key gốc (pending, cancelled...)
                        fill={
                          STATUS_COLORS[entry.originalKey] ||
                          STATUS_COLORS.default
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Đơn hàng"]} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Chưa có dữ liệu đơn hàng
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <UserPlus size={20} className="text-purple-500" /> Người dùng mới
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [value, "Người dùng"]} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                name="Số lượng"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
