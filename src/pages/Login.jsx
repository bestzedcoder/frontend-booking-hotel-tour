import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "./common/AuthForm";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(username, password);
    console.log("Login:", { username, password });
    setIsLoading(false);
  };

  const handleLoginGoogle = async (e) => {
    console.log("google");
    window.location.href =
      "http://localhost:8080/api/oauth2/authorization/google";
  };

  return (
    <AuthForm
      title="Sign In"
      onSubmit={handleSubmit}
      buttonText={
        isLoading ? (
          <div className="flex justify-center items-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Logging in...
          </div>
        ) : (
          "Login"
        )
      }
      disabled={isLoading}
      isGoogle={true}
      onGoogleClick={handleLoginGoogle}
      fields={[
        {
          label: "Username",
          name: "username",
          type: "text",
          value: username,
          onChange: (e) => setUsername(e.target.value.trim()),
          required: true,
          placeholder: "Enter your username",
        },
        {
          label: "Password",
          name: "password",
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value.trim()),
          required: true,
          placeholder: "Enter your password",
        },
      ]}
      footer={
        <>
          <div className="flex justify-end w-full mt-1 mb-2">
            <Link
              to="/forget-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="flex flex-col items-center gap-2 mt-2">
            <p>
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-medium hover:underline"
              >
                Sign Up
              </Link>
            </p>
            <Link
              to="/client/dashboard"
              className="text-gray-500 hover:text-blue-600 transition font-medium text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </>
      }
    />
  );
}
