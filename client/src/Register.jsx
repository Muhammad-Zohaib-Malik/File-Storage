import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithGoogle, sendOtp, verifyOtp } from "./api/authApi";
import { registerUser, fetchUser } from "./api/userApi";
import { useGoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { HardDrive } from "lucide-react";
import AuthLoader from "./components/AuthLoader";
const BASE_URL = import.meta.env.VITE_SERVER_URL;

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // Redirect already-logged-in users
  useEffect(() => {
    fetchUser()
      .then(() => navigate("/directory", { replace: true }))
      .catch(() => setIsCheckingAuth(false));
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // All hooks above — safe to render conditionally now
  if (isCheckingAuth) return <AuthLoader />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setServerError("");
      setOtpError("");
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
      setStep(1);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return setOtpError("Please enter your email first.");
    try {
      setIsSending(true);
      await sendOtp(formData.email);
      setOtpSent(true);
      setCountdown(60);
      setOtpError("");
      setStep(2);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setOtpError("Please enter OTP.");
    try {
      setIsVerifying(true);
      await verifyOtp(formData.email, otp);
      setOtpVerified(true);
      setOtpError("");
      setStep(3);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) return setOtpError("Please verify your email with OTP.");
    try {
      setIsSubmitting(true);
      const response = await registerUser({ ...formData, otp });
      if (response.error) {
        const errorMessages =
          typeof response.error === "object"
            ? Object.values(response.error).flat().join(" ")
            : response.error;
        setServerError(errorMessages);
      } else {
        setIsSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      const errorData = err.response?.data?.error;
      const errorMessage =
        typeof errorData === "object"
          ? Object.values(errorData).flat().join(" ")
          : errorData || "Something went wrong. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
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

  const steps = [
    { id: 1, label: "Account Info" },
    { id: 2, label: "Verify Email" },
    { id: 3, label: "Set Password" },
  ];

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
          <div className="mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-white/50 mt-1 font-medium">
              Verify your email to secure your vault.
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2">
            {steps.map((s, i) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide ${
                      isCompleted
                        ? "text-[#facc15]"
                        : isActive
                        ? "text-white"
                        : "text-white/30"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 flex items-center justify-center text-[10px] font-black border-2 shrink-0 ${
                        isCompleted
                          ? "bg-[#facc15] border-[#facc15] text-black"
                          : isActive
                          ? "border-white text-white"
                          : "border-white/20 text-white/30"
                      }`}
                    >
                      {isCompleted ? "✓" : s.id}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-px mx-2 ${
                        step > s.id ? "bg-[#facc15]" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {serverError && (
            <div className="mb-5 p-3 bg-red-950 text-red-300 text-xs border-2 border-red-500 font-bold flex items-center gap-2">
              <span>✕</span> {serverError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-xs font-black text-white/70 mb-2 uppercase tracking-widest">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium"
              />
            </div>

            {/* Email + OTP send */}
            <div>
              <label className="block text-xs font-black text-white/70 mb-2 uppercase tracking-widest">
                Email Address
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={otpSent}
                  className="flex-1 px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSending || countdown > 0 || otpSent}
                  className={`px-4 py-3 text-xs font-black border-2 uppercase tracking-wide shrink-0 transition-all duration-150 ${
                    isSending || countdown > 0 || otpSent
                      ? "bg-[#222] border-white/10 text-white/30 cursor-not-allowed"
                      : "bg-[#facc15] border-black text-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
                  }`}
                >
                  {isSending
                    ? "Sending..."
                    : countdown > 0
                    ? `${countdown}s`
                    : otpSent
                    ? "✓ Sent"
                    : "Send OTP"}
                </button>
              </div>
            </div>

            {/* OTP input */}
            {otpSent && (
              <div>
                <label className="block text-xs font-black text-white/70 mb-2 uppercase tracking-widest">
                  Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="otp"
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="flex-1 px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || otpVerified}
                    className={`px-4 py-3 text-xs font-black border-2 uppercase tracking-wide shrink-0 transition-all duration-150 ${
                      otpVerified
                        ? "bg-green-900 border-green-500 text-green-300 cursor-not-allowed"
                        : isVerifying
                        ? "bg-[#222] border-white/10 text-white/30 cursor-not-allowed"
                        : "bg-[#facc15] border-black text-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
                    }`}
                  >
                    {isVerifying ? "..." : otpVerified ? "✓ Verified" : "Verify"}
                  </button>
                </div>
                {otpError && (
                  <p className="mt-2 text-xs text-red-400 font-bold">{otpError}</p>
                )}
              </div>
            )}

            {/* Password */}
            {step >= 3 && otpVerified && (
              <div>
                <label className="block text-xs font-black text-white/70 mb-2 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 pr-12 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-[#facc15] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            {step >= 3 && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!otpVerified || isSuccess || isSubmitting}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 bg-[#facc15] text-black text-sm font-black uppercase tracking-wide border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-150 ${
                    !otpVerified || isSuccess || isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </>
                  ) : isSuccess ? (
                    <span className="flex items-center gap-2">
                      <FaCheckCircle /> Account Created! Redirecting...
                    </span>
                  ) : (
                    "Create my account →"
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-bold uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => googleLogin()}
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
            Already have an account?{" "}
            <Link to="/login" className="font-black text-[#facc15] hover:underline uppercase">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
