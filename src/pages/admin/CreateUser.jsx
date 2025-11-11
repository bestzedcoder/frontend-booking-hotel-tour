import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useApi } from "../../hooks/useApi";

export default function CreateUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    fullName: "",
    roles: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const rolesList = ["ROLE_ADMIN", "ROLE_BUSINESS", "ROLE_CUSTOMER"];
  const { callApi } = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: name === "username" ? value.trim() : value });
  };

  const handleRoleToggle = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roles.length) {
      alert("Phải chọn ít nhất 1 vai trò!");
      return;
    }

    setIsSubmitting(true);
    const response = await callApi("post", "users", form);
    if (!response.success) {
      alert(response.message);
      setIsSubmitting(false);
      return;
    }
    onSuccess?.();
    onClose();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[480px] p-6 relative">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <UserPlus className="text-blue-600" />
          Thêm người dùng mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-semibold">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold">Họ tên</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold">Vai trò</label>
            <div className="flex gap-3 mt-2 flex-wrap">
              {rolesList.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    form.roles.includes(role)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              {isSubmitting ? "Đang tạo..." : "Thêm người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
