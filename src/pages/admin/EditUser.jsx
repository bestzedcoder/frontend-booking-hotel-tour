import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, X, Trash2, UserCog, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";
const ALL_ROLES = ["ROLE_ADMIN", "ROLE_BUSINESS", "ROLE_CUSTOMER"];

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { callApi } = useApi();

  const [user, setUser] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // tải user
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await callApi("get", `/users/${id}`);
        const data = res.data;
        const normalized = {
          id: data.id,
          username: data.username || "",
          email: data.email || "",
          fullName: data.fullName || "",
          phone: data.phone || "",
          address: data.address || "",
          urlImage: data.urlImage || DEFAULT_AVATAR,
          active: !!data.active,
          roles: Array.isArray(data.roles) ? data.roles : [],
        };
        setUser(normalized);
        setRoles(normalized.roles);
        setAvailableRoles(
          ALL_ROLES.filter((r) => !normalized.roles.includes(r))
        );
      } catch (err) {
        console.error("fetch user error:", err);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(() => fetchUser(), 1000);
  }, [id, callApi]);

  // thêm role
  const handleRoleAdd = (role) => {
    if (!role) return;
    const nextRoles = [...roles, role];
    setRoles(nextRoles);
    setAvailableRoles(availableRoles.filter((r) => r !== role));
  };

  // xóa role (không cho xóa nếu chỉ còn 1 role)
  const handleRoleRemove = (role) => {
    if (roles.length <= 1) {
      alert("Phải có ít nhất 1 vai trò.");
      return;
    }
    const nextRoles = roles.filter((r) => r !== role);
    setRoles(nextRoles);
    setAvailableRoles([...availableRoles, role].sort());
  };

  // avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewAvatar(file);
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const formData = new FormData();
    const payload = {
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      roles,
      active: user.active,
    };
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    if (newAvatar) formData.append("image", newAvatar);
    const response = await callApi("put", `/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!response.success) {
      alert(response.message);
      setSaving(false);
      return;
    }
    navigate("/admin/users");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6 animate-pulse">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user)
    return <div className="text-center text-red-500 mt-8">User not found</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <UserCog size={28} className="text-blue-600" />
        <h1 className="text-2xl font-semibold">
          Chỉnh sửa thông tin người dùng
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* avatar */}
        <div className="flex flex-col items-center">
          <img
            src={
              newAvatar
                ? URL.createObjectURL(newAvatar)
                : user.urlImage || DEFAULT_AVATAR
            }
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover shadow-md"
          />
          <label className="mt-3 inline-flex items-center gap-2 text-sm cursor-pointer px-3 py-1 rounded border hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            Thay ảnh
          </label>
          <p className="text-xs text-gray-400 mt-1">
            Nếu không thay ảnh, avatar sẽ giữ nguyên
          </p>
        </div>

        {/* inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên</label>
            <input
              className="w-full border rounded-lg p-2"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tên đăng nhập
            </label>
            <input
              className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              value={user.username}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              value={user.email}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Số điện thoại
            </label>
            <input
              className="w-full border rounded-lg p-2"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <input
              className="w-full border rounded-lg p-2"
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
            />
          </div>
        </div>

        {/* roles */}
        <div>
          <label className="block text-sm font-medium mb-2">Vai trò</label>

          <div className="flex flex-wrap gap-2 mb-3">
            {roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {r.replace("ROLE_", "")}
                <button
                  type="button"
                  onClick={() => handleRoleRemove(r)}
                  disabled={roles.length <= 1}
                  className={`ml-1 ${
                    roles.length <= 1
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:text-red-700"
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              onChange={(e) => handleRoleAdd(e.target.value)}
              value=""
              disabled={availableRoles.length === 0}
              className={`border rounded-lg p-2 ${
                availableRoles.length === 0
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">+ Thêm vai trò</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r.replace("ROLE_", "")}
                </option>
              ))}
            </select>

            {availableRoles.length === 0 && (
              <p className="text-sm text-gray-500">
                All roles already assigned
              </p>
            )}
          </div>
        </div>

        {/* active toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Trạng thái</span>
          <button
            type="button"
            onClick={() => setUser({ ...user, active: !user.active })}
            className={`w-14 h-8 flex items-center p-1 rounded-full transition ${
              user.active ? "bg-green-500" : "bg-gray-300"
            }`}
            aria-pressed={user.active}
          >
            <span
              className={`w-6 h-6 bg-white rounded-full shadow transform transition ${
                user.active ? "translate-x-6" : "translate-x-0"
              }`}
            ></span>
          </button>
          <span className="text-sm text-gray-600">
            {user.active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            <X size={16} /> Hủy
          </button>

          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
