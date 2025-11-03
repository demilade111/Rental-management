import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import API_ENDPOINTS from "../../lib/apiEndpoints";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // <-- import toast

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
      toast.success("Registration successful!"); // <-- toast success
      // Authenticate immediately
      login(data.data.user, data.data.user.token);

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect");

      setTimeout(() => {
        if (redirect) {
          navigate(redirect);
          return;
        }
        navigate("/dashboard");
      }, 1500);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message); // <-- toast error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const { isPending } = registerMutation;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white px-8 py-10 rounded shadow">
          <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

          <div className="mb-4">
            <label className="block mb-1">First Name</label>
            <Input
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
            <Input
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
            <Input
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
            <Input
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
            <Input
              type="tel"
              name="phone"
              required
              disabled={isPending}
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1">Role</label>
            <Select
              disabled={isPending}
              value={formData.role}
              onValueChange={(value) => handleChange({ target: { name: "role", value } })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TENANT">Tenant</SelectItem>
                <SelectItem value="ADMIN">Landlord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-700 text-lg text-white p-2 py-6 rounded-2xl hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? "Signing up..." : "Sign Up"}
          </Button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:underline ml-3"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
