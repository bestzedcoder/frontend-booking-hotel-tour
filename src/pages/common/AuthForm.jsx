export default function AuthForm({
  title,
  onSubmit,
  isGoogle,
  fields,
  buttonText,
  footer,
  disabled = false,
  onGoogleClick,
}) {
  return (
    <form onSubmit={onSubmit} className="text-gray-700 w-full max-w-md mx-auto">
      {/* Header Form */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          {title} <span className="text-blue-500">🌍</span>
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Khám phá những điểm đến tuyệt vời cùng chúng tôi
        </p>
      </div>

      {/* Dynamic Fields */}
      {fields.map((field, i) => (
        <div key={i} className="mb-5">
          <label className="block mb-1.5 text-sm font-semibold text-gray-700">
            {field.label}
          </label>
          <div className="relative">
            <input
              {...field}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white outline-none transition duration-200 ease-in-out shadow-sm"
            />
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled}
        className={`w-full mt-4 py-3.5 text-white text-lg font-bold rounded-xl transition all duration-300 shadow-lg ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]"
        }`}
      >
        {buttonText}
      </button>

      {/* Google Login Option */}
      {isGoogle && (
        <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">
                Hoặc tiếp tục với hành trình
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleClick}
            disabled={disabled}
            className={`w-full py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 transition flex items-center justify-center gap-3 shadow-sm ${
              disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.99]"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google</span>
          </button>
        </>
      )}

      {/* Footer Link */}
      {footer && (
        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          {footer}
        </div>
      )}
    </form>
  );
}
