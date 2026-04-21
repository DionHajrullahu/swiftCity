"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Recommendation, type Category } from "@/lib/supabase";
import {
  LogOut, Plus, Trash2, Globe, MapPin, UtensilsCrossed,
  Compass, Sparkles, CheckCircle, Clock, X, ChevronDown,
  AlertCircle, Upload, ImageIcon, Video, XCircle,
} from "lucide-react";

const CATEGORIES: { value: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "restaurant", label: "Restaurant / Café", icon: <UtensilsCrossed size={16} />, color: "bg-orange-100 text-orange-600" },
  { value: "activity", label: "Activity / Sight", icon: <Compass size={16} />, color: "bg-blue-100 text-blue-600" },
  { value: "hidden_gem", label: "Hidden Gem / Tip", icon: <Sparkles size={16} />, color: "bg-purple-100 text-purple-600" },
];

const CITIES = [
  { name: "Vienna", country: "Austria" },
  { name: "Lisbon", country: "Portugal" },
  { name: "Kyoto", country: "Japan" },
  { name: "Barcelona", country: "Spain" },
  { name: "Copenhagen", country: "Denmark" },
  { name: "Buenos Aires", country: "Argentina" },
];

const EMPTY_FORM = {
  city: "", country: "", category: "" as Category | "",
  name: "", description: "", address: "", tips: "",
};

type MediaFile = { file: File; preview: string; publicUrl?: string; uploading: boolean; error?: string };

export default function ReviewerDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (jwt: string) => {
    try {
      const res = await fetch("/api/recommendations", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const json = await res.json();
      if (json.data) setRecommendations(json.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/reviewer/login"); return; }
      setUserEmail(session.user.email ?? "");
      setToken(session.access_token);
      await fetchRecommendations(session.access_token);
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUserEmail(session.user.email ?? "");
          setToken(session.access_token);
          await fetchRecommendations(session.access_token);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          router.replace("/reviewer/login");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router, fetchRecommendations]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/reviewer/login");
  };

  const handleCityChange = (cityName: string) => {
    const found = CITIES.find((c) => c.name === cityName);
    setForm((f) => ({ ...f, city: cityName, country: found?.country ?? "" }));
  };

  // ── Media handling ──────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (mediaFiles.length + files.length > 5) {
      setFormError("Maximum 5 media files per recommendation.");
      return;
    }

    const newMedia: MediaFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));
    setMediaFiles((prev) => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFile = async (media: MediaFile, jwt: string): Promise<string | null> => {
    try {
      // 1. Get presigned URL from our API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          fileName: media.file.name,
          fileType: media.file.type,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Upload failed");
      }

      const { presignedUrl, publicUrl } = await res.json();

      // 2. Upload directly to S3
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": media.file.type },
        body: media.file,
      });

      if (!uploadRes.ok) throw new Error("S3 upload failed");

      return publicUrl;
    } catch (err: any) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.city || !form.category || !form.name || !form.description) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setFormError("Session expired. Please log in again.");
      router.replace("/reviewer/login");
      return;
    }

    const freshToken = session.access_token;
    setSubmitting(true);

    // Upload media files first
    const mediaUrls: string[] = [];
    if (mediaFiles.length > 0) {
      setMediaFiles((prev) => prev.map((m) => ({ ...m, uploading: true })));

      for (let i = 0; i < mediaFiles.length; i++) {
        const url = await uploadFile(mediaFiles[i], freshToken);
        if (url) {
          mediaUrls.push(url);
          setMediaFiles((prev) =>
            prev.map((m, idx) => idx === i ? { ...m, uploading: false, publicUrl: url } : m)
          );
        } else {
          setMediaFiles((prev) =>
            prev.map((m, idx) => idx === i ? { ...m, uploading: false, error: "Upload failed" } : m)
          );
        }
      }
    }

    // Submit recommendation with media URLs
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({ ...form, media_urls: mediaUrls }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error ?? `Error ${res.status}`);
        setSubmitting(false);
        return;
      }

      setSuccessMsg(`"${form.name}" submitted! It will appear after review.`);
      setForm(EMPTY_FORM);
      setMediaFiles([]);
      setShowForm(false);
      await fetchRecommendations(freshToken);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      setFormError(err?.message ?? "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    await fetch(`/api/recommendations?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  };

  const getCategoryMeta = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f0eb] flex flex-col items-center justify-center gap-4"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        <div className="w-10 h-10 border-4 border-[#3bbfb3]/30 border-t-[#3bbfb3] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f0eb]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Nav */}
      <nav className="bg-[#0d2b3e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3bbfb3]/20 rounded-lg flex items-center justify-center">
            <Globe size={16} className="text-[#3bbfb3]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">SwiftCity</p>
            <p className="text-white/40 text-xs mt-0.5">Reviewer Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-white/50 text-xs hidden sm:block">{userEmail}</p>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Recommendations</h1>
            <p className="text-gray-500 text-sm mt-1">
              {recommendations.length} submission{recommendations.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(""); setMediaFiles([]); }}
            className="flex items-center gap-2 bg-[#3bbfb3] hover:bg-[#2da89d] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add new"}
          </button>
        </div>

        {/* Success */}
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-3">
            <CheckCircle size={18} className="flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg">New recommendation</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  City <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select required value={form.city} onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] bg-white pr-10">
                    <option value="">Select a city…</option>
                    {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}, {c.country}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select required value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] bg-white pr-10">
                    <option value="">Select a category…</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Place name <span className="text-red-400">*</span>
              </label>
              <input required type="text" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Café Central, Schönbrunn Palace…"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea required rows={3} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Why do locals love this place? What makes it special?"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3] resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Address <span className="text-gray-300">(optional)</span>
                </label>
                <input type="text" value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Street address or area"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Local tip <span className="text-gray-300">(optional)</span>
                </label>
                <input type="text" value={form.tips}
                  onChange={(e) => setForm((f) => ({ ...f, tips: e.target.value }))}
                  placeholder="Best time to go, what to order…"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3]" />
              </div>
            </div>

            {/* ── Media upload ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Photos / Videos <span className="text-gray-300">(optional, max 5)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Preview grid */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {mediaFiles.map((media, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {media.file.type.startsWith("video/") ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <Video size={24} className="text-white" />
                        </div>
                      ) : (
                        <img src={media.preview} alt="" className="w-full h-full object-cover" />
                      )}

                      {/* Upload indicator */}
                      {media.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        </div>
                      )}

                      {media.publicUrl && !media.uploading && (
                        <div className="absolute top-1 left-1 bg-green-500 rounded-full p-0.5">
                          <CheckCircle size={10} className="text-white" />
                        </div>
                      )}

                      {media.error && (
                        <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                          <AlertCircle size={16} className="text-white" />
                        </div>
                      )}

                      {/* Remove button */}
                      {!media.uploading && (
                        <button
                          type="button"
                          onClick={() => removeMedia(i)}
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 hover:bg-black/80 transition-colors"
                        >
                          <XCircle size={14} className="text-white" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {mediaFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-[#3bbfb3] rounded-2xl py-6 flex flex-col items-center gap-2 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#d6f0ed] rounded-xl flex items-center justify-center transition-colors">
                    <Upload size={18} className="text-gray-400 group-hover:text-[#3bbfb3] transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Add photos or videos</p>
                    <p className="text-xs text-gray-400">JPG, PNG, MP4 · Max 5 files · Uploaded to secure storage</p>
                  </div>
                </button>
              )}
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={submitting}
                className="bg-[#3bbfb3] hover:bg-[#2da89d] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {mediaFiles.length > 0 ? "Uploading media…" : "Submitting…"}
                  </>
                ) : (
                  <><Plus size={16} /> Submit recommendation</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Recommendations list */}
        {recommendations.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <MapPin size={36} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No recommendations yet</p>
            <p className="text-sm mt-1">Click &quot;Add new&quot; to submit your first one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const cat = getCategoryMeta(rec.category);
              const mediaUrls = (rec as any).media_urls as string[] ?? [];
              return (
                <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{rec.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{rec.city}, {rec.country} · {cat.label}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${rec.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {rec.approved ? <CheckCircle size={11} /> : <Clock size={11} />}
                          {rec.approved ? "Live" : "Pending"}
                        </span>
                        <button onClick={() => handleDelete(rec.id, rec.name)}
                          disabled={deletingId === rec.id}
                          className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{rec.description}</p>

                    {/* Media thumbnails */}
                    {mediaUrls.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {mediaUrls.map((url, i) => (
                          <div key={i} className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                            {url.includes(".mp4") || url.includes(".mov") || url.includes(".webm") ? (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Video size={16} className="text-white" />
                              </div>
                            ) : (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                        <span className="text-xs text-gray-400 self-center">
                          {mediaUrls.length} file{mediaUrls.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {rec.tips && (
                      <p className="text-xs text-[#3bbfb3] mt-2 flex items-center gap-1">
                        <Sparkles size={11} /> {rec.tips}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}