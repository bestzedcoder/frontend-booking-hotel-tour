import React from "react";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
      {/* Logo */}
      <a href="/" className="font-bold text-indigo-600 text-xl">
        MyApp
      </a>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        {user ? (
          <>
            <a href="/">Home</a>
            <a href="/profile">Profile</a>
            <a href="/secret">Secret</a>

            <button
              onClick={logout}
              className="cursor-pointer px-8 py-2 bg-gray-300 hover:bg-gray-400 transition rounded-full"
            >
              Logout
            </button>
          </>
        ) : (
          <a
            href="/login"
            className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
          >
            Login
          </a>
        )}
      </div>

      {/* Mobile Menu */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        className="sm:hidden"
      >
        <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
          <rect width="21" height="1.5" rx=".75" fill="#426287" />
          <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
          <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden">
          {user ? (
            <>
              <a href="/">Home</a>
              <a href="/profile">Profile</a>
              <a href="/secret">Secret</a>
              <button
                onClick={logout}
                className="cursor-pointer px-6 py-2 mt-2 bg-gray-300 hover:bg-gray-400 transition rounded-full text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm"
            >
              Login
            </a>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
