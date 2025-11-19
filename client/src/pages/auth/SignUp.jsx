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
import { Mail, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
      login(data.data.user, data.data.token);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-card px-8 py-10 rounded-2xl shadow-lg border border-border" autoComplete="off">
          <div className="flex flex-col gap-0 my-4">
            <h1 className="text-2xl font-bold text-left mb-2 text-primary">Sign Up</h1>
            <p className="text-sm text-foreground/80 mb-6">Create your account</p>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-primary font-medium">First Name</label>
            <Input
              type="text"
              name="firstName"
              required
              disabled={isPending}
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 rounded disabled:opacity-50 bg-card text-foreground placeholder:text-foreground/50"
              placeholder="First name"
              autoComplete="off"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-primary font-medium">Last Name</label>
            <Input
              type="text"
              name="lastName"
              required
              disabled={isPending}
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 rounded disabled:opacity-50 bg-card text-foreground placeholder:text-foreground/50"
              placeholder="Last name"
              autoComplete="off"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-primary font-medium">Email</label>
            <div className="relative">
              <Input
                type="email"
                name="email"
                required
                disabled={isPending}
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 pr-10 rounded disabled:opacity-50 bg-card text-foreground placeholder:text-foreground/50"
                placeholder="your@email.com"
                autoComplete="off"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-primary font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                disabled={isPending}
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 pr-12 rounded disabled:opacity-50 bg-card text-foreground placeholder:text-foreground/50"
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground z-10 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-full h-full" /> : <Eye className="w-full h-full" />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-primary font-medium">Phone</label>
            <Input
              type="tel"
              name="phone"
              required
              disabled={isPending}
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 rounded disabled:opacity-50 bg-card text-foreground placeholder:text-foreground/50"
              placeholder="(555) 000-0000"
              autoComplete="off"
            />
          </div>

          <div className="mb-10">
            <label className="block mb-1 text-primary font-medium">Role</label>
            <Select
              disabled={isPending}
              value={formData.role}
              onValueChange={(value) => handleChange({ target: { name: "role", value } })}
            >
              <SelectTrigger className="w-full bg-card text-foreground">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="TENANT">Tenant</SelectItem>
                <SelectItem value="ADMIN">Landlord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-lg text-primary-foreground p-2 rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed py-6"
          >
            {isPending ? "Signing up..." : "Sign Up"}
          </Button>

          <div className="mt-4 text-center text-sm text-foreground/80">
            Already have an account?
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary font-semibold hover:underline ml-3"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
