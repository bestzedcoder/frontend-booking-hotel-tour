import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "./common/AuthForm";
import { useApi } from "../hooks/useApi";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { callApi } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await callApi("post", "/auth/register", {
        username,
        email,
        password,
      });

      if (!res.success) {
        alert(res.message);
        return;
      }

      alert(res.message);
      navigate("/verify-account");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Sign Up"
      onSubmit={handleSubmit}
      buttonText={
        isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </div>
        ) : (
          "Create Account"
        )
      }
      disabled={isLoading}
      isGoogle={false}
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
          label: "Email",
          name: "email",
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value.trim()),
          required: true,
          placeholder: "Enter your email",
        },
        {
          label: "Password",
          name: "password",
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value.trim()),
          required: true,
          placeholder: "Enter password",
        },
        {
          label: "Confirm Password",
          name: "confirm",
          type: "password",
          value: confirm,
          onChange: (e) => setConfirm(e.target.value.trim()),
          required: true,
          placeholder: "Confirm password",
        },
      ]}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">
            Sign In
          </Link>
        </>
      }
    />
  );
}
