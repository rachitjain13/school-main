
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { loginSuperAdmin } from "../services/auth.service";
import { useAuthStore } from "../../../store/auth.store";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await loginSuperAdmin({
      email: email.trim().toLowerCase(),
      password,
    });

    if (result.user.role !== "super_admin") {
      throw new Error("You are not authorized to access the Super Admin portal.");
    }

    setAuth(result.user, result.accessToken);

    navigate("/dashboard", { replace: true });
  } catch (error) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    setError(
      apiError.response?.data?.message ||
      (error instanceof Error
        ? error.message
        : "Login failed. Please try again.")
    );
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">

      {/* Left branding section */}
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3">
            <GraduationCap size={27} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">EduControl</h1>
            <p className="text-xs text-slate-400">
              Education Management Platform
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
            <ShieldCheck size={17} className="mr-2" />
            Super Admin Portal
          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Manage every school.
            <span className="block text-blue-400">
              From one platform.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Monitor institutions, manage administrators,
            control subscriptions and oversee your entire
            education management ecosystem.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-bold">Centralized</p>
              <p className="mt-1 text-sm text-slate-400">
                Platform Management
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-bold">Secure</p>
              <p className="mt-1 text-sm text-slate-400">
                Admin Access
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          © 2026 EduControl. All rights reserved.
        </p>
      </div>

      {/* Right login section */}
      <div className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">

        <div className="w-full max-w-md">

          <div className="mb-10 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <GraduationCap size={30} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              EduControl
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Super Admin Portal
            </p>
          </div>

          <div>
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                WELCOME BACK
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your administrator credentials to
                access the EduControl platform.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Mail size={19} className="text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@educontrol.com"
                    className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                </div>

                <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Lock size={19} className="text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}

                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

