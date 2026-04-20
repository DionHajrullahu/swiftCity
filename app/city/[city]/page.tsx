"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, UtensilsCrossed, Compass, Sparkles,
  MapPin, Clock, Search, Loader2, X, ChevronLeft, ChevronRight, ImageIcon,
} from "lucide-react";
import type { Recommendation } from "@/lib/supabase";

// ── Static fallback data ─────────────────────────────────────────────────────
const CITY_FALLBACK: Record<string, Omit<Recommendation, "id" | "created_at" | "reviewer_id" | "approved">[]> = {
  vienna: [
    { city: "Vienna", country: "Austria", category: "restaurant", name: "Café Central", description: "One of Vienna's most iconic coffeehouses, housed in a stunning neo-Gothic palace. Locals come for the Melange coffee and apple strudel in a grand setting that feels like stepping back into the 1900s.", address: "Herrengasse 14, 1010 Wien", tips: "Go on a weekday morning to avoid tourist queues — weekends get packed by 10am.", media_urls: [] as string[] },
    { city: "Vienna", country: "Austria", category: "restaurant", name: "Naschmarkt", description: "Vienna's most beloved open-air market stretching over 1.5km. Locals shop here every Saturday morning for fresh produce, cheeses, meats, and street food from around the world.", address: "Naschmarkt, 1060 Wien", tips: "Arrive before 9am on Saturdays for the flea market and freshest produce.", media_urls: [] as string[] },
    { city: "Vienna", country: "Austria", category: "restaurant", name: "Figlmüller Bäckerstraße", description: "Home to Vienna's most famous Wiener Schnitzel, served since 1905. The schnitzels are larger than the plate — a true Viennese institution.", address: "Bäckerstraße 6, 1010 Wien", tips: "Book in advance or arrive at noon when they open.", media_urls: [] as string[] },
    { city: "Vienna", country: "Austria", category: "activity", name: "Prater & Riesenrad", description: "Vienna's beloved public park where locals go to cycle, jog, and relax. The iconic Ferris wheel has been running since 1897.", address: "Prater, 1020 Wien", tips: "Rent a bike and cycle the Hauptallee — 4.5km of chestnut trees.", media_urls: [] as string[] },
    { city: "Vienna", country: "Austria", category: "activity", name: "Kunsthistorisches Museum", description: "One of the world's great art museums. Includes the largest Bruegel collection anywhere — yet it never feels as crowded as the Louvre.", address: "Maria-Theresien-Platz, 1010 Wien", tips: "Free entry on the first Sunday of each month.", media_urls: [] as string[] },
    { city: "Vienna", country: "Austria", category: "activity", name: "Belvedere Gardens", description: "The baroque gardens connecting the Upper and Lower Belvedere palaces are free to enter. The Upper Belvedere houses Klimt's famous 'The Kiss'.", address: "Prinz-Eugen-Straße 27, 1030 Wien", tips: "Visit the Upper Belvedere early morning before tour groups arrive.", media_urls: [] as string[] },
    { city: "Vienna", country: "Austria", category: "hidden_gem", name: "Heuriger wine taverns in Grinzing", description: "Traditional Viennese wine taverns where local winegrowers serve their own wine straight from the barrel. A completely authentic experience tourists almost never find.", address: "Grinzing, 1190 Wien", tips: "Look for a pine branch above the door — it means they're open and wine is fresh.", media_urls: [] as string[] },
    { city: "Vienna", country: "Austria", category: "hidden_gem", name: "Augarten Porcelain Factory", description: "The world's second-oldest porcelain manufacturer (founded 1718) hidden inside Vienna's largest baroque park. Free tours on weekdays.", address: "Obere Augartenstraße 1, 1020 Wien", tips: "Book the 11am tour on Tuesdays or Thursdays. The factory shop sells seconds at a fraction of normal prices.", media_urls: [] as string[] },
  ],
  lisbon: [
    { city: "Lisbon", country: "Portugal", category: "restaurant", name: "Time Out Market", description: "The world's first curated food market featuring the best chefs Lisbon has to offer. Locals actually eat here because the quality is genuinely exceptional.", address: "Av. 24 de Julho 49, 1200-479 Lisboa", tips: "Go for lunch on a weekday — evenings and weekends it's packed.", media_urls: [] as string[] },
    { city: "Lisbon", country: "Portugal", category: "restaurant", name: "A Cevicheria", description: "Chef Kiko's modern Portuguese restaurant is a local favourite. The octopus ceviche and signature Polvo à Lagareiro are dishes locals make reservations weeks in advance for.", address: "R. Dom Pedro V 129, 1250-097 Lisboa", tips: "Book 3 weeks ahead. The wine bar next door serves the same snacks without a reservation.", media_urls: [] as string[] },
    { city: "Lisbon", country: "Portugal", category: "activity", name: "Miradouro da Graça", description: "The best viewpoint in Lisbon that locals actually use. Better view of the castle, river, and bridge than the more famous miradouros.", address: "Largo da Graça, 1170-165 Lisboa", tips: "Bring your own wine and arrive 30 minutes before sunset.", media_urls: [] as string[] },
    { city: "Lisbon", country: "Portugal", category: "activity", name: "LX Factory", description: "A 19th-century industrial complex turned creative village. The Sunday market is the best in Lisbon.", address: "R. Rodrigues de Faria 103, 1300-501 Lisboa", tips: "Sunday market runs 10am–6pm. The rooftop bookshop Ler Devagar is open daily.", media_urls: [] as string[] },
    { city: "Lisbon", country: "Portugal", category: "hidden_gem", name: "Museu do Azulejo", description: "The National Tile Museum is one of Lisbon's genuine treasures — 35,000 tiles in a 16th-century convent. Virtually no queues despite being world-class.", address: "R. da Madre de Deus 4, 1900-312 Lisboa", tips: "Spend at least 2 hours. The 36-metre panorama of pre-earthquake Lisbon is extraordinary.", media_urls: [] as string[] },
    { city: "Lisbon", country: "Portugal", category: "hidden_gem", name: "Pois Café", description: "A cosy, book-lined café in Alfama with mismatched furniture, homemade cakes, great coffee, and genuine neighbourhood feel.", address: "R. São João da Praça 93-95, 1100-521 Lisboa", tips: "Perfect for a quiet breakfast. Order the homemade lemonade and tosta mista.", media_urls: [] as string[] },
  ],
  kyoto: [
    { city: "Kyoto", country: "Japan", category: "restaurant", name: "Nishiki Market", description: "Known as Kyoto's Kitchen — a 400-year-old covered market where local chefs shop. Five blocks of fishmongers, pickle sellers, tofu makers, and street food.", address: "Nishiki Market, Nakagyo-ku, Kyoto", tips: "Go on a weekday morning before 10am. Try the fresh yuba and the grilled skewers at the east end.", media_urls: [] as string[] },
    { city: "Kyoto", country: "Japan", category: "restaurant", name: "Ippudo Kyoto", description: "The best tonkotsu ramen in the city. Locals queue here every lunchtime without fail.", address: "609-1 Higashishiokojicho, Shimogyo-ku, Kyoto", tips: "Arrive 15 minutes before opening. Order the Shiromaru Classic and add extra noodles for free.", media_urls: [] as string[] },
    { city: "Kyoto", country: "Japan", category: "activity", name: "Arashiyama Bamboo Grove at Dawn", description: "The iconic bamboo grove is genuinely magical — but only before 7am when the tour groups haven't arrived. At dawn it feels like another world entirely.", address: "Sagaogurayama Tabuchiyamacho, Ukyo-ku, Kyoto", tips: "Be there by 6am. Combine with Okochi-Sanso villa garden which is almost always empty.", media_urls: [] as string[] },
    { city: "Kyoto", country: "Japan", category: "activity", name: "Philosopher's Path", description: "A 2km stone path along a cherry tree-lined canal connecting Ginkaku-ji and Nanzen-ji temples. Locals walk or cycle it year-round.", address: "Tetsugaku no Michi, Sakyo-ku, Kyoto", tips: "Walk south to north. Stop at Omen noodle restaurant halfway.", media_urls: [] as string[] },
    { city: "Kyoto", country: "Japan", category: "hidden_gem", name: "Daitoku-ji Temple Complex", description: "A vast Zen complex of 24 sub-temples containing some of Kyoto's finest gardens, visited by almost nobody compared to Kinkaku-ji.", address: "53 Daitokujicho, Kita-ku, Kyoto", tips: "Visit Daisen-in for its extraordinary dry garden. Both cost ¥400 and rarely have more than 10 visitors.", media_urls: [] as string[] },
    { city: "Kyoto", country: "Japan", category: "hidden_gem", name: "Pontocho Alley at Night", description: "A narrow cobblestone lane parallel to the Kamo River, lined with restaurants, bars and teahouses. One of Japan's most atmospheric streets — especially in the rain.", address: "Pontocho, Nakagyo-ku, Kyoto", tips: "Walk the whole alley first before choosing a restaurant. Look for noren curtains that look local.", media_urls: [] as string[] },
  ],
  barcelona: [
    { city: "Barcelona", country: "Spain", category: "restaurant", name: "Bar Cañete", description: "A legendary Barcelona tapas bar near the Ramblas that locals actually love. The counter seating is the best spot.", address: "C/ de la Unió 17, 08001 Barcelona", tips: "No reservations for the bar counter — arrive at opening (1pm lunch, 8pm dinner).", media_urls: [] as string[] },
    { city: "Barcelona", country: "Spain", category: "activity", name: "Bunkers del Carmel", description: "Civil War anti-aircraft battery ruins offering the best 360° panoramic view of Barcelona that virtually no tourist finds.", address: "Turó de la Rovira, 08032 Barcelona", tips: "Bring drinks. Sunset here with locals watching the city light up is one of Barcelona's special experiences.", media_urls: [] as string[] },
    { city: "Barcelona", country: "Spain", category: "activity", name: "Palau de la Música Catalana", description: "Domènech i Montaner's Art Nouveau masterpiece — arguably more stunning than the Sagrada Família and far less visited.", address: "C/ del Palau de la Música 4-6, 08003 Barcelona", tips: "Book a guided tour (€22) or attend an evening concert from €15.", media_urls: [] as string[] },
    { city: "Barcelona", country: "Spain", category: "hidden_gem", name: "Gràcia neighbourhood on a Sunday", description: "The village-within-a-city feel of Gràcia is most apparent on Sunday mornings when locals fill its plazas. Zero tourist presence.", address: "Gràcia, 08012 Barcelona", tips: "Have breakfast at Federal Café, then browse the Sunday antique market on C/ de la Riera de Sant Miquel.", media_urls: [] as string[] },
  ],
  copenhagen: [
    { city: "Copenhagen", country: "Denmark", category: "restaurant", name: "Torvehallerne Market", description: "Copenhagen's stunning covered market where locals shop and eat. The best smørrebrød in the city.", address: "Frederiksborggade 21, 1360 København", tips: "Go to Hallernes Smørrebrød — arrive before noon or expect a queue.", media_urls: [] as string[] },
    { city: "Copenhagen", country: "Denmark", category: "activity", name: "Cycling the city", description: "Copenhagen has more bikes than people. Renting a bike and cycling through Nørrebro and along the canals is the definitive Copenhagen experience.", address: "City-wide — rent from Baisikeli, Nørrebrogade", tips: "Cycle to Frederiksberg Gardens for a picnic, then loop through the Lakes at sunset.", media_urls: [] as string[] },
    { city: "Copenhagen", country: "Denmark", category: "hidden_gem", name: "Assistens Cemetery", description: "This beautiful tree-lined cemetery in Nørrebro is where locals jog, sunbathe, and have picnics. Hans Christian Andersen and Kierkegaard are buried here.", address: "Kapelvej 2, 2200 København N", tips: "Free entry always. On summer Sundays the flea market along its outer walls is the best in the city.", media_urls: [] as string[] },
  ],
  "buenos aires": [
    { city: "Buenos Aires", country: "Argentina", category: "restaurant", name: "Don Julio Parrilla", description: "Consistently voted South America's best restaurant. The dry-aged beef, empanadas, and 700-label wine cellar are without equal.", address: "Guatemala 4699, Palermo, Buenos Aires", tips: "Book 30 days ahead. If you can't get a table, arrive at 7pm and wait at the bar.", media_urls: [] as string[] },
    { city: "Buenos Aires", country: "Argentina", category: "activity", name: "Milonga at Club Gricel", description: "Where serious local tango dancers go. The códigos are strictly observed and the dancing is extraordinary to watch.", address: "La Rioja 1180, San Cristóbal, Buenos Aires", tips: "Arrive by 1am. Dress well. The cabeceo (head nod) is the proper way to ask someone to dance.", media_urls: [] as string[] },
    { city: "Buenos Aires", country: "Argentina", category: "hidden_gem", name: "El Ateneo Grand Splendid", description: "A 1919 theatre converted into the world's most beautiful bookshop. The stage is now a café, theatre boxes are reading nooks.", address: "Av. Santa Fe 1860, Recoleta, Buenos Aires", tips: "Go on a weekday morning before 11am. Order a coffee on the stage.", media_urls: [] as string[] },
  ],
};

const CITY_IMAGES: Record<string, string> = {
  vienna: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1400&q=80",
  lisbon: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1400&q=80",
  kyoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=80",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400&q=80",
  copenhagen: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1400&q=80",
  "buenos aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1400&q=80",
};

const CITY_COUNTRIES: Record<string, string> = {
  vienna: "Austria", lisbon: "Portugal", kyoto: "Japan",
  barcelona: "Spain", copenhagen: "Denmark", "buenos aires": "Argentina",
};

const CATEGORY_META = {
  restaurant: { label: "Restaurants & Cafés", icon: <UtensilsCrossed size={18} />, color: "bg-orange-100 text-orange-600", border: "border-orange-200", dot: "bg-orange-400" },
  activity:   { label: "Activities & Sights", icon: <Compass size={18} />,           color: "bg-blue-100 text-blue-600",   border: "border-blue-200",   dot: "bg-blue-400"   },
  hidden_gem: { label: "Hidden Gems & Tips", icon: <Sparkles size={18} />,           color: "bg-purple-100 text-purple-600", border: "border-purple-200", dot: "bg-purple-400" },
};

type CategoryKey = keyof typeof CATEGORY_META;
type AnyRec = Recommendation | Omit<Recommendation, "id" | "created_at" | "reviewer_id" | "approved">;

// ── Photo Lightbox ────────────────────────────────────────────────────────────
function Lightbox({ urls, startIndex, onClose }: { urls: string[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent((c) => (c - 1 + urls.length) % urls.length);
  const next = () => setCurrent((c) => (c + 1) % urls.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X size={28} />
      </button>

      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <img
        src={urls[current]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
      />

      {urls.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
          {current + 1} / {urls.length}
        </p>
      )}
    </div>
  );
}

// ── Photo Gallery ─────────────────────────────────────────────────────────────
function PhotoGallery({ urls }: { urls: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!urls || urls.length === 0) return null;

  const isVideo = (url: string) =>
    url.includes(".mp4") || url.includes(".mov") || url.includes(".webm");

  return (
    <>
      <div className={`grid gap-2 mt-3 ${urls.length === 1 ? "grid-cols-1" : urls.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {urls.slice(0, 6).map((url, i) => (
          <button
            key={i}
            onClick={() => !isVideo(url) && setLightboxIndex(i)}
            className={`relative rounded-xl overflow-hidden bg-gray-100 ${urls.length === 1 ? "aspect-video" : "aspect-square"} group`}
          >
            {isVideo(url) ? (
              <video src={url} className="w-full h-full object-cover" />
            ) : (
              <>
                <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {/* dim overlay with icon on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* "more" badge on last tile */}
                {i === 5 && urls.length > 6 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{urls.length - 6}</span>
                  </div>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          urls={urls.filter(u => !isVideo(u))}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ── City Page ─────────────────────────────────────────────────────────────────
export default function CityPage() {
  const params = useParams();
  const router = useRouter();
  const citySlug = (params.city as string) ?? "";
  const cityName = decodeURIComponent(citySlug);
  const cityKey = cityName.toLowerCase();

  const [dbRecs, setDbRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryKey | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cities/city?name=${encodeURIComponent(cityName)}`);
        const json = await res.json();
        setDbRecs(json.data ?? []);
      } catch {
        setDbRecs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cityName]);

  const fallback = (CITY_FALLBACK[cityKey] ?? []) as AnyRec[];
  const allRecs: AnyRec[] = dbRecs.length > 0 ? [...dbRecs, ...fallback] : fallback;

  const filtered = allRecs.filter((r) => {
    const matchCat = filter === "all" || r.category === filter;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.tips?.toLowerCase().includes(q) ?? false);
    return matchCat && matchQ;
  });

  const grouped = (["restaurant", "activity", "hidden_gem"] as CategoryKey[]).reduce(
    (acc, cat) => { acc[cat] = filtered.filter((r) => r.category === cat); return acc; },
    {} as Record<CategoryKey, AnyRec[]>
  );

  const heroImage = CITY_IMAGES[cityKey] ?? CITY_IMAGES["vienna"];
  const country = CITY_COUNTRIES[cityKey] ?? "";

  return (
    <div className="min-h-screen bg-[#f2f0eb]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Hero */}
      <div className="relative h-56 sm:h-72 md:h-96 lg:h-[30rem] overflow-hidden">
        <img src={heroImage} alt={cityName} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-white/80 hover:text-white text-sm bg-black/25 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to home</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-16 pb-6 sm:pb-10">
          <p className="text-[#3bbfb3] text-xs sm:text-sm font-semibold uppercase tracking-widest mb-1">{country}</p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">{cityName}</h1>
          <p className="text-white/60 text-sm sm:text-base mt-1 sm:mt-2">
            {allRecs.length} local recommendation{allRecs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-[#f2f0eb]/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-8 md:px-16 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFilter("all")}
            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${filter === "all" ? "bg-[#0d2b3e] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
            All
          </button>
          {(Object.keys(CATEGORY_META) as CategoryKey[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${filter === cat ? `${meta.color} border ${meta.border}` : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                {meta.icon}
                <span className="hidden sm:inline">{meta.label}</span>
                <span className="sm:hidden">{meta.label.split(" ")[0]}</span>
              </button>
            );
          })}
          <div className="relative flex-shrink-0 ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#3bbfb3] w-28 sm:w-44" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-16 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <Loader2 size={32} className="animate-spin text-[#3bbfb3]" />
            <p className="text-sm">Loading recommendations…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">No results match your filter.</p>
            <button onClick={() => { setFilter("all"); setSearchQuery(""); }} className="mt-3 text-[#3bbfb3] text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {(Object.keys(CATEGORY_META) as CategoryKey[]).map((cat) => {
              const items = grouped[cat];
              if (items.length === 0) return null;
              const meta = CATEGORY_META[cat];

              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{meta.label}</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${meta.color}`}>{items.length}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {items.map((rec, i) => {
                      const mediaUrls = (rec as any).media_urls as string[] ?? [];
                      return (
                        <div key={"id" in rec ? rec.id : `${cat}-${i}`}
                          className={`bg-white rounded-2xl border ${meta.border} shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>

                          {/* Top photo if available */}
                          {mediaUrls.length > 0 && !mediaUrls[0].includes(".mp4") && !mediaUrls[0].includes(".mov") && (
                            <div className="w-full h-48 overflow-hidden">
                              <img
                                src={mediaUrls[0]}
                                alt={rec.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${meta.dot}`} />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">{rec.name}</h3>

                                {rec.address && (
                                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <MapPin size={10} /> {rec.address}
                                  </p>
                                )}

                                <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">{rec.description}</p>

                                {rec.tips && (
                                  <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-start gap-2">
                                    <Sparkles size={13} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm text-purple-700 leading-relaxed">
                                      <span className="font-semibold">Local tip: </span>{rec.tips}
                                    </p>
                                  </div>
                                )}

                                {/* Photo gallery (remaining photos after hero) */}
                                {mediaUrls.length > 1 && (
                                  <PhotoGallery urls={mediaUrls.slice(1)} />
                                )}
                                {mediaUrls.length === 1 && (
                                  <PhotoGallery urls={mediaUrls} />
                                )}

                                <div className="flex items-center gap-2 mt-3 sm:mt-4 flex-wrap">
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                                  {"created_at" in rec && rec.created_at && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock size={10} />
                                      {new Date(rec.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mt-16 py-6 sm:py-8 px-6 border-t border-gray-200 text-center text-sm text-gray-400 bg-[#eceae4]">
        © {new Date().getFullYear()} SwiftCity · Discover cities through local eyes
      </footer>
    </div>
  );
}