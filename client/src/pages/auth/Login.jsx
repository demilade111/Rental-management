import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import API_ENDPOINTS from "@/lib/apiEndpoints.js";
import api from "@/lib/axios.js";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // <-- import toast

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

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
      // Clear all cached queries to prevent showing stale data from previous user
      queryClient.clear();
      console.log("🧹 Cleared all React Query cache on login");

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
      // Prevent default error handling to avoid page blinking
      console.error("Login error:", err);

      // Handle different error response formats
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.data?.message ||
        err.message ||
        "Invalid email or password. Please try again.";

      // Show toast with longer duration
      toast.error(errorMessage, {
        duration: 5000, // Show for 5 seconds
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const { isPending } = loginMutation;

  // Demo credentials
  const demoEmail = "landlord@test.com";
  const demoPassword = "password123";
  const tenantEmail = "tenant@test.com";
  const tenantPassword = "password123";

  // const copyToClipboard = async (text, label) => {
  //   try {
  //     await navigator.clipboard.writeText(text);
  //     toast.success(`${label} copied`);
  //   } catch {
  //     toast.error(`Failed to copy ${label}`);
  //   }
  // };

  const fillDemo = () => {
    setFormData({ email: demoEmail, password: demoPassword });
    toast.success("Demo credentials filled");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary p-4">
      <div className="w-full max-w-sm">
          {/* Header Logo */}
          <div className="flex items-center justify-center mb-10">
            <svg width="146" height="32" viewBox="0 0 146 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_2022_11575)">
                <path d="M8.93529 25.3291V15.7338C8.93529 15.5693 9.31214 15.0203 9.43839 14.8596L18.0198 5.99706C18.4578 5.62978 19.0948 5.58195 19.6075 5.79046C22.0828 7.35332 24.6251 8.83775 27.066 10.4503C28.361 11.3054 29.4552 11.688 29.591 13.4326C29.8952 17.291 29.3672 21.5529 29.5757 25.4534C29.4973 26.6853 28.4337 27.571 27.2286 27.0909C24.5007 25.1837 21.5242 23.5711 18.8194 21.639C18.3488 21.3024 17.7749 20.8586 17.6066 20.2808C17.377 19.4966 17.3828 16.1375 17.6066 15.3168C17.9165 14.1786 19.751 13.9701 20.5027 14.8137C21.2545 15.6573 20.6979 17.9165 20.8872 18.9743L26.1918 22.3908V13.8515L19.4621 9.60674L19.1886 9.54935L12.2791 16.7859L12.2293 28.7647C12.0228 29.9239 10.7794 30.5953 9.73107 29.9947L0.996664 23.9479C-0.263952 23.0412 0.11672 21.7079 0.126284 20.4186C0.149239 17.2144 -0.162567 13.3216 0.118633 10.2189C0.200888 9.30259 0.753723 8.76314 1.36012 8.15483C3.34765 6.15965 5.5456 4.21804 7.60773 2.28407C8.85304 1.11719 9.87263 -0.744084 11.7741 0.315675C12.8664 0.923984 15.2518 2.34337 16.1394 3.11046C17.4382 4.23143 16.5086 6.38729 14.8615 6.13287C14.6492 6.10035 14.4235 5.94541 14.2322 5.84593C13.1629 5.2931 12.0897 4.41507 11.0414 3.79528L10.8616 3.78572L4.75556 9.53405L3.44521 10.8865V21.4994L3.70919 21.7863L8.93338 25.3291H8.93529Z" fill="#FFBA53" />
                <path d="M36.1061 19.0851V25.3748C36.1061 26.0386 34.945 26.7138 34.3156 26.7138C33.6863 26.7138 32.5251 26.0386 32.5251 25.3748V15.4123H40.8329C41.3475 15.4123 42.5603 14.6892 42.9467 14.3123C46.0265 11.3186 42.83 6.10016 38.6771 7.65346C37.3897 8.13551 36.1061 9.74619 36.1061 11.1407V13.6658H32.5251V10.498C32.5251 8.18525 34.8837 5.43255 36.8981 4.49714C43.8936 1.24517 50.7935 9.28135 46.4608 15.7145C43.9759 19.4045 40.1194 19.1846 36.1042 19.0832L36.1061 19.0851Z" fill="#FFBA53" />
                <path d="M101.191 5.12866V8.61783H93.113V14.0352H97.2889C97.5893 14.0352 98.1765 14.3566 98.3946 14.5823C99.2286 15.4489 99.0125 16.983 97.9183 17.5091C97.8303 17.5512 97.4324 17.708 97.3827 17.708H93.1149V23.1254H99.5863C99.8618 23.1254 100.438 23.4258 100.646 23.6266C101.277 24.2388 101.375 25.1704 100.904 25.9107C100.747 26.1593 100.145 26.7064 99.8637 26.7064H89.5359V5.12866H101.195H101.191Z" fill="#FFBA53" />
                <path d="M76.4059 26.7062V31.8482H72.8249V23.2171C73.1769 23.2668 73.5289 23.1711 73.8656 23.1597C76.0558 23.0774 78.9061 23.4734 81.0333 23.1176C86.1676 22.2625 84.6219 14.1345 79.4302 15.3626C78.1562 15.6648 76.4059 17.2067 76.4059 18.5801V21.4725H72.9627C72.9531 21.4725 72.8249 21.3443 72.8249 21.3347V18.5801C72.8249 15.9652 75.2486 13.1417 77.5996 12.2464C84.5282 9.61044 90.6821 17.4687 86.4315 23.5595C85.4406 24.9789 83.0017 26.7062 81.2246 26.7062H76.4059Z" fill="#FFBA53" />
                <path d="M141.95 17.4322C141.018 15.3241 138.063 14.6317 136.228 15.9784C134.04 17.5852 133.963 20.709 136.123 22.3886C138.068 23.8998 140.995 22.446 142.411 23.5363C143.624 24.4698 143.126 26.5281 141.537 26.706C138.088 27.0944 135.01 26.4899 132.722 23.7678C128.05 18.2127 133.495 10.1956 140.446 12.0014C143.945 12.91 146.629 16.7627 145.869 20.3857C145.829 20.5732 145.833 20.9386 145.655 20.9979L137.889 20.9864C136.504 20.841 135.74 19.2533 136.626 18.1189C136.817 17.8741 137.481 17.4303 137.774 17.4303H141.95V17.4322Z" fill="#FFBA53" />
                <path d="M112.024 22.5742V26.4306C107.594 27.7486 102.729 24.6248 102.381 19.9611C101.761 11.6476 112.538 8.56009 116.445 15.9937C117.569 18.1343 117.56 22.4039 117.351 24.8276C117.129 27.4043 114.002 27.1843 113.768 25.0992C113.422 22.0137 115.056 16.8163 111.155 15.5002C106.916 14.0712 103.942 19.5977 107.431 22.3465C108.78 23.4101 110.551 23.3432 112.024 22.5742Z" fill="#FFBA53" />
                <path d="M62.9845 11.7662C67.8012 11.3473 71.8375 15.5825 71.0551 20.3897C70.0297 26.6851 62.1064 28.9615 57.9573 24.0874C54.0396 19.4849 56.9779 12.2904 62.9845 11.7681V11.7662ZM63.3536 15.2535C57.8769 15.6341 59.0553 24.2959 64.4957 23.1003C69.2225 22.0616 68.2297 14.9149 63.3536 15.2535Z" fill="#FFBA53" />
                <path d="M129.649 11.7395V15.2287L123.647 15.2382C122.105 15.4334 122.216 17.2851 123.45 17.4343C124.567 17.5701 125.458 17.3118 126.644 17.7269C130.836 19.1999 130.549 25.4207 126.323 26.5474C125.231 26.8382 121.818 26.8172 120.601 26.71C118.522 26.5264 118.52 23.5633 120.259 23.2381C121.659 22.976 123.519 23.4045 124.988 23.1941C126.457 22.9837 126.449 21.3252 125.428 21.0573C124.701 20.8661 123.528 21.0688 122.648 20.8986C118.84 20.1602 117.677 15.1866 120.699 12.7514C121.206 12.344 122.445 11.7395 123.084 11.7395H129.648H129.649Z" fill="#FFBA53" />
                <path d="M55.3845 11.7395V15.1828C55.3845 15.3645 54.671 15.3148 54.4625 15.3626C49.9939 16.3688 51.8609 22.0215 51.4305 25.1835C51.155 27.2093 48.0561 27.2514 47.8552 25.0114C47.7118 23.4122 47.75 20.6595 47.8552 19.0354C48.0982 15.2612 51.5472 11.7395 55.3864 11.7395H55.3845Z" fill="#FFBA53" />
              </g>
              <defs>
                <clipPath id="clip0_2022_11575">
                  <rect width="146" height="31.8483" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        <form
          onSubmit={handleSubmit}
          className="bg-background px-8 py-10 rounded-2xl shadow-lg border border-border"
          autoComplete="off"
        >
          <div className="flex flex-col gap-0 my-4">
            <h1 className="text-2xl font-bold text-left mb-2 text-foreground">
              Login
            </h1>
            <p className="text-sm text-foreground/80 mb-6">
              Please login to your account
            </p>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-foreground font-medium">Email</label>
            <div className="relative">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isPending}
                autoComplete="off"
                placeholder="your@email.com"
                className="w-full p-2 pr-10 rounded disabled:opacity-50 bg-card text-foreground placeholder:text-foreground/50"
              />
              <div className="absolute inset-y-0 right-3 flex items-center text-foreground/70 pointer-events-none">
                <Mail className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <label className="block mb-1 text-foreground font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isPending}
                autoComplete="new-password"
                placeholder="Enter your password"
                className="w-full p-2 pr-12 rounded disabled:opacity-50 bg-card text-foreground placeholder:text-foreground/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 z-10 flex items-center text-foreground/70 hover:text-foreground cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-foreground/80 hover:text-foreground hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-lg text-primary-foreground p-2 rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed py-6"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>

          <div className="mt-4 text-center text-sm text-foreground/80">
            Don't have an account?
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-foreground font-semibold hover:underline ml-3"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
      {/* Demo Login section (outside the login card) */}
      <div className="w-full max-w-sm mt-20">
        <h2 className="text-lg font-semibold text-background mb-2">Demo Login</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-3 rounded-md border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Landlord</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={fillDemo}
                className="h-8 w-8 border-gray-300 hover:bg-gray-100"
                title="Fill landlord credentials"
              >
                <Copy className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-md border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Tenant</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setFormData({ email: tenantEmail, password: tenantPassword });
                  toast.success("Demo tenant credentials filled");
                }}
                className="h-8 w-8 border-gray-300 hover:bg-gray-100"
                title="Fill tenant credentials"
              >
                <Copy className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
