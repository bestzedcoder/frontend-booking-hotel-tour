import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-gray-50 min-h-screen">
      <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        404 Not Found
      </h1>

      <div className="h-1 w-40 rounded bg-gradient-to-r from-blue-400 to-indigo-600 my-6"></div>

      <p className="text-base md:text-lg text-gray-600 max-w-md mb-10">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <Link
        to="/"
        className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium shadow-md active:scale-95 transition-all"
      >
        Back to Home
        <svg
          className="group-hover:translate-x-1 transition-transform"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.583 11h12.833m0 0L11 4.584M17.416 11 11 17.417"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
