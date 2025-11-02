import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import API_ENDPOINTS from "../../lib/apiEndpoints";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "TENANT",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
      return res.data;
    },

    onSuccess: (data) => {
      // Authenticate immediately (token available right away)
      login(data.data.user, data.data.user.token);

      // Extract redirect param (if lease invite)
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect");

      // Now delay ONLY the navigation
      setTimeout(() => {
        if (redirect) {
          navigate(redirect);
          return;
        }

        navigate("/dashboard");
      }, 1500);  // 1.5s UI fade delay
    },

  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const { isPending, error, isSuccess } = registerMutation;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {isSuccess && (
          <div className="mb-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded">
            Registration successful!
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded">
            {error.response?.data?.message || error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

          <div className="mb-4">
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              required
              disabled={isPending}
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              disabled={isPending}
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              disabled={isPending}
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              disabled={isPending}
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              disabled={isPending}
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Role</label>
            <select
              name="role"
              disabled={isPending}
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="TENANT">Tenant</option>
              <option value="ADMIN">Landlord</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-700 text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? "Signing up..." : "Sign Up"}
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
