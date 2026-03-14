import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithGoogle } from "./api/authApi";
import { useGoogleLogin } from "@react-oauth/google";
import { loginUser, fetchUser } from "./api/userApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { HardDrive } from "lucide-react";
const BASE_URL = import.meta.env.VITE_SERVER_URL;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Redirect already-logged-in users
  useEffect(() => {
    fetchUser()
      .then(() => navigate("/directory", { replace: true }))
      .catch(() => setIsCheckingAuth(false));
  }, []);

  if (isCheckingAuth) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (serverError) setServerError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError("");
    try {
      const data = await loginUser(formData);
      if (data.error) {
        const errorMessages =
          typeof data.error === "object"
            ? Object.values(data.error).flat().join(" ")
            : data.error;
        setServerError(errorMessages);
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorData = err.response?.data?.error;
      const errorMessage =
        typeof errorData === "object"
          ? Object.values(errorData).flat().join(" ")
          : errorData || "Something went wrong. Please try again.";
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (res) => {
      try {
        await loginWithGoogle(res.code);
        navigate("/");
      } catch (err) {
        toast.error(err.response?.data?.error || "Google login failed");
      }
    },
    flow: "auth-code",
    ux_mode: "popup",
    onError: (error) => {
      toast.error(error?.response?.data?.error || "Google auth failed");
    },
  });

  const loginWithGithub = () => {
    window.location.href = `${BASE_URL}/user/github`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid bg */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[#facc15] flex items-center justify-center border-2 border-black shadow-brutal-sm">
            <HardDrive className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase">
            Store<span className="text-[#facc15]">my</span>files
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#111] border-2 border-[#facc15] shadow-[6px_6px_0px_0px_#facc15] px-8 py-8">
          <div className="mb-7">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Sign in
            </h2>
            <p className="text-sm text-white/50 mt-1 font-medium">
              Enter your credentials to access your vault.
            </p>
          </div>

          {serverError && (
            <div className="mb-5 p-3 bg-red-950 text-red-300 text-xs border-2 border-red-500 font-bold flex items-center gap-2">
              <span className="text-red-400">✕</span>
              {serverError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-black text-white/70 mb-2 uppercase tracking-widest"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-black text-white/70 mb-2 uppercase tracking-widest"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-12 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-[#facc15] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 bg-[#facc15] text-black text-sm font-black uppercase tracking-wide border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-150 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in to Vault →"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-bold uppercase tracking-widest">
              Or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social */}
          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 bg-[#0a0a0a] border-2 border-white/20 text-sm font-bold text-white hover:border-[#facc15] hover:bg-[#111] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={loginWithGithub}
              className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 bg-[#0a0a0a] border-2 border-white/20 text-sm font-bold text-white hover:border-[#facc15] hover:bg-[#111] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 .297a12 12 0 00-3.794 23.394c.6.111.82-.26.82-.577v-2.234c-3.338.726-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.758-1.333-1.758-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.305-5.466-1.333-5.466-5.93 0-1.31.468-2.382 1.235-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.403c1.019.005 2.046.138 3.003.404 2.29-1.553 3.296-1.23 3.296-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.803 5.624-5.475 5.921.43.37.815 1.102.815 2.222v3.293c0 .32.218.694.825.576A12.003 12.003 0 0012 .297z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-white/40 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-black text-[#facc15] hover:underline uppercase"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
