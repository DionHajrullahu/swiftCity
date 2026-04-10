"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import createGlobe from "cobe";
import {
  Search, ArrowRight, Users, Filter, Clock, CheckCircle,
  Moon, Sun, LogIn, MapPin, UtensilsCrossed, Compass, Sparkles, X, Menu,
} from "lucide-react";
import type { Recommendation } from "@/lib/supabase";
import { SpeedInsights } from "@vercel/speed-insights/next";

const FEATURED_CITIES = [
  { name: "Vienna", country: "Austria", location: [48.2082, 16.3738] as [number, number], image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80" },
  { name: "Lisbon", country: "Portugal", location: [38.7169, -9.1395] as [number, number], image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80" },
  { name: "Kyoto", country: "Japan", location: [35.0116, 135.7681] as [number, number], image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80" },
  { name: "Barcelona", country: "Spain", location: [41.3851, 2.1734] as [number, number], image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80" },
  { name: "Copenhagen", country: "Denmark", location: [55.6761, 12.5683] as [number, number], image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80" },
  { name: "Buenos Aires", country: "Argentina", location: [-34.6037, -58.3816] as [number, number], image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80" },
];

const TRUST_FEATURES = [
  { icon: Users, title: "Verified locals only", description: "Every recommendation comes from someone who actually lives there" },
  { icon: Filter, title: "Interest-based, not ratings", description: "Find places that match your vibe, not just the highest-rated spots" },
  { icon: Clock, title: "Fewer, better picks", description: "5–8 curated recommendations, not overwhelming lists of 100+" },
  { icon: CheckCircle, title: "Fast decisions", description: "Find what you need in under 30 seconds" },
];

const QUICK_CITIES = ["Vienna", "Lisbon", "Kyoto"];

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  restaurant: { label: "Restaurant / Café", icon: <UtensilsCrossed size={14} />, color: "bg-orange-100 text-orange-600" },
  activity: { label: "Activity / Sight", icon: <Compass size={14} />, color: "bg-blue-100 text-blue-600" },
  hidden_gem: { label: "Hidden Gem", icon: <Sparkles size={14} />, color: "bg-purple-100 text-purple-600" },
};

// ── Globe ────────────────────────────────────────────────────────────────────
function Globe({ darkMode }: { darkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  }, []);
  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);
  const onPointerOut = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      phiRef.current = delta / 200;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let phi = 0;
    let width = 0;
    const onResize = () => { if (canvasRef.current) width = canvasRef.current.offsetWidth; };
    window.addEventListener("resize", onResize);
    onResize();

    // Fallback if canvas width is still 0 on first render
    if (width === 0) width = canvasRef.current.offsetWidth || 500;
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2, width: width * 2, height: width * 2,
      phi: 0, theta: 0.3,
      dark: darkMode ? 1 : 0, diffuse: 1.4, mapSamples: 20000,
      mapBrightness: darkMode ? 5 : 7,
      baseColor: darkMode ? [0.1, 0.2, 0.3] : [0.7, 0.85, 0.9],
      markerColor: [1, 0.15, 0.15],
      glowColor: darkMode ? [0.15, 0.5, 0.5] : [0.6, 0.85, 0.85],
      markers: FEATURED_CITIES.map((c) => ({ location: c.location, size: 0.06 })),
      onRender: (state) => {
        if (pointerInteracting.current === null) phi += 0.003;
        state.phi = phi + phiRef.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });
    return () => { globe.destroy(); window.removeEventListener("resize", onResize); };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp}
      onPointerOut={onPointerOut} onMouseMove={onMouseMove}
      style={{ width: "100%", height: "100%", cursor: "grab", contain: "layout paint size" }}
    />
  );
}

// ── Search Results ───────────────────────────────────────────────────────────
function SearchResults({
  results, loading, query, onClose, onCityClick,
}: {
  results: Recommendation[];
  loading: boolean;
  query: string;
  onClose: () => void;
  onCityClick: (city: string) => void;
}) {
  if (!query) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 font-medium">
          {loading ? "Searching…" : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
        </p>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
          <X size={14} />
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#3bbfb3]/30 border-t-[#3bbfb3] rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="py-10 text-center text-gray-400 text-sm px-4">
          <p className="font-medium mb-1">No results found</p>
          <p className="text-xs">Try a city like "Vienna" or an interest like "cafes"</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          {Array.from(new Set(results.map((r) => r.city))).map((city) => {
            const cityResults = results.filter((r) => r.city === city);
            return (
              <div key={city}>
                <button
                  onClick={() => onCityClick(city)}
                  className="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 hover:bg-[#d6f0ed] transition-colors border-b border-gray-100 group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#3bbfb3]" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{city}</span>
                    <span className="text-xs text-gray-400">{cityResults.length} result{cityResults.length !== 1 ? "s" : ""}</span>
                  </div>
                  <span className="text-xs text-[#3bbfb3] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    See all <ArrowRight size={11} />
                  </span>
                </button>

                {cityResults.slice(0, 3).map((r) => {
                  const cat = CATEGORY_META[r.category] ?? CATEGORY_META.hidden_gem;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onCityClick(r.city)}
                      className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cat.color}`}>
                          {cat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 text-sm">{r.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                          </div>
                          <p className="text-xs text-[#3bbfb3] mt-0.5 flex items-center gap-1">
                            <MapPin size={10} /> {r.city}, {r.country}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Click a city to see all recommendations</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Recommendation[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.background = darkMode ? "#030712" : "#f2f0eb";
  }, [darkMode]);

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    if (!query.trim()) { setShowResults(false); setSearchResults([]); return; }
    setShowResults(true);
    setSearchLoading(true);
    searchRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setSearchResults(json.results ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedCity = FEATURED_CITIES.find(
      (c) => c.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (matchedCity) router.push(`/city/${encodeURIComponent(matchedCity.name)}`);
  };

  const handleCityClick = (cityName: string) => {
    router.push(`/city/${encodeURIComponent(cityName)}`);
  };

  const closeResults = () => { setShowResults(false); setQuery(""); };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-white" : "bg-[#f2f0eb] text-gray-900"}`}
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── Top Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={() => router.push("/reviewer/login")}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <LogIn size={14} />
          Reviewer Login
        </button>

        <button
          onClick={() => setMenuOpen(true)}
          className="sm:hidden w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d2b3e]/97 flex flex-col items-center justify-center gap-6">
          <button onClick={() => setMenuOpen(false)} className="absolute top-5 right-5 text-white/60 hover:text-white">
            <X size={24} />
          </button>
          <button
            onClick={() => { router.push("/reviewer/login"); setMenuOpen(false); }}
            className="flex items-center gap-2 text-white text-xl font-medium"
          >
            <LogIn size={20} /> Reviewer Login
          </button>
          <a href="/reviewer/signup" className="text-[#3bbfb3] text-base hover:underline">
            Apply as a reviewer
          </a>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529619768328-e37af76c6fe5?q=80&w=1400&auto=format')" }}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${darkMode ? "bg-gray-950/90" : "bg-[#0d2b3e]/70"}`} />

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
            Discover cities through{" "}
            <span className="text-[#3bbfb3]">local eyes</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            Skip the tourist traps. Find places locals actually love—verified recommendations for every interest.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-5 sm:mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city or interest (e.g., Vienna, quiet cafes, local food)"
              className="w-full px-5 sm:px-6 py-3.5 sm:py-4 pr-14 sm:pr-16 rounded-2xl text-gray-800 bg-white shadow-2xl text-sm sm:text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#3bbfb3]"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-[#3bbfb3] hover:bg-[#2da89d] rounded-xl flex items-center justify-center transition-colors"
            >
              <Search size={17} className="text-white" />
            </button>

            <SearchResults
              results={searchResults}
              loading={searchLoading}
              query={showResults ? query : ""}
              onClose={closeResults}
              onCityClick={(city) => { closeResults(); handleCityClick(city); }}
            />
            {showResults && <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />}
          </form>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-white/60 text-sm">Try:</span>
            {QUICK_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleCityClick(city)}
                className="px-3 sm:px-4 py-1.5 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Globe Section ── */}
      <section className={`py-24 px-6 overflow-hidden ${darkMode ? "bg-gray-950" : "bg-[#f2f0eb]"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-2/5 text-left">
              <p className={`text-sm font-semibold tracking-widest uppercase mb-4 ${darkMode ? "text-[#3bbfb3]" : "text-[#2da89d]"}`}>
                Our Coverage
              </p>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                Local guides across the globe
              </h2>
              <p className={`text-base leading-relaxed mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Each red dot marks a city where we have verified local contributors. Drag the globe to explore.
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {FEATURED_CITIES.map((city) => (
                  <li key={city.name}>
                    <button
                      onClick={() => handleCityClick(city.name)}
                      className={`w-full flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors text-left ${darkMode ? "text-gray-300 bg-gray-800/50 hover:bg-gray-800" : "text-gray-700 bg-white/60 hover:bg-white"}`}
                    >
                      <MapPin size={12} className="text-red-500 flex-shrink-0" />
                      <span className="font-medium">{city.name}</span>
                      <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{city.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-3/5 flex items-center justify-center">
              <div className="relative" style={{ width: "min(520px, 90vw)", height: "min(520px, 90vw)" }}>
                <div className="absolute inset-0 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #3bbfb3 0%, transparent 70%)" }} />
                <Globe darkMode={darkMode} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className={`py-24 px-6 ${darkMode ? "bg-gray-900" : "bg-[#eceae4]"}`}>
        <div className="max-w-5xl mx-auto text-center">
          {/* ← SwiftCity branding */}
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Why travelers trust SwiftCity
          </h2>
          <p className={`text-lg mb-16 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            We cut through the noise to help you discover authentic experiences, fast.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#d6f0ed] flex items-center justify-center mb-4">
                  <Icon size={24} className="text-[#3bbfb3]" />
                </div>
                <h3 className={`font-semibold text-base mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Cities ── */}
      <section className={`pb-24 px-6 ${darkMode ? "bg-gray-900" : "bg-[#eceae4]"}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-4xl md:text-5xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Explore featured cities
          </h2>
          <p className={`text-base mb-10 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Start with locals&apos; favorites from these destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_CITIES.map(({ name, country, image }) => (
              <article
                key={name}
                onClick={() => handleCityClick(name)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                style={{ aspectRatio: "4/3" }}
              >
                <img src={image} alt={`${name}, ${country}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-2xl font-bold text-white leading-tight">{name}</h3>
                  <p className="text-white/70 text-sm mb-3">{country}</p>
                  <span className="flex items-center gap-1.5 text-white text-sm font-medium group-hover:gap-3 transition-all duration-200">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      {/* ← SwiftCity branding */}
      <footer className={`py-8 px-6 border-t text-center text-sm ${darkMode ? "bg-gray-950 border-gray-800 text-gray-500" : "bg-[#eceae4] border-gray-200 text-gray-400"}`}>
        © {new Date().getFullYear()} SwiftCity · Discover cities through local eyes
        <span className="mx-2">·</span>
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <span className="mx-2">·</span>
        <a href="/terms" className="hover:underline">Terms of Service</a>
      </footer>
    </div>
  );
}
