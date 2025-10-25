import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import API_ENDPOINTS from "../../lib/apiEndpoints";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
      return response.data;
    },
    onSuccess: (data) => {
      setTimeout(() => {
        login(data.data.user, data.data.token);
        navigate(
          data.data.user.role === "TENANT"
            ? "/tenant/dashboard"
            : "/landlord/dashboard"
        );
      }, 1500);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const { isPending, error, isSuccess } = loginMutation;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Success message */}
        {isSuccess && (
          <div className="mb-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded">
            Login successful!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded">
            {error.response?.data?.message || error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full p-2 border rounded disabled:opacity-50"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full p-2 border rounded disabled:opacity-50"
            />
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-700 text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-blue-500 hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
