import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import API_ENDPOINTS from "@/lib/apiEndpoints.js";
import api from "@/lib/axios.js";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandler.js";

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
      try {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
      } catch (error) {
        // Add more context to the error
        const enhancedError = {
          ...error,
          timestamp: new Date().toISOString(),
        };
        throw enhancedError;
      }
    },
    onSuccess: (data) => {
      toast.success("Login successful!");
      setTimeout(() => {
        login(data.data.user, data.data.token);
        navigate(
          data.data.user.role === "TENANT"
            ? "/tenant/dashboard"
            : "/landlord/dashboard"
        );
      }, 1500);
    },
    onError: (err) => {
      handleApiError(err, toast, "Login", {
        defaultMessage: "Invalid email or password. Please try again.",
        duration: 5000,
        showDetails: true,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.email || !formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.password || !formData.password.trim()) {
      toast.error("Password is required");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    loginMutation.mutate(formData);
  };

  const { isPending } = loginMutation;

  // Demo credentials (these must match users in your Supabase database)
  const demoEmail = "landlord@test.com";
  const demoPassword = "password123";
  const tenantEmail = "workingtest@example.com";
  const tenantPassword = "password123";

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const fillDemo = () => {
    setFormData({ email: demoEmail, password: demoPassword });
    toast.success("Demo credentials filled");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white px-8 py-10 rounded-2xl shadow-lg border border-gray-200"
          autoComplete="off"
        >
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Login
          </h1>
          <div className="mb-4">
            <label className="block mb-1 text-black font-medium">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isPending}
              autoComplete="off"
              className="w-full p-2 border border-gray-300 rounded disabled:opacity-50"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-black font-medium">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isPending}
              autoComplete="new-password"
              className="w-full p-2 border border-gray-300 rounded disabled:opacity-50"
            />
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-gray-600 hover:text-black hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-lg text-white p-2 rounded-2xl hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed py-6"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-black font-semibold hover:underline ml-3"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
      {/* Demo Login section (outside the login card) */}
      <div className="w-full max-w-md mt-20">
        <h2 className="text-lg font-semibold text-black mb-2">Demo Login</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-3 rounded-md border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">Landlord</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={fillDemo}
                className="h-8 w-8 border-gray-300"
                title="Fill landlord credentials"
              >
                <Copy className="h-4 w-4 text-black" />
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-md border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">Tenant</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setFormData({ email: tenantEmail, password: tenantPassword });
                  toast.success("Demo tenant credentials filled");
                }}
                className="h-8 w-8 border-gray-300"
                title="Fill tenant credentials"
              >
                <Copy className="h-4 w-4 text-black" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
