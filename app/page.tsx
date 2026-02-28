"use client";

import { useState } from "react";
import { CheckCircle, MapPin, Search, Coffee, Moon, Wallet, Gem } from "lucide-react";

// --- MOCK DATA (Later from Supabase) ---
const VIBES = [
  { id: "all", label: "All Vibes", icon: null },
  { id: "quiet", label: "Quiet / Work", icon: <Coffee size={16} /> },
  { id: "budget", label: "Street Food", icon: <Wallet size={16} /> },
  { id: "culture", label: "Hidden Gem", icon: <Gem size={16} /> },
  { id: "night", label: "Nightlife", icon: <Moon size={16} /> },
];

const TIPS = [
  {
    id: 1,
    author: "Kenji Sato",
    tier: "City Expert",
    isVerified: true,
    location: "Shibuya, Tokyo",
    vibe: "quiet",
    text: "Skip the Starbucks at the crossing. Go to the 4th floor of the Shibuya Parco building. There is a hidden cafe with fast wifi, no tourists, and a great view of the city.",
    price: "$",
  },
  {
    id: 2,
    author: "Elena Rossi",
    tier: "Insider",
    isVerified: true,
    location: "Trastevere, Rome",
    vibe: "budget",
    text: 'Do not eat at the main piazza. Walk down Via della Scala to "Suppli Roma". Get the classic tomato/mozzarella suppli for €2.',
    price: "$",
  },
  {
    id: 3,
    author: "Marcus J.",
    tier: "Local",
    isVerified: false,
    location: "Soho, London",
    vibe: "night",
    text: "Blind Pig has a great cocktail menu disguised as a children's storybook.",
    price: "$$$",
  },
];

export default function Home() {
  const [activeVibe, setActiveVibe] = useState("all");

  const filteredTips =
    activeVibe === "all"
      ? TIPS
      : TIPS.filter((tip) => tip.vibe === activeVibe);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="font-bold text-lg hidden md:block">SwiftCity</span>
        </div>

        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 max-w-md w-full mx-6">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            placeholder="Search a city..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <button className="bg-black text-white px-4 py-2 rounded-full text-sm">
          Log In
        </button>
      </nav>

      {/* MAIN */}
      <main className="max-w-3xl mx-auto pt-8 px-4 pb-20">
        <h1 className="text-3xl font-black mb-2">Kill the tourist traps.</h1>
        <p className="text-gray-500 mb-6">
          Scannable, verified local tips only.
        </p>

        {/* VIBE FILTERS */}
        <div className="flex gap-3 overflow-x-auto mb-6">
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => setActiveVibe(vibe.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold ${
                activeVibe === vibe.id
                  ? "bg-black text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              <span className="flex items-center gap-2">
                {vibe.icon}
                {vibe.label}
              </span>
            </button>
          ))}
        </div>

        {/* FEED */}
        <div className="space-y-5">
          {filteredTips.map((tip) => (
            <div key={tip.id} className="bg-white p-5 rounded-2xl border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                  {tip.author[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{tip.author}</span>
                    {tip.isVerified && (
                      <CheckCircle size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 uppercase">{tip.tier}</p>
                </div>
              </div>

              <div className="flex gap-3 text-sm mb-3">
                <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <MapPin size={14} />
                  {tip.location}
                </span>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded">
                  {tip.price}
                </span>
              </div>

              <p className="text-gray-800 text-sm leading-relaxed">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}