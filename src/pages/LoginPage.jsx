import { useState } from "react";
import {
  Building2,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  BedDouble,
  Users,
  ClipboardCheck,
  Globe,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      await authService.login({
        email,
        password,
      });

      const destination = location.state?.from?.pathname || "/admin/dashboard";

      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f5ee] font-sans text-[#183c2d]">
      <div className="grid min-h-screen lg:grid-cols-[1.04fr_0.96fr]">
        {/* LEFT BRANDING PANEL */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#082b1e] via-[#103c2b] to-[#071f17] px-10 py-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between xl:px-16 xl:py-12">
          {/* Gold decorative circles */}
          <div className="pointer-events-none absolute -right-36 -top-40 h-[570px] w-[570px] rounded-full border border-[#d8b66b]/20" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-[440px] w-[440px] rounded-full border border-[#d8b66b]/15" />
          <div className="pointer-events-none absolute -bottom-64 -left-40 h-[580px] w-[580px] rounded-full border border-[#d8b66b]/30" />
          <div className="pointer-events-none absolute -bottom-48 -left-28 h-[420px] w-[420px] rounded-full border border-[#d8b66b]/25" />
          <div className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[100px]" />

          {/* Brand header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#d8b66b]/70 bg-[#d8b66b]/10 shadow-lg shadow-black/10">
              <Building2
                size={29}
                strokeWidth={1.5}
                className="text-[#e8cb83]"
              />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight xl:text-xl">
                SR Luxury PG Living
              </h1>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#e5c77f]">
                Property Management
              </p>
            </div>
          </div>

          {/* Main branding content */}
          <div className="relative z-10 my-12 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8b66b]/25 bg-white/[0.05] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#e5c77f]" />
              <span className="text-[10px] font-medium tracking-wide text-emerald-50/90">
                SMART PROPERTY MANAGEMENT
              </span>
            </div>

            <h2 className="max-w-lg text-4xl font-extrabold leading-[1.2] tracking-tight xl:text-5xl">
              Smart Property Management
              <span className="mt-2 block text-[#e8cb83]">
                for a Better Living Experience.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/70 xl:text-base">
              Manage rooms, beds, tenants and rent payments in one elegant,
              easy-to-use workspace.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid grid-cols-4 gap-3">
              {[
                { icon: BedDouble, label: "Rooms", sub: "Management" },
                { icon: Users, label: "Tenant", sub: "Management" },
                { icon: ClipboardCheck, label: "Rent", sub: "Tracking" },
                { icon: ShieldCheck, label: "Secure", sub: "Access" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex min-w-0 flex-col items-center rounded-xl border border-white/10 bg-white/[0.045] px-2 py-4 text-center transition duration-300 hover:border-[#d8b66b]/40 hover:bg-white/[0.08]"
                >
                  <Icon
                    size={22}
                    strokeWidth={1.6}
                    className="mb-3 text-[#e8cb83]"
                  />
                  <span className="text-[10px] font-bold text-white">
                    {label}
                  </span>
                  <span className="mt-1 text-[9px] leading-4 text-emerald-50/60">
                    {sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <span className="text-[10px] tracking-wide text-emerald-50/50">
              © {new Date().getFullYear()} SR Luxury PG Living
            </span>
            <span className="flex items-center gap-2 text-[10px] text-emerald-50/60">
              <ShieldCheck size={14} className="text-[#e8cb83]" />
              Designed for better living
            </span>
          </div>
        </section>

        {/* RIGHT LOGIN AREA */}
        <section className="relative flex min-h-screen items-center justify-center px-4 py-7 sm:px-8 lg:px-10 xl:px-14">
          {/* Mobile background decoration */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full border border-[#d8b66b]/30 lg:hidden" />
          <div className="pointer-events-none absolute -bottom-36 -left-28 h-72 w-72 rounded-full border border-[#d8b66b]/25 lg:hidden" />

          <div className="relative z-10 w-full max-w-[430px]">
            {/* Mobile-only logo */}
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#164b36] to-[#08291d] shadow-lg">
                <Building2 size={25} className="text-[#e8cb83]" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight">
                  SR Luxury PG Living
                </h1>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#a8863c]">
                  Property Management
                </p>
              </div>
            </div>

            {/* Login card */}
            <div className="rounded-2xl border border-[#e9e2d4] bg-[#fffefa] p-5 shadow-[0_22px_65px_-28px_rgba(11,48,32,0.25)] sm:rounded-3xl sm:p-8 xl:p-10">
              <div className="mb-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#e9d9ac] bg-[#f8f0dc] text-[#174632]">
                  <LockKeyhole size={22} strokeWidth={1.7} />
                </div>

                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a8863c]">
                  Welcome Back
                </p>

                <h2 className="text-2xl font-extrabold tracking-tight text-[#173c2c] sm:text-3xl">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#7d857b] sm:text-sm">
                  Sign in to access your SR Luxury PG Living account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-xs font-bold text-[#35493c]"
                  >
                    Email or Username
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8c988e]"
                    />
                    <input
                      id="login-email"
                      type="text"
                      autoComplete="username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email or username"
                      required
                      className="h-11 w-full rounded-lg border border-[#e5e5dc] bg-white pl-9 pr-3 text-xs text-[#183c2d] outline-none transition placeholder:text-[#a1a79f] focus:border-[#1b5a3d] focus:ring-4 focus:ring-[#174b38]/[0.07]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-xs font-bold text-[#35493c]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8c988e]"
                    />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-11 w-full rounded-lg border border-[#e5e5dc] bg-white pl-9 pr-11 text-xs text-[#183c2d] outline-none transition placeholder:text-[#a1a79f] focus:border-[#1b5a3d] focus:ring-4 focus:ring-[#174b38]/[0.07]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#7d897f] transition hover:bg-[#f2f2eb] hover:text-[#174b38]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember me and forgot password */}
                <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                  <label className="flex cursor-pointer items-center gap-2 text-[10px] font-medium text-[#69776b]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-[#174b38]"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setMessage(
                        "Password recovery will be connected with the backend later.",
                      )
                    }
                    className="text-[10px] font-bold text-[#96742f] transition hover:text-[#174b38]"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* UI-only submit */}
                <button
                  type="submit"
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#103b29] via-[#174b36] to-[#20573b] px-4 text-xs font-bold text-white shadow-md shadow-emerald-950/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a85d] focus-visible:ring-offset-2 active:translate-y-0"
                >
                  {isLoading ? "Signing in..." : "Sign In"}{" "}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                {message && (
                  <p
                    role="status"
                    className="rounded-lg border border-[#eadbb7] bg-[#fbf5e6] px-3 py-2 text-[10px] leading-5 text-[#745b25]"
                  >
                    {message}
                  </p>
                )}
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#eae8df]" />
                <span className="text-[9px] text-[#969b91]">
                  or continue with
                </span>
                <div className="h-px flex-1 bg-[#eae8df]" />
              </div>

              {/* Google UI button only */}
              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "Google sign-in will be connected by your development team.",
                  )
                }
                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#e6e5dc] bg-white text-xs font-semibold text-[#35463a] transition hover:border-[#c9b16e] hover:bg-[#fbfaf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a85d]"
              >
                <Globe size={17} className="text-[#4285F4]" /> Sign in with
                Google
              </button>

              {/* Contact admin */}
              <p className="mt-6 text-center text-[10px] text-[#858c82]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "Please contact your PG administrator for account access.",
                    )
                  }
                  className="font-bold text-[#174b38] underline decoration-[#d4b76c] underline-offset-4 hover:text-[#a17b2f]"
                >
                  Contact Admin
                </button>
              </p>
            </div>

            {/* Bottom security note */}
            <div className="mt-5 flex items-center justify-center gap-2 text-center text-[9px] text-[#93988e]">
              <ShieldCheck size={13} className="shrink-0 text-[#a8863c]" />
              Secure property management workspace
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
