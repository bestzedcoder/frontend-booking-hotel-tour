import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "./common/AuthForm";
import { useApi } from "../hooks/useApi";
import { Mail, CheckCircle2 } from "lucide-react";

export const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { callApi } = useApi();

  const handleRequestEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await callApi("post", "auth/forget-password", { email });
      if (res.success) {
        setStep(2);
      } else {
        setErrorMessage(res.message || "Email không tồn tại trong hệ thống.");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await callApi("post", "auth/reset-password", {
        email,
        code: otp,
      });
      if (res.success) {
        alert("Xác thực thành công! Mật khẩu mới đã được gửi về email.");
        navigate("/login");
      } else {
        setErrorMessage("Mã xác thực không chính xác.");
      }
    } catch (error) {
      setErrorMessage("Xác thực thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AuthForm
            title="Quên mật khẩu?"
            onSubmit={handleRequestEmail}
            buttonText={isLoading ? "Đang xử lý..." : "Gửi mã xác nhận"}
            disabled={isLoading}
            isGoogle={false}
            fields={[
              {
                label: "Email của bạn",
                name: "email",
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                placeholder: "nhap-email@example.com",
              },
            ]}
            footer={
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition flex items-center justify-center gap-1"
              >
                ← Quay lại đăng nhập
              </Link>
            }
          />
        </div>
      )}

      {step === 2 && (
        <div className="animate-in zoom-in-95 duration-500 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Kiểm tra hòm thư
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Chúng tôi đã gửi mã xác thực đến: <br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block mb-3 text-xs uppercase tracking-widest font-bold text-gray-400">
                Mã xác thực (OTP)
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-3xl tracking-[0.5em] font-mono p-4 bg-gray-50 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Xác nhận mã OTP
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-gray-400 hover:text-indigo-600 transition font-medium underline underline-offset-4"
            >
              Gửi lại cho email khác
            </button>
          </form>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center gap-2 animate-bounce">
          <span className="font-bold">Lỗi:</span> {errorMessage}
        </div>
      )}
    </>
  );
};
