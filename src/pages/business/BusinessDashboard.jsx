import { useEffect, useState } from "react";
import {
  Building2,
  ShoppingCart,
  Loader2,
  Map as MapIcon,
  DollarSign,
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
} from "recharts";

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

export const BusinessDashboard = () => {
  const { callApi } = useApi();

  const [data, setData] = useState({
    summary: null,
    revenue: [],
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
        const [resSummary, resRevenue] = await Promise.all([
          callApi("get", "/summary/business"),
          callApi("get", "/summary/business/revenue-by-month"),
        ]);

        const processedRevenue = (resRevenue.data || []).map((item) => ({
          name: formatDateLabel(item.month),
          revenue: item.revenue,
        }));

        setData({
          summary: resSummary.data,
          revenue: processedRevenue,
        });
      } catch (err) {
        console.error("Lỗi tải dashboard Business:", err);
        setError(
          "Không thể tải dữ liệu Dashboard. Vui lòng kiểm tra quyền truy cập."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [callApi]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
        <p className="text-gray-600 font-medium">
          Đang tổng hợp số liệu kinh doanh...
        </p>
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

  const summary = data.summary || {};

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          📊 Dashboard Đối Tác
        </h1>
        <p className="text-gray-500 mt-2">
          Tổng quan về hoạt động kinh doanh của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon={Building2}
          title="Tổng số Khách sạn"
          value={summary.totalHotels || 0}
          color="text-indigo-600"
          bg="bg-indigo-100"
        />
        <MetricCard
          icon={MapIcon}
          title="Tổng số Tour"
          value={summary.totalTours || 0}
          color="text-orange-600"
          bg="bg-orange-100"
        />
        <MetricCard
          icon={ShoppingCart}
          title="Tổng Đơn đặt chỗ"
          value={summary.totalBookings || 0}
          color="text-yellow-600"
          bg="bg-yellow-100"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <DollarSign size={20} className="text-green-500" />
          Doanh thu thuần theo tháng
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.revenue}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(val)
                }
              />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                formatter={(value) => [formatCurrency(value), "Doanh thu"]}
              />
              <Legend iconType="circle" />
              <Bar
                dataKey="revenue"
                name="Doanh thu (VNĐ)"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                barSize={60}
                activeBar={{ fill: "#059669" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
