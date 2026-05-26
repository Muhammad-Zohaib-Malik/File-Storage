import { useState } from "react";
import { toast } from "react-hot-toast";
import { setup2fa, verify2fa, reset2fa } from "../api/totpApi";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react";

const TwoFactorAuth = ({ user, onUpdate }) => {
  const [step, setStep] = useState("idle"); // idle | loading | qr | verify | done
  const [qrData, setQrData] = useState(null);
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isMfaEnabled = user?.isMfaEnabled;

  const handleSetup = async () => {
    setStep("loading");
    try {
      const data = await setup2fa();
      setQrData(data);
      setStep("qr");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to setup 2FA");
      setStep("idle");
    }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      await verify2fa(token);
      toast.success("2FA enabled successfully!");
      setStep("done");
      setToken("");
      setQrData(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid code. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold text-sm">
            Are you sure you want to disable 2FA?
          </p>
          <p className="text-xs text-gray-500">
            This will remove the extra security layer from your account.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                confirmReset();
              }}
              className="flex-1 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors"
            >
              Disable
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000 },
    );
  };

  const confirmReset = async () => {
    setResetting(true);
    try {
      await reset2fa();
      toast.success("2FA has been disabled");
      setStep("idle");
      setQrData(null);
      setToken("");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to disable 2FA");
    } finally {
      setResetting(false);
    }
  };

  const handleCopySecret = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      setCopied(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancel = () => {
    setStep("idle");
    setQrData(null);
    setToken("");
  };

  return (
    <div className="bg-[#111] border-2 border-emerald-500/30 shadow-[6px_6px_0px_0px_rgba(16,185,129,0.2)] p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-white/10">
        <div className="p-2 bg-emerald-500 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <Shield size={20} className="text-black" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black uppercase tracking-wide">
            Two-Factor Authentication
          </h2>
        </div>
        {isMfaEnabled && step !== "done" && (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
            Enabled
          </span>
        )}
      </div>

      {/* Idle state — MFA not enabled */}
      {!isMfaEnabled && step === "idle" && (
        <div className="space-y-4">
          <div className="p-5 bg-[#0a0a0a] border-2 border-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#111] border-2 border-white/10 shrink-0 mt-0.5">
                <ShieldOff size={24} className="text-white/40" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/70 mb-1">
                  2FA is currently disabled
                </p>
                <p className="text-xs text-white/40 leading-relaxed">
                  Add an extra layer of security to your account. You'll need an
                  authenticator app like Google Authenticator or Authy to scan
                  the QR code.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSetup}
            className="w-full py-3 px-4 bg-emerald-500 text-black text-sm font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all"
          >
            Enable 2FA
          </button>
        </div>
      )}

      {/* Loading state */}
      {step === "loading" && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-emerald-400 animate-spin" />
        </div>
      )}

      {/* QR Code Display */}
      {step === "qr" && qrData && (
        <div className="space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
            <span className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-black border-2 border-black text-[10px]">
              1
            </span>
            Scan QR Code
          </div>

          {/* QR Code */}
          <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
            <img src={qrData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>

          {/* Manual entry secret */}
          <div className="p-4 bg-[#0a0a0a] border-2 border-white/10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
              Manual Entry Key
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-emerald-400 bg-[#111] px-3 py-2 border border-white/10 break-all">
                {qrData.secret}
              </code>
              <button
                onClick={handleCopySecret}
                className="p-2 bg-[#111] border-2 border-white/20 hover:border-emerald-500 transition-colors shrink-0"
                title="Copy secret"
              >
                {copied ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <Copy size={16} className="text-white/50" />
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Enter code */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 pt-2">
            <span className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-black border-2 border-black text-[10px]">
              2
            </span>
            Enter Verification Code
          </div>

          <div>
            <input
              type="text"
              value={token}
              onChange={(e) =>
                setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-emerald-500 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)] transition-all placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 bg-[#222] text-white text-sm font-black uppercase tracking-wider border-2 border-white/20 hover:border-white/40 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || token.length !== 6}
              className="flex-1 py-3 px-4 bg-emerald-500 text-black text-sm font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000]"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Verifying
                </span>
              ) : (
                "Verify & Enable"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {step === "done" && (
        <div className="space-y-4">
          <div className="p-6 bg-emerald-950/30 border-2 border-emerald-500/50 text-center">
            <ShieldCheck size={48} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase tracking-wide text-emerald-400 mb-1">
              2FA is Now Active!
            </h3>
            <p className="text-xs text-white/50">
              Your account is now protected with two-factor authentication.
            </p>
          </div>
        </div>
      )}

      {/* MFA already enabled — show disable option */}
      {isMfaEnabled && step === "idle" && (
        <div className="space-y-4">
          <div className="p-5 bg-[#0a0a0a] border-2 border-emerald-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-950/50 border-2 border-emerald-500/30 shrink-0 mt-0.5">
                <ShieldCheck size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/70 mb-1">
                  2FA is active on your account
                </p>
                <p className="text-xs text-white/40 leading-relaxed">
                  You'll be asked for a verification code from your
                  authenticator app every time you log in.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="w-full py-3 px-4 bg-[#1a0f0f] text-red-400 text-sm font-black uppercase tracking-wider border-2 border-red-500/50 hover:bg-red-500 hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Disabling...
              </span>
            ) : (
              "Disable 2FA"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
