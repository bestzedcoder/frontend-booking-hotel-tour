import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  ShoppingCart,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
// Có thể cần import thư viện biểu đồ như Recharts hoặc Chart.js

export default function AdminDashboard() {
  const { callApi } = useApi();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 🚨 Gọi API tổng hợp từ Backend
        const response = await callApi("get", "/admin/dashboard/summary");
        setSummary(response.data);
      } catch (err) {
        console.error("Lỗi khi tải Dashboard:", err);
        setError("Không thể tải dữ liệu Dashboard. Kiểm tra quyền Admin.");
        // Lỗi 403 Forbidden sẽ được xử lý ở đây nếu AccessDeniedHandler trả về lỗi chuẩn
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [callApi]);

  // Hàm định dạng tiền tệ (VD: 123456789 -> 123,456,789 VNĐ)
  const formatCurrency = (amount) => {
    if (amount == null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin inline-block mr-2" size={24} />
        Đang tải dữ liệu Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 border border-red-300 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        📊 Admin Dashboard
      </h1>

      {/* 1. Vùng Chỉ số Tổng hợp (Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard
          icon={Users}
          title="Tổng số Người dùng"
          value={summary?.totalUsers || 0}
          color="text-blue-500"
          bg="bg-blue-50"
        />
        <MetricCard
          icon={Building2}
          title="Tổng số Khách sạn"
          value={summary?.totalHotels || 0}
          color="text-green-500"
          bg="bg-green-50"
        />
        <MetricCard
          icon={ShoppingCart}
          title="Tổng số Đơn đặt"
          value={summary?.totalBookings || 0}
          color="text-yellow-500"
          bg="bg-yellow-50"
        />
        <MetricCard
          icon={DollarSign}
          title="Doanh thu Tháng này"
          value={formatCurrency(summary?.monthlyRevenue) || 0}
          color="text-red-500"
          bg="bg-red-50"
        />
      </div>

      {/* 2. Vùng Biểu đồ (Cần thư viện biểu đồ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Biểu đồ Doanh thu (6 tháng gần nhất)
          </h2>
          {/* Placeholder cho Biểu đồ Line Chart */}
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded">
            Component Biểu đồ Line Chart ở đây (sử dụng Recharts/Chart.js)
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Thống kê Đơn đặt (Theo trạng thái)
          </h2>
          {/* Placeholder cho Biểu đồ Pie/Bar Chart */}
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded">
            Component Biểu đồ Bar Chart ở đây
          </div>
        </div>
      </div>
    </div>
  );
}

// Component nhỏ để hiển thị chỉ số
const MetricCard = ({ icon: Icon, title, value, color, bg }) => (
  <div className={`p-5 rounded-xl shadow-lg flex items-center ${bg}`}>
    <div className={`p-3 rounded-full ${color} bg-white shadow-md mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
