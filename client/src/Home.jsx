import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PLAN_CATALOG, PlanCard } from "./Plans";

import {
  Shield,
  Zap,
  ArrowRight,
  Lock,
  HardDrive,
  Settings,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("payment_success") === "true") {
      toast.success("Payment completed successfully!");
      searchParams.delete("payment_success");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {[
            {
              icon: Shield,
              label: "Enterprise-Grade Security",
              desc: "Secure access with OAuth (Google & GitHub) and encrypted storage. Your data is protected by industry-leading security standards.",
            },
            {
              icon: HardDrive,
              label: "Intelligent File Management",
              desc: "Upload any file type with drag-and-drop ease. Organize with grid views, powerful search, and instant previews for documents and media.",
            },
            {
              icon: Lock,
              label: "Advanced Sharing Controls",
              desc: "Share securely with granular permissions. Control who views or edits your files with role-based access and real-time activity logs.",
            },
            {
              icon: Settings,
              label: "Comprehensive Admin Tools",
              desc: "Manage users, monitor storage usage, and control system-wide settings from a powerful, centralized dashboard.",
            },
            {
              icon: Zap,
              label: "Lightning Fast Performance",
              desc: "Experience zero latency with optimized global content delivery, ensuring your files are always available when you need them.",
            },
          ].map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className={`card-hover flex flex-col gap-4 p-6 bg-[#111] border-2 border-[#facc15]/40 hover:border-[#facc15] ${i % 3 !== 0 ? "lg:border-l-0" : ""} ${i % 2 !== 0 ? "sm:border-l-0" : ""} ${i > 2 ? "lg:border-t-0" : ""} ${i > 1 ? "sm:border-t-0" : ""}`}
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

        {/* Pricing Section */}
        <div className="mt-32 pt-32 border-t-2 border-[#facc15]/20">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.0] mb-6 uppercase">
              Simple, transparent <span className="text-[#facc15]">pricing</span>
            </h2>
            <p className="text-white/60 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
              No hidden fees. No unexpected charges. Just pure storage power for individuals and teams.
            </p>
          </div>

          <div className="grid gap-10 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {PLAN_CATALOG.monthly.map((plan, index) => (
              <PlanCard
                key={`home-monthly-${plan.name}-${index}`}
                plan={plan}
                onSelect={() => navigate("/plans")}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/plans"
              className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white font-black border-2 border-white/40 hover:border-[#facc15] hover:text-[#facc15] hover:bg-white/5 transition-all duration-150 uppercase tracking-wide text-sm"
            >
              View all plans & billing options
            </Link>
          </div>
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
