"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, UtensilsCrossed, Compass, Sparkles,
  MapPin, Clock, Search, Loader2,
} from "lucide-react";
import type { Recommendation } from "@/lib/supabase";

// ── Static fallback data per city ────────────────────────────────────────────
const CITY_FALLBACK: Record<string, Omit<Recommendation, "id" | "created_at" | "reviewer_id" | "approved">[]> = {
  vienna: [
    { city: "Vienna", country: "Austria", category: "restaurant", name: "Café Central", description: "One of Vienna's most iconic coffeehouses, housed in a stunning neo-Gothic palace. Locals come for the Melange coffee and apple strudel in a grand setting that feels like stepping back into the 1900s.", address: "Herrengasse 14, 1010 Wien", tips: "Go on a weekday morning to avoid tourist queues — weekends get packed by 10am." },
    { city: "Vienna", country: "Austria", category: "restaurant", name: "Naschmarkt", description: "Vienna's most beloved open-air market stretching over 1.5km. Locals shop here every Saturday morning for fresh produce, cheeses, meats, and street food from around the world.", address: "Naschmarkt, 1060 Wien", tips: "Arrive before 9am on Saturdays for the flea market section and the freshest produce." },
    { city: "Vienna", country: "Austria", category: "restaurant", name: "Figlmüller Bäckerstraße", description: "Home to Vienna's most famous Wiener Schnitzel, served since 1905. The schnitzels are larger than the plate — a true Viennese institution beloved by locals and visitors alike.", address: "Bäckerstraße 6, 1010 Wien", tips: "Book in advance or go right when they open at noon to get a table without waiting." },
    { city: "Vienna", country: "Austria", category: "activity", name: "Prater & Riesenrad", description: "Vienna's beloved public park is where locals go to cycle, jog, and relax. The iconic giant Ferris wheel (Riesenrad) has been running since 1897 and offers panoramic views of the city.", address: "Prater, 1020 Wien", tips: "Rent a bike and cycle the Hauptallee — a 4.5km straight tree-lined boulevard that's gorgeous in autumn." },
    { city: "Vienna", country: "Austria", category: "activity", name: "Kunsthistorisches Museum", description: "One of the world's great art museums, housed in a magnificent imperial building. The collection includes Vermeer, Raphael, and the largest Bruegel collection anywhere — yet it never feels as crowded as the Louvre.", address: "Maria-Theresien-Platz, 1010 Wien", tips: "Free entry on the first Sunday of each month. The museum café inside the rotunda is stunning even if you skip the art." },
    { city: "Vienna", country: "Austria", category: "activity", name: "Belvedere Gardens", description: "The baroque gardens connecting the Upper and Lower Belvedere palaces are free to enter and perfect for a stroll. The Upper Belvedere houses Klimt's famous 'The Kiss' — worth every cent of the entry fee.", address: "Prinz-Eugen-Straße 27, 1030 Wien", tips: "The gardens are free. Visit the Upper Belvedere early morning for the Klimt rooms before tour groups arrive." },
    { city: "Vienna", country: "Austria", category: "hidden_gem", name: "Heuriger wine taverns in Grinzing", description: "Traditional Viennese wine taverns in the hills north of the city where local winegrowers serve their own wine straight from the barrel. A completely authentic experience that tourists almost never find.", address: "Grinzing, 1190 Wien", tips: "Take tram D to Nussdorf then walk uphill. Look for a pine branch above the door — it means they're open and wine is fresh." },
    { city: "Vienna", country: "Austria", category: "hidden_gem", name: "Augarten Porcelain Factory", description: "The world's second-oldest porcelain manufacturer (founded 1718) is hidden inside Vienna's largest baroque park. Free tours on weekdays — a genuinely unique Vienna secret.", address: "Obere Augartenstraße 1, 1020 Wien", tips: "Book the 11am tour on Tuesdays or Thursdays. The factory shop sells seconds at a fraction of normal prices." },
  ],
  lisbon: [
    { city: "Lisbon", country: "Portugal", category: "restaurant", name: "Time Out Market", description: "The world's first curated food market, featuring the best chefs and restaurants Lisbon has to offer under one roof. Locals actually eat here — not just tourists — because the quality is genuinely exceptional.", address: "Av. 24 de Julho 49, 1200-479 Lisboa", tips: "Go for lunch on a weekday — evenings and weekends it's packed. The seafood rice from Henrique Sá Pessoa is unmissable." },
    { city: "Lisbon", country: "Portugal", category: "restaurant", name: "A Cevicheria", description: "Chef Kiko's modern Portuguese restaurant is a local favourite despite its fame. The octopus ceviche and the signature 'Polvo à Lagareiro' are dishes locals make reservations weeks in advance for.", address: "R. Dom Pedro V 129, 1250-097 Lisboa", tips: "Book 3 weeks ahead minimum. If you can't get a table, the wine bar next door serves the same snacks." },
    { city: "Lisbon", country: "Portugal", category: "restaurant", name: "Tasca do Chico", description: "One of Lisbon's most authentic fado restaurants, small and intimate with only 30 seats. The food is traditional Portuguese home cooking, the fado is live and heartfelt — not performed for tourists.", address: "R. do Diário de Notícias 39, 1200-145 Lisboa", tips: "Reservations essential. Arrive hungry — the portions are generous and the bread and olive oil alone are worth the trip." },
    { city: "Lisbon", country: "Portugal", category: "activity", name: "Miradouro da Graça", description: "The best viewpoint in Lisbon that locals actually use. Less famous than São Pedro de Alcântara but with a better view of the castle, river, and the 25 de Abril Bridge — especially magical at sunset.", address: "Largo da Graça, 1170-165 Lisboa", tips: "Bring your own wine from the corner shop and arrive 30 minutes before sunset. On Tuesdays there's a small antique market nearby." },
    { city: "Lisbon", country: "Portugal", category: "activity", name: "LX Factory", description: "A converted 19th-century industrial complex turned creative village with independent shops, restaurants, and studios. The Sunday market is the best in Lisbon — local designers, vintage, and street food.", address: "R. Rodrigues de Faria 103, 1300-501 Lisboa", tips: "Sunday market runs 10am–6pm. The rooftop bookshop Ler Devagar is open daily and has a spectacular interior." },
    { city: "Lisbon", country: "Portugal", category: "activity", name: "Tram 28 — Alfama Route", description: "The iconic yellow tram winds through the oldest and steepest parts of Lisbon, through Alfama and Graça. Locals still use it daily — it's not just a tourist attraction but a functioning piece of the city.", address: "Departs from Martim Moniz", tips: "Board at the start of the line (Martim Moniz) to guarantee a seat. Avoid rush hours 8–9am and 6–7pm." },
    { city: "Lisbon", country: "Portugal", category: "hidden_gem", name: "Pois Café", description: "A cosy, book-lined café in Alfama run by Austrians who've made Lisbon home. Mismatched furniture, homemade cakes, great coffee, and a genuine neighbourhood feel completely absent of tourist hustle.", address: "R. São João da Praça 93-95, 1100-521 Lisboa", tips: "Perfect for a quiet breakfast or afternoon reading. The homemade lemonade and the 'tosta mista' are the go-to orders." },
    { city: "Lisbon", country: "Portugal", category: "hidden_gem", name: "Museu do Azulejo", description: "The National Tile Museum is one of Lisbon's genuine treasures — a 16th-century convent filled with 35,000 tiles telling Portugal's entire history. Virtually no queues despite being world-class.", address: "R. da Madre de Deus 4, 1900-312 Lisboa", tips: "Spend at least 2 hours. The 36-metre blue-and-white panorama of pre-earthquake Lisbon (1755) is one of the most extraordinary things in Portugal." },
  ],
  kyoto: [
    { city: "Kyoto", country: "Japan", category: "restaurant", name: "Nishiki Market", description: "Known as 'Kyoto's Kitchen', this narrow 400-year-old covered market is where local chefs and home cooks shop. Five blocks of fishmongers, pickle sellers, tofu makers, and street snack vendors.", address: "Nishiki Market, Nakagyo-ku, Kyoto", tips: "Go on a weekday morning before 10am. Try the fresh yuba (tofu skin) and the grilled skewers at the market's east end." },
    { city: "Kyoto", country: "Japan", category: "restaurant", name: "Ippudo Kyoto", description: "While ramen isn't Kyoto's signature dish, this branch of the legendary Fukuoka chain serves the best tonkotsu ramen in the city. Locals queue here every lunchtime without fail.", address: "609-1 Higashishiokojicho, Shimogyo-ku, Kyoto", tips: "Arrive 15 minutes before opening to get in the first sitting. Order the Shiromaru Classic and add extra noodles for free." },
    { city: "Kyoto", country: "Japan", category: "restaurant", name: "Gion Karyo", description: "Affordable kaiseki cuisine in the heart of Gion. Kaiseki is Kyoto's contribution to world cuisine — a meticulous multi-course meal following seasonal ingredients — and this restaurant makes it accessible.", address: "Gion, Higashiyama-ku, Kyoto", tips: "Book the lunch course (¥3,000–5,000) instead of dinner for the same quality at half the price." },
    { city: "Kyoto", country: "Japan", category: "activity", name: "Arashiyama Bamboo Grove at Dawn", description: "The iconic bamboo grove is genuinely magical — but only before 7am when the tour groups haven't arrived. Locals walk their dogs here at dawn. At that hour it feels like another world entirely.", address: "Sagaogurayama Tabuchiyamacho, Ukyo-ku, Kyoto", tips: "Be there by 6am. Combine with a walk to Okochi-Sanso villa garden (small entry fee) which is almost always empty." },
    { city: "Kyoto", country: "Japan", category: "activity", name: "Philosopher's Path (Tetsugaku no Michi)", description: "A 2km stone path along a cherry tree-lined canal connecting Ginkaku-ji and Nanzen-ji temples. Locals walk or cycle it year-round — cherry blossom season (late March) transforms it into something extraordinary.", address: "Tetsugaku no Michi, Sakyo-ku, Kyoto", tips: "Walk south to north (Nanzen-ji to Ginkaku-ji) to end at the Silver Pavilion. Stop at Omen noodle restaurant halfway." },
    { city: "Kyoto", country: "Japan", category: "activity", name: "Fushimi Inari after dark", description: "The famous vermillion torii gate mountain trail is visited by millions — but almost all of them leave by 5pm. Walking the upper trails at dusk or after dark, with paper lanterns lighting the path, is a completely different experience.", address: "68 Fukakusa Yabunouchicho, Fushimi-ku, Kyoto", tips: "Take the train to Inari station and start at 5:30pm. Bring a torch for the upper trails. The fox shrines at the summit feel genuinely otherworldly at night." },
    { city: "Kyoto", country: "Japan", category: "hidden_gem", name: "Daitoku-ji Temple Complex", description: "A vast Zen temple complex of 24 sub-temples, most of which are closed to the public — but four open ones contain some of Kyoto's finest gardens and are visited by almost nobody compared to Kinkaku-ji.", address: "53 Daitokujicho, Kita-ku, Kyoto", tips: "Visit Daisen-in sub-temple for its extraordinary dry garden, then Koto-in for its maple-lined path. Both cost ¥400 and rarely have more than 10 visitors." },
    { city: "Kyoto", country: "Japan", category: "hidden_gem", name: "Pontocho Alley at Night", description: "A narrow cobblestone lane running parallel to the Kamo River, lined with traditional machiya townhouses converted into restaurants, bars and teahouses. One of Japan's most atmospheric streets, especially in the rain.", address: "Pontocho, Nakagyo-ku, Kyoto", tips: "Walk the whole alley first before choosing a restaurant. Peek through暖簾 (noren) curtains — if the interior looks cramped and local, that's your place." },
  ],
  barcelona: [
    { city: "Barcelona", country: "Spain", category: "restaurant", name: "Bar Cañete", description: "A legendary Barcelona tapas bar near the Ramblas that locals actually love. The counter seating is the best spot — watch the chefs prepare anchoas, croquetas, and the city's finest pa amb tomàquet (bread with tomato).", address: "C/ de la Unió 17, 08001 Barcelona", tips: "No reservations for the bar counter — arrive at opening (1pm lunch, 8pm dinner) and take a stool immediately." },
    { city: "Barcelona", country: "Spain", category: "restaurant", name: "El Born neighbourhood tapas crawl", description: "The El Born district is Barcelona's most liveable neighbourhood and the best place to eat like a local. A crawl through its narrow streets hitting 3–4 different bars for a tapa and a glass each is the authentic Barcelona dining experience.", address: "El Born, Ciutat Vella, Barcelona", tips: "Start at Bar del Pla for vermouth, then Espai Mescladís for creative tapas, ending at El Xampanyet for cava and anchovies." },
    { city: "Barcelona", country: "Spain", category: "restaurant", name: "La Boqueria Market", description: "Barcelona's world-famous covered market is touristy at the entrance but genuinely local deeper inside. Find Bar Pinotxo near the entrance where locals eat — the chickpea stew and grilled squid are legendary.", address: "La Rambla 91, 08001 Barcelona", tips: "Go Tuesday–Thursday morning, avoid weekends. Sit at Bar Pinotxo — owner Juanito will look after you. Budget €15–20 for a full breakfast here." },
    { city: "Barcelona", country: "Spain", category: "activity", name: "Park Güell — the free section", description: "Most visitors pay to enter the monumental zone — but the free sections of Gaudí's park are what locals use. The viaducts, forested paths, and neighbourhood squares are completely authentic and almost always quiet.", address: "C/ d'Olot, s/n, 08024 Barcelona", tips: "Enter from the Carmel side (less touristy). The 'Turó de les Tres Creus' hill inside the free zone has the best 360° view of the city." },
    { city: "Barcelona", country: "Spain", category: "activity", name: "Palau de la Música Catalana", description: "Domènech i Montaner's Art Nouveau masterpiece is arguably more stunning than the Sagrada Família — and far less visited. The stained glass ceiling alone is worth the entry fee. Even better: attend an evening concert.", address: "C/ del Palau de la Música 4-6, 08003 Barcelona", tips: "Book a daytime guided tour (€22) or, better, check the concert calendar — affordable tickets from €15 let you hear music in this incredible space." },
    { city: "Barcelona", country: "Spain", category: "activity", name: "Montjuïc at sunset", description: "The hill overlooking the port is where Barcelona locals come for evening walks, open-air cinema, and the famous Magic Fountain show. The views over the city and sea at golden hour are breathtaking.", address: "Montjuïc, 08038 Barcelona", tips: "Take the cable car up, walk down via the castle and gardens. The Magic Fountain runs Thursday–Sunday evenings May–September — completely free." },
    { city: "Barcelona", country: "Spain", category: "hidden_gem", name: "Gràcia neighbourhood on a Sunday", description: "The village-within-a-city feel of Gràcia is most apparent on Sunday mornings when locals fill the neighbourhood's many plazas. Plaza de la Vila de Gràcia and Plaza del Sol are social hubs with terraces and zero tourist presence.", address: "Gràcia, 08012 Barcelona", tips: "Have breakfast at Federal Café, then browse the Sunday antique market on C/ de la Riera de Sant Miquel." },
    { city: "Barcelona", country: "Spain", category: "hidden_gem", name: "Bunkers del Carmel", description: "The ruins of an anti-aircraft battery from the Spanish Civil War sit atop a hill in the Carmel neighbourhood, offering the best 360° panoramic view of Barcelona that virtually no tourist ever finds.", address: "Turó de la Rovira, 08032 Barcelona", tips: "Bring drinks from a supermarket. Sunset here with locals drinking beer and watching the city light up is one of Barcelona's truly special experiences." },
  ],
  copenhagen: [
    { city: "Copenhagen", country: "Denmark", category: "restaurant", name: "Torvehallerne Market", description: "Copenhagen's stunning covered market in the city centre is where locals shop and eat. Two glass halls filled with fresh produce, specialist food stalls, coffee roasters, and the best smørrebrød (open sandwiches) in the city.", address: "Frederiksborggade 21, 1360 København", tips: "The coffee at The Coffee Collective here is the best in Denmark. For smørrebrød, go to Hallernes Smørrebrød — arrive before noon or expect a queue." },
    { city: "Copenhagen", country: "Denmark", category: "restaurant", name: "Reffen Street Food Market", description: "Scandinavia's largest street food market occupies a waterfront industrial site in Refshaleøen. Over 50 stalls serving everything from Korean BBQ to wood-fired Neapolitan pizza — and it's entirely local.", address: "Refshalevej 167A, 1432 København", tips: "Open Thursday–Sunday May–October. Come at 6pm when Copenhageners finish work and the atmosphere is at its best. Bring cash." },
    { city: "Copenhagen", country: "Denmark", category: "restaurant", name: "Café Nørreport", description: "A genuinely local café near the city's busiest transport hub where office workers, students, and locals of all ages eat lunch. The smørrebrød is traditional, generous, and a fraction of tourist restaurant prices.", address: "Nørre Voldgade 70, 1358 København", tips: "Lunch only — arrive between 11:30am and 1pm. The rullepølse (spiced rolled meat) open sandwich is the classic order." },
    { city: "Copenhagen", country: "Denmark", category: "activity", name: "Cycling the city", description: "Copenhagen has more bikes than people and a cycling infrastructure that is the envy of the world. Renting a bike and following the locals across the harbour bridge, through Nørrebro, and along the canals is the definitive Copenhagen experience.", address: "City-wide — rent from Baisikeli, Nørrebrogade", tips: "Cycle to the Frederiksberg Gardens for a picnic, then loop through the Lakes (Søerne) at sunset. Always use hand signals — Copenhageners take cycling etiquette seriously." },
    { city: "Copenhagen", country: "Denmark", category: "activity", name: "Louisiana Museum of Modern Art", description: "One of the world's great modern art museums, set in a stunning white building overlooking the Øresund strait to Sweden. The permanent collection includes Picasso, Calder and Giacometti, but the building and grounds are the real artwork.", address: "Gl Strandvej 13, 3050 Humlebæk", tips: "Take the S-train to Humlebæk — 35 minutes from Copenhagen. Combine with a swim at Humlebæk beach in summer. The museum café is excellent." },
    { city: "Copenhagen", country: "Denmark", category: "activity", name: "Nørrebro on a Saturday", description: "Copenhagen's most multicultural and creative neighbourhood is at its best on Saturday mornings. The weekly flea market at Assistens Cemetery (also where Kierkegaard is buried), the street art, and the independent coffee shops make it essential.", address: "Nørrebro, 2200 København N", tips: "Start at The Coffee Collective on Jægersborggade, walk the street's independent shops, then head to the cemetery flea market. Grab lunch at Mirabelle bakery." },
    { city: "Copenhagen", country: "Denmark", category: "hidden_gem", name: "Assistens Cemetery", description: "This beautiful tree-lined cemetery in Nørrebro is where locals jog, sunbathe, have picnics, and walk their dogs. Hans Christian Andersen and Søren Kierkegaard are buried here — but Copenhageners come for the green space, not the graves.", address: "Kapelvej 2, 2200 København N", tips: "Free entry always. On summer Sundays the cemetery hosts guided tours and the flea market along its outer walls is the best in the city." },
    { city: "Copenhagen", country: "Denmark", category: "hidden_gem", name: "Refshaleøen island", description: "A former industrial island that's become Copenhagen's most creative neighbourhood. Home to Reffen market, the original Noma (now a test kitchen), artists' studios, and a winter bathing club in a converted shipping container.", address: "Refshalevej, 1432 København", tips: "Rent a kayak from the harbour and paddle there — or take the harbour bus. The swimming pier is open all year for the brave." },
  ],
  "buenos aires": [
    { city: "Buenos Aires", country: "Argentina", category: "restaurant", name: "Don Julio Parrilla", description: "Consistently voted South America's best restaurant and a pilgrimage site for meat lovers worldwide. Yet locals still fill it every night — the USDA Prime dry-aged beef, the empanadas, and the 700-label wine cellar are without peer.", address: "Guatemala 4699, Palermo, Buenos Aires", tips: "Book 30 days ahead online — no exceptions. If you can't get a table, arrive at 7pm (opening) and wait at the bar. Worth every minute." },
    { city: "Buenos Aires", country: "Argentina", category: "restaurant", name: "Café Tortoni", description: "Buenos Aires' oldest and most storied café has been serving cortados and medialunas since 1858. Jorge Luis Borges wrote here, tango was born here — and locals still come for the atmosphere despite the tourist fame.", address: "Av. de Mayo 829, Buenos Aires", tips: "Skip the expensive tango dinner show — instead, order just a coffee and medialunas and absorb the atmosphere. The basement jazz sessions on weekends are the real deal." },
    { city: "Buenos Aires", country: "Argentina", category: "restaurant", name: "Mercado de San Telmo", description: "The 1897 iron-and-glass market in San Telmo houses butchers, cheese sellers, and casual restaurants where locals eat lunch surrounded by antique stalls. The empanadas and choripán here are the city's best kept secret.", address: "Carlos Calvo 430, San Telmo, Buenos Aires", tips: "Go for lunch Tuesday–Friday to avoid weekend tourist crowds. The central food stalls are cheaper and better than the restaurants around the market's edge." },
    { city: "Buenos Aires", country: "Argentina", category: "activity", name: "Milonga at Club Gricel", description: "Buenos Aires has hundreds of milongas (tango dance halls) but Club Gricel in San Cristóbal is where serious local dancers go. The códigos (tango etiquette) are strictly observed and the dancing is extraordinary to watch even if you don't participate.", address: "La Rioja 1180, San Cristóbal, Buenos Aires", tips: "Arrive by 1am (yes, 1am — this is Buenos Aires). Dress smartly. Observe before dancing. The 'cabeceo' (head nod invitation) is the proper way to ask someone to dance." },
    { city: "Buenos Aires", country: "Argentina", category: "activity", name: "MALBA — Latin American Art Museum", description: "The Museum of Latin American Art houses an extraordinary collection of 20th-century works by Frida Kahlo, Diego Rivera, and Argentina's own Antonio Berni — in a stunning Palermo building that's never overcrowded.", address: "Av. Figueroa Alcorta 3415, Palermo, Buenos Aires", tips: "Free entry on Wednesdays after 7pm. The museum cinema shows arthouse films Thursday–Sunday — a genuine Buenos Aires cultural institution." },
    { city: "Buenos Aires", country: "Argentina", category: "activity", name: "Palermo Soho on a Sunday", description: "The Sunday market at Plaza Serrano (Plazoleta Cortázar) is where Palermo comes alive — local designers, artisans, live music, and the city's best people-watching. Surrounded by the neighbourhood's best bars and restaurants.", address: "Plaza Serrano, Palermo Soho, Buenos Aires", tips: "Arrive at noon when it gets going. The surrounding streets (Honduras, Thames, El Salvador) have excellent brunch spots. Budget 3–4 hours to do it properly." },
    { city: "Buenos Aires", country: "Argentina", category: "hidden_gem", name: "El Ateneo Grand Splendid", description: "A 1919 theatre converted into what National Geographic called the world's most beautiful bookshop. The stage is now a café, the theatre boxes are reading nooks — and it's a working bookshop that Porteños actually use.", address: "Av. Santa Fe 1860, Recoleta, Buenos Aires", tips: "Go on a weekday morning before 11am. Order a coffee on the stage and read for an hour. Buy something — it would be rude not to." },
    { city: "Buenos Aires", country: "Argentina", category: "hidden_gem", name: "La Boca beyond Caminito", description: "Every tourist goes to the colourful Caminito street in La Boca — but one block away is the real neighbourhood. Conventional buildings, local bodegas, kids playing football, and a completely unperformed version of Buenos Aires street life.", address: "La Boca, Buenos Aires", tips: "Go with a local or in a group — La Boca beyond the tourist strip requires awareness. The football stadium tour at La Bombonera next door is unmissable for any football fan." },
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
  activity: { label: "Activities & Sights", icon: <Compass size={18} />, color: "bg-blue-100 text-blue-600", border: "border-blue-200", dot: "bg-blue-400" },
  hidden_gem: { label: "Hidden Gems & Tips", icon: <Sparkles size={18} />, color: "bg-purple-100 text-purple-600", border: "border-purple-200", dot: "bg-purple-400" },
};

type CategoryKey = keyof typeof CATEGORY_META;

type AnyRec = Recommendation | Omit<Recommendation, "id" | "created_at" | "reviewer_id" | "approved">;

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

  // Merge DB recs with fallback — DB recs go first if they exist
  const fallback = CITY_FALLBACK[cityKey] ?? [];
  const allRecs: AnyRec[] = dbRecs.length > 0 ? [...dbRecs, ...fallback] : fallback;

  const filtered = allRecs.filter((r) => {
    const matchesCategory = filter === "all" || r.category === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.tips?.toLowerCase().includes(q) ?? false);
    return matchesCategory && matchesSearch;
  });

  const grouped = (["restaurant", "activity", "hidden_gem"] as CategoryKey[]).reduce(
    (acc, cat) => { acc[cat] = filtered.filter((r) => r.category === cat); return acc; },
    {} as Record<CategoryKey, AnyRec[]>
  );

  const heroImage = CITY_IMAGES[cityKey] ?? CITY_IMAGES["vienna"];
  const country = CITY_COUNTRIES[cityKey] ?? "";

  return (
    <div className="min-h-screen bg-[#f2f0eb]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* ── Hero ── */}
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

      {/* ── Filters + Search ── */}
      <div className="sticky top-0 z-10 bg-[#f2f0eb]/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-8 md:px-16 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              filter === "all" ? "bg-[#0d2b3e] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_META) as CategoryKey[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filter === cat ? `${meta.color} border ${meta.border}` : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {meta.icon}
                <span className="hidden sm:inline">{meta.label}</span>
                <span className="sm:hidden">{meta.label.split(" ")[0]}</span>
              </button>
            );
          })}
          <div className="relative flex-shrink-0 ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#3bbfb3] w-28 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-5">
                    {items.map((rec, i) => (
                      <div
                        key={"id" in rec ? rec.id : `${cat}-${i}`}
                        className={`bg-white rounded-2xl border ${meta.border} shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${meta.dot}`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">{rec.name}</h3>

                            {rec.address && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <MapPin size={10} /> {rec.address}
                              </p>
                            )}

                            <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 leading-relaxed">{rec.description}</p>

                            {rec.tips && (
                              <div className="mt-3 sm:mt-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-start gap-2">
                                <Sparkles size={13} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs sm:text-sm text-purple-700 leading-relaxed">
                                  <span className="font-semibold">Local tip: </span>{rec.tips}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-3 sm:mt-4 flex-wrap">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                              {"created_at" in rec && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock size={10} />
                                  {new Date(rec.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mt-16 py-6 sm:py-8 px-6 border-t border-gray-200 text-center text-sm text-gray-400 bg-[#eceae4]">
        © {new Date().getFullYear()} Mr. International · Discover cities through local eyes
      </footer>
    </div>
  );
}
