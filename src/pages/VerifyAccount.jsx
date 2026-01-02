import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { Lock, Mail } from "lucide-react";

export default function VerifyAccountPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const { callApi } = useApi();
  const navigate = useNavigate();

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(otp);
    const code = otp.join("");
    if (code.length !== 6) {
      alert("Mã xác thực phải đủ 6 chữ số.");
      return;
    }

    setLoading(true);

    const payload = {
      email: email.trim(),
      code: otp
        .reduce((cur, val) => {
          return cur + val;
        }, "")
        .trim(),
    };

    const res = await callApi("post", "auth/verify", payload);

    if (!res.success) {
      alert("❌ Mã xác thực không hợp lệ hoặc email sai.");
      setLoading(false);
      setOtp(["", "", "", "", "", ""]);
      return;
    }

    alert("✅ Tài khoản đã được xác thực! Bây giờ bạn có thể đăng nhập.");
    setLoading(false);
    navigate("/login");
  };

  return (
    <form onSubmit={handleSubmit} className="text-gray-600 w-full">
      <div className="flex justify-center mb-6">
        <Lock className="w-10 h-10 text-indigo-500" />
      </div>

      <h2 className="text-3xl font-extrabold mb-3 text-center text-gray-800">
        Xác thực Tài khoản
      </h2>
      <p className="text-center mb-6 text-sm">
        Vui lòng nhập mã xác thực gồm 6 chữ số đã được gửi tới email của bạn.
      </p>

      <div className="relative mb-6">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="email"
          required
          className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition duration-200"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mt-4 mb-8 space-x-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="otp-input w-10 h-12 border-2 border-gray-300 outline-none rounded-lg text-center text-xl font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-300"
            required
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || otp.join("").length !== 6}
        className={`w-full py-3 rounded-lg text-white text-lg font-bold transition transform shadow-md ${
          loading || otp.join("").length !== 6
            ? "bg-gray-400 cursor-not-allowed shadow-none"
            : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] active:shadow-sm"
        }`}
      >
        {loading ? "Đang xác thực..." : "Xác thực"}
      </button>

      <div className="mt-6 text-center text-sm text-gray-500">
        <a href="#" className="hover:text-indigo-600 transition">
          Không nhận được mã? Gửi lại
        </a>
      </div>
    </form>
  );
}
