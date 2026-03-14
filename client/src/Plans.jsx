import { useState } from "react";
import { Link } from "react-router-dom";
import { createSubscription } from "./api/subscriptionApi";
import { Check, ArrowLeft } from "lucide-react";

export const PLAN_CATALOG = {
  monthly: [
    {
      id: "price_1SdlVw3cVYZiLez66kQLuZR4",
      name: "Starter",
      tagline: "Great for individuals",
      storage: "2 TB",
      price: 199,
      period: "/mo",
      cta: "Choose 2 TB",
      features: [
        "Secure cloud storage",
        "Link & folder sharing",
        "Basic support",
      ],
      popular: false,
    },
    {
      id: "price_1SdlVw3cVYZiLez66kQLuZR4",
      name: "Pro",
      tagline: "For creators & devs",
      storage: "5 TB",
      price: 399,
      period: "/mo",
      cta: "Choose 5 TB",
      features: ["Everything in Starter", "Priority uploads", "Email support"],
      popular: false,
    },
    {
      id: "price_1SdlYs3cVYZiLez6gCY2kxdw",
      name: "Ultimate",
      tagline: "Teams & power users",
      storage: "10 TB",
      price: 699,
      period: "/mo",
      cta: "Choose 10 TB",
      features: ["Everything in Pro", "Version history", "Priority support"],
      popular: false,
    },
  ],
  yearly: [
    {
      id: "price_1SdlWe3cVYZiLez6sR5G7rfy",
      name: "Starter",
      tagline: "Great for individuals",
      storage: "2 TB",
      price: 1999,
      period: "/yr",
      cta: "Choose 2 TB",
      features: [
        "Secure cloud storage",
        "Link & folder sharing",
        "Basic support",
      ],
      popular: false,
    },
    {
      id: "price_1SdlYO3cVYZiLez6MJkKRXrM",
      name: "Pro",
      tagline: "For creators & devs",
      storage: "5 TB",
      price: 3999,
      period: "/yr",
      cta: "Choose 5 TB",
      features: ["Everything in Starter", "Priority uploads", "Email support"],
      popular: false,
    },
    {
      id: "price_1SdlZM3cVYZiLez6gO6iXkKd",
      name: "Ultimate",
      tagline: "Teams & power users",
      storage: "10 TB",
      price: 6999,
      period: "/yr",
      cta: "Choose 10 TB",
      features: ["Everything in Pro", "Version history", "Priority support"],
      popular: false,
    },
  ],
};

export function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}

export function Price({ value }) {
  return (
    <div className="flex items-baseline gap-1 my-4">
      <span className="text-xl font-bold text-[#facc15]">RS</span>
      <span className="text-5xl font-black tracking-tight text-white uppercase">
        {value}
      </span>
    </div>
  );
}

export function PlanCard({ plan, onSelect }) {
  return (
    <div
      className={classNames(
        "relative flex flex-col p-6 sm:p-8 bg-[#111] border-2 transition-all duration-150",
        plan.popular
          ? "border-[#facc15] shadow-[8px_8px_0px_0px_#facc15] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#facc15] z-10"
          : "border-white/20 shadow-[6px_6px_0px_0px_transparent] hover:-translate-x-1 hover:-translate-y-1 hover:border-[#facc15] hover:shadow-[8px_8px_0px_0px_#facc15]"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 right-4 bg-[#facc15] px-3 py-1 text-xs font-black text-black uppercase tracking-wider border-2 border-black inline-flex shadow-brutal-sm">
          Most Popular
        </div>
      )}

      <div className="mb-2">
        <h3 className="text-3xl font-black text-white uppercase tracking-tight">{plan.name}</h3>
        <p className="mt-2 text-sm font-bold text-white/50 uppercase tracking-widest">{plan.tagline}</p>
      </div>

      <div className="inline-block mt-4 mb-2">
        <span className="border-2 border-[#facc15] bg-[#facc15]/10 text-[#facc15] px-3 py-1.5 text-xs font-black uppercase tracking-widest">
          {plan.storage}
        </span>
      </div>

      <Price value={plan.price} />
      <span className="mb-6 text-sm font-bold text-white/50 uppercase tracking-widest border-b-2 border-white/10 pb-6 block">
        {plan.period}
      </span>

      <ul className="mb-8 space-y-4 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-white font-medium">
            <div className="mt-0.5 w-5 h-5 bg-[#facc15] border-2 border-black flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-black" strokeWidth={4} />
            </div>
            <span className="text-sm uppercase tracking-wide">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect?.(plan)}
        className={classNames(
          "mt-auto cursor-pointer inline-flex w-full items-center justify-center px-6 py-4 text-sm font-black transition-all duration-150 uppercase tracking-widest border-2",
          plan.popular
            ? "bg-[#facc15] text-black border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]"
            : "bg-transparent text-white border-white/40 hover:border-white hover:bg-white/10"
        )}
      >
        {plan.cta}
      </button>
    </div>
  );
}

export default function Plans() {
  const [mode, setMode] = useState("monthly");
  const plans = PLAN_CATALOG[mode];

  async function handleSelect(plan) {
    const data = await createSubscription(plan.id);
    window.location.href = data;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden font-sans pb-24">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#facc15 1px, transparent 1px),
                            linear-gradient(90deg, #facc15 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 px-6 sm:px-10 pt-12 sm:pt-20 max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col items-start gap-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-black text-white hover:text-[#facc15] transition-colors uppercase tracking-widest border-2 border-white/20 px-4 py-2 hover:border-[#facc15]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.0] mb-6 uppercase">
              Choose your <span className="text-[#facc15]">plan</span>
            </h1>
            <p className="text-white/60 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
              Get the storage you need with the security you expect. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-16 flex">
          <div className="inline-flex bg-[#111] border-2 border-white/20 shadow-brutal-sm p-1">
            <button
              onClick={() => setMode("monthly")}
              className={classNames(
                "px-8 py-3 text-sm font-black transition-all duration-150 uppercase tracking-widest cursor-pointer border-2",
                mode === "monthly"
                  ? "bg-[#facc15] text-black border-black shadow-[4px_4px_0px_0px_#000]"
                  : "bg-transparent text-white/60 border-transparent hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setMode("yearly")}
              className={classNames(
                "px-8 py-3 text-sm font-black transition-all duration-150 uppercase tracking-widest cursor-pointer border-2 flex items-center gap-3",
                mode === "yearly"
                  ? "bg-[#facc15] text-black border-black shadow-[4px_4px_0px_0px_#000]"
                  : "bg-transparent text-white/60 border-transparent hover:text-white"
              )}
            >
              Yearly
              <span
                className={classNames(
                  "text-[10px] px-2 py-0.5 border-2 uppercase font-black tracking-widest leading-none flex items-center",
                  mode === "yearly" ? "border-black bg-black text-[#facc15]" : "border-white/20 text-[#facc15]"
                )}
              >
                Save 16%
              </span>
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid gap-10 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3 items-stretch max-w-6xl mx-auto md:mx-0">
          {plans.map((plan, index) => (
            <PlanCard
              key={`${mode}-${plan.name}-${index}`}
              plan={plan}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
