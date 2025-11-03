export default function AuthForm({
  title,
  onSubmit,
  fields,
  buttonText,
  footer,
  disabled = false,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white text-gray-700 max-w-md mx-auto mt-20 p-8 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        {title}
      </h2>

      {fields.map((field, i) => (
        <div key={i} className="mb-4">
          <label className="block mb-1 font-medium">{field.label}</label>
          <input
            {...field}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={disabled}
        className={`w-full mt-4 py-2 text-white font-medium rounded transition ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
        }`}
      >
        {buttonText}
      </button>

      {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
    </form>
  );
}
