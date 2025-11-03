import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export default function VerifyAccountPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    setLoading(true);
    const res = await callApi("post", "/auth/verify", { email, code });

    if (!res.success) {
      alert("❌ Invalid verification code.");
      setLoading(false);
      return;
    }

    alert("✅ Account verified! You can now login.");
    setLoading(false);
    navigate("/login");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-gray-500 max-w-96 mx-auto mt-12 md:py-10 md:px-6 px-4 py-8 text-left text-sm rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Two-factor Authentication
      </h2>
      <p>Please enter the 8-digit verification code sent to your email.</p>

      <input
        type="email"
        required
        className="w-full border rounded mt-4 p-2"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="flex items-center justify-between mt-4 mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            className="otp-input w-10 h-10 border border-gray-300 outline-none rounded text-center text-lg focus:border-indigo-500/60 transition duration-300"
            required
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-800 py-2.5 rounded text-white active:scale-95 transition"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
