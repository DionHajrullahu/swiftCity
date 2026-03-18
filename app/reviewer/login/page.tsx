"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogIn, Eye, EyeOff, Globe } from "lucide-react";

export default function ReviewerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/reviewer/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0d2b3e] px-4"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0d2b3e] px-8 py-10 text-center">
            <div className="w-14 h-14 bg-[#3bbfb3]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe size={28} className="text-[#3bbfb3]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Reviewer Portal</h1>
            <p className="text-white/50 text-sm">Mr. International · Local Contributors</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3bbfb3] hover:bg-[#2da89d] disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 pt-2">
              Don&apos;t have an account?{" "}
              <a href="mailto:hello@mrinternational.com" className="text-[#3bbfb3] hover:underline">
                Contact us to get access
              </a>
            </p>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Mr. International
        </p>
      </div>
    </div>
  );
}
