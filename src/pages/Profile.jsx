import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserShield,
  FaCalendarAlt,
  FaCamera,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

const init = {
  current: "",
  new: "",
  confirm: "",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user.fullName,
    username: user.username,
    email: user.email,
    phone: user?.phone ?? "xxxxxxxxx",
    address: user?.address ?? "Việt Nam",
    role: Array.isArray(user.roles)
      ? user.roles.map((r) => r.replace("ROLE_", "")).join(", ")
      : user.roles?.replace("ROLE_", "") || "User",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwords, setPasswords] = useState(init);

  const [avatar, setAvatar] = useState(
    user?.urlImage ?? "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value.trim() });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (passwords.new !== passwords.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      setIsSubmitting(false);
      return;
    }
    const res = await callApi("post", "/auth/change-password", {
      oldPassword: passwords.current,
      newPassword: passwords.confirm,
    });
    alert(res.message);
    setIsSubmitting(false);
    setPasswords(init);
    return;
  };

  const handleEditProfile = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const isAvatarChanged = user.urlImage !== avatar;
    const isInfoChanged =
      tempProfile.name !== profile.name ||
      tempProfile.phone !== profile.phone ||
      tempProfile.address !== profile.address;

    if (!isAvatarChanged && !isInfoChanged) {
      alert("Không có thay đổi nào để cập nhật!");
      setIsEditing(false);
      return;
    }

    const formData = new FormData();

    // Gắn dữ liệu JSON vào phần "data"
    const userData = {
      fullName: tempProfile.name,
      phone: tempProfile.phone,
      address: tempProfile.address,
    };
    formData.append(
      "data",
      new Blob([JSON.stringify(userData)], { type: "application/json" })
    );

    // Nếu avatar đổi thì thêm file ảnh vào formData
    const fileInput = document.getElementById("avatarInput");
    if (isAvatarChanged && fileInput?.files?.length > 0) {
      formData.append("image", fileInput.files[0]);
    }

    const res = await callApi("put", "/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!res.success) {
      alert(res.message);
      setIsEditing(false);
      return;
    }

    alert(res.message || "Cập nhật thông tin thành công!");
    setUser(res.data);
    setIsEditing(false);
    navigate("/");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header gradient */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-10 text-center text-2xl font-semibold z-0">
        <button
          onClick={() => navigate("/")}
          className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition"
        >
          <FaArrowLeft />
          <span className="text-sm font-medium">Back to home</span>
        </button>
      </div>

      {/* Card chính */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg -mt-16 p-8 top-12 relative z-10">
        {/* Thông tin cơ bản */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 border-b pb-6">
          <div className="relative group">
            <img
              src={avatar}
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
            />
            {/* Nút chọn ảnh */}
            <label
              htmlFor="avatarInput"
              className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition"
            >
              <FaCamera size={16} />
            </label>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">
              {profile.name}
            </h2>
            <p className="text-gray-500">{profile.email}</p>
            <button
              onClick={handleEditProfile}
              className="mt-2 px-4 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Thông tin cá nhân */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">
              Personal Information
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center gap-3">
                <FaUser className="text-indigo-500" />
                <span>Username: {profile.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-indigo-500" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-indigo-500" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-indigo-500" />
                <span>{profile.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaUserShield className="text-indigo-500" />
                <span>{profile.role}</span>
              </div>
            </div>
          </div>

          {/* Đổi mật khẩu */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">
              Change Password
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                name="current"
                placeholder="Current password"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password"
                name="new"
                placeholder="New password"
                value={passwords.new}
                onChange={handlePasswordChange}
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password"
                name="confirm"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 rounded-md transition ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal edit profile */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Profile
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={tempProfile.name}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, name: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="text"
                placeholder="Phone"
                value={tempProfile.phone}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, phone: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="text"
                placeholder="Address"
                value={tempProfile.address}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, address: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
