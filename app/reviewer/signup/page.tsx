"use client";

export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Eye, EyeOff, Upload, CheckCircle,
  ArrowLeft, User, Mail, Lock, MapPin, IdCard,
} from "lucide-react";

const CITIES = [
  "Vienna", "Lisbon", "Kyoto", "Barcelona", "Copenhagen", "Buenos Aires",
];

export default function ReviewerSignupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    cityCovered: "",
  });
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ID photo must be under 5MB.");
      return;
    }

    setError("");
    setIdPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setIdPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!idPhoto) {
      setError("Please upload a photo of your ID.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("cityCovered", form.cityCovered);
    formData.append("idPhoto", idPhoto);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0d2b3e] px-4"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        <div className="relative w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Application submitted!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Thanks for applying to be a local reviewer for{" "}
              <span className="font-semibold text-gray-700">{form.cityCovered}</span>.
              We&apos;ll review your ID and get back to you within 2–3 business days.
            </p>
            <div className="bg-[#f2f0eb] rounded-2xl px-5 py-4 text-left mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What happens next</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#3bbfb3] mt-0.5">1.</span>
                  We verify your identity and local status
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3bbfb3] mt-0.5">2.</span>
                  You&apos;ll receive an email once approved
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3bbfb3] mt-0.5">3.</span>
                  Sign in and start adding local recommendations
                </li>
              </ul>
            </div>
            <button
              onClick={() => router.push("/reviewer/login")}
              className="w-full bg-[#3bbfb3] hover:bg-[#2da89d] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup form ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0d2b3e] px-4 py-10"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Back link */}
        <button
          onClick={() => router.push("/reviewer/login")}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0d2b3e] px-8 py-8 text-center">
            <div className="w-12 h-12 bg-[#3bbfb3]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Globe size={24} className="text-[#3bbfb3]" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Apply to become a reviewer</h1>
            <p className="text-white/50 text-xs">
              Share your local knowledge with travelers worldwide
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Full name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                City you cover <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  required
                  value={form.cityCovered}
                  onChange={(e) => setForm((f) => ({ ...f, cityCovered: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] focus:border-transparent transition appearance-none bg-white"
                >
                  <option value="">Select the city you live in…</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Confirm password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* ID Photo upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Government ID photo <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Passport, national ID, or driver&apos;s license. Used only for identity verification.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {idPreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#3bbfb3]">
                  <img
                    src={idPreview}
                    alt="ID preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg shadow font-medium hover:bg-gray-50 transition"
                  >
                    Change photo
                  </button>
                  <div className="absolute top-3 left-3 bg-[#3bbfb3] text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={11} />
                    Photo added
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-[#3bbfb3] rounded-2xl py-8 flex flex-col items-center gap-3 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#d6f0ed] rounded-xl flex items-center justify-center transition-colors">
                    <IdCard size={22} className="text-gray-400 group-hover:text-[#3bbfb3] transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Click to upload your ID</p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG or PNG, max 5MB</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#3bbfb3] text-xs font-medium">
                    <Upload size={12} />
                    Browse files
                  </div>
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Privacy note */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By submitting this application you agree to our{" "}
              <a href="/terms" className="text-[#3bbfb3] hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-[#3bbfb3] hover:underline">Privacy Policy</a>.
              Your ID is stored securely and used only for verification.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3bbfb3] hover:bg-[#2da89d] disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting application…
                </>
              ) : (
                "Submit application"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Mr. International
        </p>
      </div>
    </div>
  );
}
