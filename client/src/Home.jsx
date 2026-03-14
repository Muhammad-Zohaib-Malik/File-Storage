import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUser } from "./api/userApi";
import AuthLoader from "./components/AuthLoader";
import {
  FolderOpen,
  Shield,
  Cloud,
  Zap,
  ArrowRight,
  Lock,
  HardDrive,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    fetchUser()
      .then(() => navigate("/directory", { replace: true }))
      .catch(() => setIsCheckingAuth(false)); // not logged in — show page
  }, []);

  if (isCheckingAuth) return <AuthLoader />;
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#facc15 1px, transparent 1px),
                            linear-gradient(90deg, #facc15 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 max-w-7xl mx-auto border-b-2 border-[#facc15]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#facc15] flex items-center justify-center border-2 border-black shadow-brutal-sm">
            <HardDrive className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase">
            Store<span className="text-[#facc15]">my</span>files
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-bold text-white hover:text-[#facc15] transition-colors px-4 py-2 border-2 border-white/20 hover:border-[#facc15] uppercase tracking-wide"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-black bg-[#facc15] text-black px-5 py-2.5 border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal transition-all duration-150 uppercase tracking-wide"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 px-6 sm:px-10 pt-20 sm:pt-32 pb-24 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          {/* Tag line */}
          <div className="inline-flex items-center gap-2 bg-[#facc15] text-black text-xs font-black px-3 py-1.5 border-2 border-black shadow-brutal-sm mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            Secure · Fast · S3-Backed
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.0] mb-8 uppercase">
            Your files,{" "}
            <span className="text-[#facc15]">
              everywhere
              <br />
              you need them.
            </span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl font-medium">
            Store, organize, and share with confidence. Private by default,
            blazing fast when it matters. Connected directly to S3.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              to="/directory"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-[#facc15] text-black font-black border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#facc15] transition-all duration-150 uppercase tracking-wide text-sm"
            >
              Open my files
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-7 py-4 bg-transparent text-white font-black border-2 border-white/40 hover:border-white hover:bg-white/5 transition-all duration-150 uppercase tracking-wide text-sm"
            >
              Create free account
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            {
              icon: Shield,
              label: "Encrypted & Secure",
              desc: "End-to-end encrypted at rest and in transit.",
            },
            {
              icon: Cloud,
              label: "Cloud Sync",
              desc: "Instantly synced to your S3 bucket.",
            },
            {
              icon: Zap,
              label: "Fast Uploads",
              desc: "Direct signed-URL uploads, zero middlemen.",
            },
            {
              icon: Lock,
              label: "You Own Your Data",
              desc: "Your bucket, your keys, your rules.",
            },
          ].map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className={`card-hover flex flex-col gap-4 p-6 bg-[#111] border-2 border-[#facc15]/40 hover:border-[#facc15] ${i > 0 ? "border-l-0" : ""}`}
            >
              <div className="w-11 h-11 bg-[#facc15] flex items-center justify-center border-2 border-black shrink-0">
                <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-16 flex flex-col sm:flex-row border-2 border-[#facc15]/30">
          {[
            { value: "10M+", label: "Files stored" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "< 1s", label: "Avg upload init" },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex-1 px-8 py-6 text-center ${i > 0 ? "border-l-2 border-[#facc15]/30" : ""}`}
            >
              <p className="text-4xl font-black text-[#facc15]">{value}</p>
              <p className="text-xs text-white/50 uppercase tracking-widest mt-1 font-bold">
                {label}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 sm:px-10 max-w-7xl mx-auto border-t-2 border-[#facc15]/20 flex items-center justify-between">
        <span className="text-xs text-white/30 font-bold uppercase tracking-widest">
          © 2026 Storemyfiles
        </span>
        <p className="text-xs text-white/30">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#facc15] font-black hover:underline"
          >
            Sign in →
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default Home;
