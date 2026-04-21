"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Lock, CheckCircle, Coffee, Sun, Moon,
  MapPin, Clock, Sparkles, Crown, Star,
} from "lucide-react";

// ── 3-day itineraries ────────────────────────────────────────────────────────
const ITINERARIES: Record<string, {
  tagline: string;
  days: { title: string; morning: { place: string; description: string; tip: string }; afternoon: { place: string; description: string; tip: string }; evening: { place: string; description: string; tip: string } }[]
}> = {
  vienna: {
    tagline: "Coffee houses, imperial palaces, and wine taverns — the local Vienna nobody shows tourists.",
    days: [
      {
        title: "Imperial Vienna & the coffee house culture",
        morning: { place: "Café Hawelka", description: "Start at this legendary 1930s coffeehouse, unchanged for decades. Order a Melange and a Buchteln (sweet bun). The owners' grandchildren still run it.", tip: "Arrive at 8am before the regulars fill every seat. Read the Viennese newspapers hung on wooden rods — a century-old tradition." },
        afternoon: { place: "Kunsthistorisches Museum", description: "Skip the Hofburg crowds and spend your afternoon in the imperial art museum. The Bruegel room alone is worth the trip — the largest collection in the world.", tip: "Free entry on the first Sunday of each month. The café inside the rotunda is exceptional — have lunch here." },
        evening: { place: "Heuriger in Grinzing", description: "Take tram D to the wine village of Grinzing in Vienna's hills. Find a Heuriger (wine tavern) with a pine branch above the door — that means they're open and the wine is fresh from this year's harvest.", tip: "Sit in the courtyard. Order the house Grüner Veltliner by the carafe. Eat the bread and lard. Stay until they kick you out." },
      },
      {
        title: "Markets, parks and hidden Vienna",
        morning: { place: "Naschmarkt — early", description: "The 1.5km open-air market at its best before 9am. Vendors set up, chefs shop, and the flea market section at the far end has extraordinary finds.", tip: "Walk to the far eastern end first for the flea market, then work your way back through the food stalls. Don't leave without trying the Turkish baklava." },
        afternoon: { place: "Augarten park and porcelain factory", description: "Vienna's most underrated baroque park. The world's second-oldest porcelain manufacturer (founded 1718) runs free tours inside — a complete secret.", tip: "Book the 11am Tuesday or Thursday tour at augarten.at. The factory outlet sells seconds (flawed pieces) for a fraction of normal prices." },
        evening: { place: "Beisl dinner in the 7th district", description: "The 7th district (Neubau) is where young Viennese actually eat. A traditional Beisl (tavern) serves Tafelspitz (boiled beef), Viennese liver, and cold beer in a wood-panelled room.", tip: "Try Zum Wohl on Burggasse — no reservations, local crowd, outstanding Tafelspitz. Arrive at 7pm and expect to share a table." },
      },
      {
        title: "The Vienna locals love most",
        morning: { place: "Prater and the Würstelstand", description: "Start with a morning walk or bike ride through the Prater park's Hauptallee — 4.5km of chestnut trees. Stop at a Würstelstand (sausage stand) for breakfast like a real Viennese.", tip: "Order a Käsekrainer (cheese-filled sausage) with mustard and a roll. This is the authentic Viennese breakfast, eaten standing up at the counter." },
        afternoon: { place: "Belvedere gardens and Upper Belvedere", description: "The baroque gardens are free. The Upper Belvedere houses Klimt's The Kiss in person — smaller than expected but extraordinary. The view back toward the city from the top terrace is one of the best in Vienna.", tip: "Go at 10am when doors open — by 11am the Klimt room is packed. The Lower Belvedere's Orangery is usually empty and equally beautiful." },
        evening: { place: "Ball season or live music", description: "If visiting November–February, Vienna's ball season is open to everyone — not just aristocrats. The Philharmoniker Ball is sold out years ahead, but the Kaffeesieder Ball and Akademiker Ball have tickets available.", tip: "Outside ball season, the Konzerthaus and Musikverein both sell €15 standing tickets on the door for same-day performances. World-class music for the price of a beer." },
      },
    ],
  },
  lisbon: {
    tagline: "Fado, viewpoints, and trams — the Lisbon that locals still actually live in.",
    days: [
      {
        title: "Alfama and the soul of Lisbon",
        morning: { place: "Pois Café", description: "A cosy book-lined café in Alfama run by Austrians who fell in love with Lisbon. Mismatched furniture, homemade cakes, superb coffee — and zero tourist energy.", tip: "Order the homemade lemonade and a tosta mista. Arrive before 9:30am to get the window seat looking down toward the river." },
        afternoon: { place: "Museu do Azulejo", description: "The National Tile Museum is in a 16th-century convent and contains 35,000 tiles telling Portugal's entire history. The 36-metre blue-and-white panorama of pre-earthquake Lisbon (1755) is extraordinary.", tip: "Takes 2 hours minimum. No audio guide needed — the panels are self-explanatory. The museum café in the cloister is one of Lisbon's nicest spots for a coffee." },
        evening: { place: "Tasca do Chico", description: "One of Lisbon's most authentic fado houses — only 30 seats, traditional food, live fado that feels genuinely emotional rather than performed for cameras.", tip: "Book 2 weeks ahead at minimum. Arrive on time. Order the bacalhau (salt cod) and a half-carafe of the house red. The fado starts around 9pm." },
      },
      {
        title: "Miradouros, markets and a tram ride",
        morning: { place: "Tram 28 from Martim Moniz", description: "Board at the start of the line (Martim Moniz) at 9am to guarantee a seat. The tram winds through Alfama, Graça and Estrela — 30 minutes of the city's most authentic streets.", tip: "Stand on the outside platform for photos. Watch your pockets in crowded stops. Get off at Largo do Chiado for coffee at A Brasileira — Pessoa's old haunt." },
        afternoon: { place: "LX Factory Sunday market", description: "The 19th-century industrial complex turned creative village hosts Lisbon's best Sunday market — local designers, vintage finds, street food, and the rooftop bookshop Ler Devagar.", tip: "The bookshop has an internal spiral staircase that's one of Lisbon's most photographed spaces. The market runs 10am–6pm every Sunday." },
        evening: { place: "Miradouro da Graça at sunset", description: "The best viewpoint in Lisbon that locals actually use. Less famous than São Pedro de Alcântara but with a superior view of the castle, the river, and the 25 de Abril Bridge.", tip: "Bring a bottle of wine from the corner shop. Arrive 30 minutes before sunset. On Tuesdays there's a small antique market 50 metres away." },
      },
      {
        title: "Belém, Bairro Alto and the river",
        morning: { place: "Pastéis de Belém", description: "The original pastel de nata bakery, operating since 1837. The recipe is still secret, known only to three people. These are categorically different from every other pastel de nata in Lisbon.", tip: "Arrive at 8am when they open. Eat standing at the counter in the old azulejo-tiled rooms at the back — not the tourist dining room at the front. Order three." },
        afternoon: { place: "A Cevicheria in Príncipe Real", description: "Chef Kiko's modern Portuguese restaurant is genuinely beloved by locals. The octopus ceviche and the signature polvo à lagareiro are extraordinary. Reservations essential.", tip: "Book 3 weeks ahead. If you can't get a table, the wine bar next door (by the same kitchen) serves the same snacks with no reservation." },
        evening: { place: "Bairro Alto bar crawl", description: "Lisbon's nightlife district is packed with tiny bars that open onto the street at night. The locals don't start until 11pm — cheap ginjinha (cherry liqueur) flows from hole-in-the-wall bars.", tip: "Start at Bar da Tronco on Rua da Barroca, work uphill. Don't spend more than one drink per bar — the point is to move. This goes until 3am minimum." },
      },
    ],
  },
  kyoto: {
    tagline: "Zen temples, bamboo groves, and kaiseki — the Kyoto that exists before the tour buses arrive.",
    days: [
      {
        title: "Dawn rituals and ancient Kyoto",
        morning: { place: "Fushimi Inari at 6am", description: "The famous vermillion torii gate mountain trail visited by millions — but almost all of them leave by 5pm. At dawn, with paper lanterns still lit and mist in the bamboo, it's a completely different place.", tip: "Take the first train from Kyoto station (around 5:30am). Walk the upper trails for 90 minutes before turning back — the summit foxes feel genuinely otherworldly at that hour." },
        afternoon: { place: "Nishiki Market", description: "Kyoto's Kitchen — a 400-year-old covered market where local chefs actually shop. Five blocks of fishmongers, pickle sellers, tofu makers, and street food vendors.", tip: "Go Tuesday–Friday before 11am. Try the fresh yuba (tofu skin) from Yuba Hanbey, the skewers from the stall near the east exit, and a cup of dashi broth." },
        evening: { place: "Pontocho Alley", description: "A narrow cobblestone lane parallel to the Kamo River, lined with traditional machiya converted into restaurants and teahouses. One of Japan's most atmospheric streets — especially in rain.", tip: "Walk the whole alley first before choosing a restaurant. Peek through the noren (fabric curtains) — if the interior looks cramped and local, that's your place. Budget ¥5,000 per person." },
      },
      {
        title: "Zen gardens and the philosopher's path",
        morning: { place: "Daitoku-ji at opening", description: "A vast Zen complex of 24 sub-temples, most closed to the public. The four open ones contain Kyoto's finest gardens and are visited by almost nobody compared to Kinkaku-ji.", tip: "Visit Daisen-in for its extraordinary dry garden (¥400), then Koto-in for the maple-lined path. Both rarely have more than 10 visitors at 9am." },
        afternoon: { place: "Philosopher's Path", description: "A 2km stone path along a cherry tree-lined canal connecting Ginkaku-ji and Nanzen-ji temples. Walk south to north. At cherry blossom time (late March) it becomes one of Japan's most beautiful walks.", tip: "Stop at Omen noodle restaurant exactly halfway — the udon in sesame broth is exceptional. No reservations — arrive at 11:30am before the lunch queue." },
        evening: { place: "Gion kaiseki dinner", description: "Kaiseki is Kyoto's contribution to world cuisine — a meticulous multi-course meal following seasonal ingredients. Gion Karyo makes it accessible at lunch (¥3,000–5,000) or dinner (¥8,000+).", tip: "Book the lunch course for the same quality at half the price. If you want the full evening experience, Kikunoi Honten is Michelin-starred and has English menus." },
      },
      {
        title: "Arashiyama and hidden neighbourhood Kyoto",
        morning: { place: "Arashiyama bamboo grove at dawn", description: "Be there by 6am — before the bamboo becomes a selfie factory. At dawn with only locals walking their dogs, the 30-metre stalks of green bamboo feel genuinely magical.", tip: "Combine with Okochi-Sanso villa garden (¥1,000 entry, includes tea) which is almost always empty even at peak season. The garden views over Kyoto are extraordinary." },
        afternoon: { place: "Nishiki neighbourhood exploration", description: "Away from the main tourist circuits, Kyoto's residential streets contain extraordinary small shrines, machiya (townhouses), and local shotengai (covered shopping streets) unchanged since the 1960s.", tip: "Walk the Nishiki Koji street market then turn into the Teramachi shotengai. Browse the knife shops, paper sellers, and Buddhist supply stores. Everything here is functioning local life." },
        evening: { place: "Sake bar in Fushimi", description: "Fushimi is Kyoto's sake-producing district, home to 35 breweries. Several have walk-in tasting rooms open evenings — you can taste 5 different sake varieties from the same brewery for ¥500.", tip: "Gekkeikan Okura Sake Museum has the best tasting room. Kizakura Kappa Country (nearby) has a beer garden in summer that local salarymen pack every Friday evening." },
      },
    ],
  },
  barcelona: {
    tagline: "Tapas, rooftop views, and neighbourhoods tourists never find — the Barcelona locals eat, drink and sleep in.",
    days: [
      {
        title: "El Born and the real Gaudí",
        morning: { place: "Federal Café in Gràcia", description: "Barcelona's best brunch café is hidden in Gràcia — the village-within-a-city that locals actually live in. Australian-influenced brunch with exceptional coffee, in a neighbourhood with zero tourist energy.", tip: "Arrive at 9am. Order the avocado toast with poached eggs and a flat white. After eating, walk the Gràcia neighbourhood streets — Sunday mornings the plazas fill with locals." },
        afternoon: { place: "Palau de la Música Catalana", description: "Domènech i Montaner's Art Nouveau masterpiece is arguably more stunning than the Sagrada Família — and far less visited. The stained glass ceiling floods the concert hall with coloured light.", tip: "Book a guided tour (€22) or check the concert calendar — tickets from €15 let you hear music in this extraordinary space. Far better than a daytime tour." },
        evening: { place: "Bar Cañete tapas", description: "A legendary Barcelona tapas bar near the Ramblas that locals actually love. Counter seating only — watch the chefs prepare anchoas, croquetas, and the city's finest pa amb tomàquet (bread rubbed with tomato).", tip: "No reservations for the counter. Arrive at 1pm exactly when they open for lunch. Order the croquetas de jamón, the anchovies from L'Escala, and a glass of house cava." },
      },
      {
        title: "Markets, montjuïc and the sea",
        morning: { place: "La Boqueria — early and deep", description: "Barcelona's famous market is touristy at the entrance but genuinely local deeper inside. Find Bar Pinotxo near the main entrance — the chickpea stew and grilled squid are legendary.", tip: "Go Tuesday–Thursday at 8am. Sit at Bar Pinotxo's counter — owner Juanito will look after you. Budget €15–20 for a full breakfast. Avoid weekends entirely." },
        afternoon: { place: "Montjuïc castle and gardens", description: "The hill overlooking the port is where Barcelona locals come for walks, picnics, and the Magic Fountain show. The castle gardens are free, the views over the sea are extraordinary.", tip: "Take the cable car up from Barceloneta beach (€12.50 return). Walk down through the botanical gardens. The Magic Fountain show runs Thursday–Sunday evenings May–September — completely free." },
        evening: { place: "El Born neighbourhood dinner", description: "El Born is Barcelona's most liveable neighbourhood. A tapas crawl through its narrow streets hitting 3–4 bars for one tapa and one drink each is the authentic Barcelona evening.", tip: "Start at Bar del Pla for vermouth (5pm), move to Espai Mescladís for creative tapas (7pm), end at El Xampanyet for house cava and anchovies (9pm). Walk slowly between — the streets are the experience." },
      },
      {
        title: "Bunkers, Gràcia and the real Barcelona",
        morning: { place: "Bunkers del Carmel", description: "The ruins of a Spanish Civil War anti-aircraft battery sit atop a hill in Carmel, offering the best 360° panoramic view of Barcelona that virtually no tourist ever finds.", tip: "Bring drinks from a supermarket. Arrive at 7am for sunrise over the city, or at sunset (8pm in summer) when locals bring wine and watch the city turn golden. No entry fee, ever." },
        afternoon: { place: "Gràcia Sunday exploration", description: "Barcelona's most authentic neighbourhood is at its best on Sunday afternoons when residents fill the plazas. Plaza del Sol and Plaza de la Vila de Gràcia are full of families, dogs, and spontaneous music.", tip: "Browse the Sunday market on Carrer de la Riera de Sant Miquel for local crafts and vintage. Have lunch at any restaurant with handwritten menus and no photos — the plainer the better." },
        evening: { place: "Barceloneta beach sunset and chiringuito", description: "Locals don't go to Barceloneta beach in summer heat — they go at 7pm when the light turns golden and the crowds thin. A chiringuito (beach bar) with cold beer and patatas bravas is the perfect end.", tip: "Walk north past the Olympic Port to the quieter Mar Bella beach — a favourite with locals. The Shöko beach club has a terrace that's magical at dusk without a reservation required." },
      },
    ],
  },
  copenhagen: {
    tagline: "Cycling, smørrebrød and new Nordic food — Copenhagen through the eyes of people who actually live there.",
    days: [
      {
        title: "Cycling, markets and hygge",
        morning: { place: "The Coffee Collective at Torvehallerne", description: "Copenhagen's legendary specialty coffee roaster inside the stunning covered glass market. The best coffee in Scandinavia, surrounded by Danes buying their weekend groceries.", tip: "Order a filter coffee and a cardamom bun. Then walk the whole market — buy cheese, pickled herring, and smoked salmon for a picnic. Budget 30 minutes to browse properly." },
        afternoon: { place: "Cycle the Lakes and Nørrebro", description: "Rent a bike from Baisikeli on Nørrebrogade and cycle the Søerne (the Lakes) — a 6km loop of interconnected lakes surrounded by Copenhagen's most handsome residential streets.", tip: "Extend the loop through Nørrebro. Stop at Jægersborggade — 200 metres of independent shops, the best bakery in the city (Mirabelle), and the original Coffee Collective roastery." },
        evening: { place: "Reffen street food market", description: "Scandinavia's largest street food market on a waterfront industrial site in Refshaleøen. 50+ stalls, local crowd, views over the harbour. Open Thursday–Sunday evenings May–October.", tip: "Take the harbour bus (ticket counts as metro fare) to Refshaleøen. Come at 6pm when Copenhagen's after-work crowd arrives. Bring cash. The Korean BBQ and wood-fired pizza are exceptional." },
      },
      {
        title: "Louisiana, Nørrebro and new Nordic",
        morning: { place: "Louisiana Museum of Modern Art", description: "One of the world's great modern art museums, set in a white modernist building overlooking the Øresund strait to Sweden. Permanent collection includes Picasso, Calder, and Giacometti.", tip: "Take the S-train to Humlebæk (35 minutes from Copenhagen). Combine with a swim at the beach below the museum in summer. The museum café overlooking Sweden is exceptional for lunch." },
        afternoon: { place: "Assistens Cemetery and Nørrebro", description: "Copenhagen's most beloved cemetery is where locals jog, sunbathe, and have picnics. Hans Christian Andersen and Søren Kierkegaard are buried here — but Copenhageners come for the green space.", tip: "Enter from Kapelvej. On summer Sundays the flea market along the outer walls is the best in the city. Walk up to Nørrebrогade afterward for coffee at Mirabelle bakery." },
        evening: { place: "New Nordic dinner in Vesterbro", description: "Copenhagen's Vesterbro neighbourhood has the city's best restaurant-per-block ratio outside Noma. Relæ (now Manfreds) and Bæst serve genuinely local food without the Noma price tag.", tip: "Bæst on Guldbergsgade serves natural wine, organic pizza, and house-made charcuterie. Book a week ahead for weekends. The bar seats are walk-in until 6pm." },
      },
      {
        title: "Harbour life and hidden Copenhagen",
        morning: { place: "Smørrebrød breakfast at Hallernes", description: "Traditional Danish open-faced sandwiches at the best smørrebrød counter in Torvehallerne market. The rullepølse (spiced rolled meat), pickled herring, and egg salad versions are essential.", tip: "Arrive before noon — they sell out. Eat standing at the counter like a Dane. Order a small beer alongside (yes, at breakfast — this is Denmark)." },
        afternoon: { place: "Refshaleøen island exploration", description: "Copenhagen's former industrial island is now the city's most creative neighbourhood — studios, concept stores, the Noma test kitchen, and a harbour bathing area in converted shipping containers.", tip: "Walk the full island circuit (45 minutes). The winter swimming club is open year-round — locals swim here daily regardless of temperature. The island café is excellent for afternoon coffee." },
        evening: { place: "Kayaking the canals at sunset", description: "Renting a kayak from the harbour and paddling Copenhagen's canals at sunset is one of the city's great experiences. You can kayak right past Nyhavn, under the bridges, and into the inner harbour.", tip: "Rent from GoBoat or Kayak Republic near Christianshavn. No experience needed. Paddle to Freetown Christiania and moor at their harbour café for a drink before paddling back." },
      },
    ],
  },
  "buenos aires": {
    tagline: "Steak, tango and neighbourhood life — Buenos Aires the way Porteños actually live it.",
    days: [
      {
        title: "Palermo, meat and the bookshop",
        morning: { place: "El Ateneo Grand Splendid", description: "A 1919 theatre converted into what National Geographic called the world's most beautiful bookshop. The stage is now a café, theatre boxes are reading nooks, the ceiling frescoes are intact.", tip: "Go at 9am when it opens. Order a coffee on the stage and read for an hour. The bookshop is fully functioning — buy something. It would be rude not to." },
        afternoon: { place: "Palermo Soho Sunday market", description: "The Sunday market at Plaza Serrano (Plazoleta Cortázar) is where Palermo comes alive — local designers, artisans, live music, and the city's best people-watching.", tip: "Arrive at noon when it gets going. The surrounding streets (Honduras, Thames, El Salvador) have excellent brunch spots. Budget 3 hours. The leather goods here are excellent value." },
        evening: { place: "Don Julio Parrilla", description: "Consistently voted South America's best restaurant and a pilgrimage site for meat lovers. Yet locals still fill it every night — the dry-aged beef, the empanadas, and the 700-label wine cellar are without equal.", tip: "Book 30 days ahead at donjulio.com.ar. If you can't get a table, arrive at 7pm (opening) and wait at the bar. Order the entrecôte, the provoleta, and the house Malbec." },
      },
      {
        title: "San Telmo, tango and Café Tortoni",
        morning: { place: "Café Tortoni", description: "Buenos Aires' oldest and most storied café has been serving cortados and medialunas since 1858. Borges wrote here. Tango was born in cafés like this. Locals still come daily.", tip: "Skip the expensive tango dinner show — instead, sit with a coffee and medialunas and absorb the atmosphere. The basement jazz sessions on weekends are the real deal (starts 11pm)." },
        afternoon: { place: "Mercado de San Telmo", description: "The 1897 iron-and-glass market houses butchers, cheese sellers, antique stalls, and casual restaurants where locals eat lunch. The empanadas and choripán are the city's best kept secret.", tip: "Go Tuesday–Friday for lunch to avoid weekend crowds. The central food stalls are cheaper and better than the restaurants around the market's edge. Budget $10 for a full lunch." },
        evening: { place: "Milonga at Club Gricel", description: "Buenos Aires has hundreds of milongas (tango dance halls) but Club Gricel is where serious local dancers go. The códigos (tango etiquette) are strictly observed and the dancing is extraordinary.", tip: "Arrive by 1am (yes, 1am — this is Buenos Aires). Dress well. Observe before attempting to dance. The cabeceo (head nod invitation) is the only proper way to ask someone to dance." },
      },
      {
        title: "Recoleta, Boca and neighbourhood life",
        morning: { place: "Recoleta Cemetery at opening", description: "The most famous cemetery in South America — an entire city of ornate mausoleums housing Argentina's elite, including Evita Perón. Most extraordinary at 8am before tour groups arrive.", tip: "Enter at 8am (opening) with a map from the guard. The Duarte family vault (Evita's tomb) is easy to find. Budget 90 minutes to walk the full grid of neoclassical streets." },
        afternoon: { place: "MALBA museum", description: "The Museum of Latin American Art houses an extraordinary collection of 20th-century works by Frida Kahlo, Diego Rivera, and Antonio Berni in a stunning Palermo building. Never overcrowded.", tip: "Free entry on Wednesdays after 7pm. The museum cinema shows arthouse films Thursday–Sunday — a genuine Buenos Aires cultural institution that locals pack every week." },
        evening: { place: "La Boca beyond Caminito", description: "Every tourist goes to the colourful Caminito street — one block away is the real La Boca. Conventional buildings, local bodegas, kids playing football, and completely unperformed street life.", tip: "Go with locals or as a group — La Boca beyond the tourist strip requires awareness. The football stadium tour at La Bombonera (2 blocks away) is unmissable for any football fan." },
      },
    ],
  },
};

const CITY_IMAGES: Record<string, string> = {
  vienna: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1400&q=80",
  lisbon: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1400&q=80",
  kyoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=80",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400&q=80",
  copenhagen: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1400&q=80",
  "buenos aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1400&q=80",
};

export default function CityPlanPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const citySlug = (params.city as string) ?? "";
  const cityName = decodeURIComponent(citySlug);
  const cityKey = cityName.toLowerCase();

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [purchasing, setPurchasing] = useState<"city" | "sub" | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  const itinerary = ITINERARIES[cityKey];
  const heroImage = CITY_IMAGES[cityKey] ?? CITY_IMAGES["vienna"];

  // If redirected back from Stripe with success
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") setHasAccess(true);
  }, [searchParams]);

  const checkAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setChecking(true);

    const res = await fetch(
      `/api/stripe/access?email=${encodeURIComponent(email)}&city=${encodeURIComponent(cityName)}`
    );
    const json = await res.json();
    setHasAccess(json.hasAccess);
    setAccessChecked(true);
    setChecking(false);
  };

  const handlePurchase = async (type: "city" | "sub") => {
    setPurchasing(type);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: type === "city" ? "city_plan" : "subscription",
        city: cityName,
        email,
      }),
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else setPurchasing(null);
  };

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-[#f2f0eb] flex items-center justify-center">
        <p className="text-gray-500">No plan available for this city yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f0eb]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Hero */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <img src={heroImage} alt={cityName} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" />
        <button
          onClick={() => router.push(`/city/${encodeURIComponent(cityName)}`)}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white text-sm bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full"
        >
          <ArrowLeft size={14} /> Back to {cityName}
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-6 sm:pb-8">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Local Plan</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white">{cityName} — 3 Days</h1>
          <p className="text-white/70 text-sm sm:text-base mt-1">{itinerary.tagline}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14">

        {/* ── Paywall ── */}
        {!hasAccess ? (
          <div className="space-y-8">
            {/* Preview teaser */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's inside</h2>
              <p className="text-gray-500 text-sm mb-6">3 full days. Morning, afternoon and evening for each. Written by verified locals — not travel bloggers.</p>

              {/* Blurred preview of Day 1 */}
              <div className="relative rounded-2xl overflow-hidden">
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4 select-none">
                  <div className="flex items-center gap-2">
                    <Coffee size={16} className="text-[#3bbfb3]" />
                    <span className="font-semibold text-gray-900 text-sm">Morning — {itinerary.days[0].morning.place}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{itinerary.days[0].morning.description}</p>
                  <div className="flex items-center gap-2">
                    <Sun size={16} className="text-orange-400" />
                    <span className="font-semibold text-gray-900 text-sm">Afternoon — {itinerary.days[0].afternoon.place}</span>
                  </div>
                  <p className="text-sm text-gray-600 blur-sm select-none">{itinerary.days[0].afternoon.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white flex items-end justify-center pb-6">
                  <div className="flex items-center gap-2 bg-[#0d2b3e] text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Lock size={14} /> Unlock to read full itinerary
                  </div>
                </div>
              </div>

              {/* What you get */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["3 full days of local itineraries", "Morning, afternoon & evening picks", "Insider tips from verified residents"].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-[#3bbfb3] flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Access check */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Already purchased?</h2>
              <p className="text-gray-500 text-sm mb-4">Enter your email to restore access.</p>
              <form onSubmit={checkAccess} className="flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#3bbfb3]"
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="px-5 py-2.5 bg-[#3bbfb3] hover:bg-[#2da89d] text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                >
                  {checking ? "Checking…" : "Check"}
                </button>
              </form>
              {accessChecked && !hasAccess && (
                <p className="text-red-500 text-sm mt-2">No purchase found for that email.</p>
              )}
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City plan */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-[#3bbfb3]" />
                  <h3 className="font-bold text-gray-900">{cityName} Plan</h3>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$4.99</span>
                  <span className="text-gray-400 text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {[`Full 3-day ${cityName} itinerary`, "Local tips for every stop", "Permanent access"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={13} className="text-[#3bbfb3]" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase("city")}
                  disabled={purchasing !== null}
                  className="w-full py-3 bg-[#3bbfb3] hover:bg-[#2da89d] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {purchasing === "city" ? "Redirecting…" : `Get ${cityName} Plan`}
                </button>
              </div>

              {/* All-access subscription */}
              <div className="bg-[#0d2b3e] rounded-3xl p-6 border border-[#0d2b3e] shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-yellow-400 text-[#0d2b3e] text-xs font-bold px-2 py-0.5 rounded-full">
                  BEST VALUE
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={18} className="text-yellow-400" />
                  <h3 className="font-bold text-white">All-Access</h3>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$9.99</span>
                  <span className="text-white/50 text-sm ml-1">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {["All 6 city plans included", "New cities added monthly", "Cancel anytime"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle size={13} className="text-[#3bbfb3]" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase("sub")}
                  disabled={purchasing !== null}
                  className="w-full py-3 bg-[#3bbfb3] hover:bg-[#2da89d] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {purchasing === "sub" ? "Redirecting…" : "Get All-Access"}
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* ── Plan content (unlocked) ── */
          <div>
            <div className="flex items-center gap-2 mb-8 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-2xl">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Access confirmed — enjoy your local plan.</span>
            </div>

            {/* Day tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
              {itinerary.days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${activeDay === i
                      ? "bg-[#0d2b3e] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  Day {i + 1}
                </button>
              ))}
            </div>

            {/* Active day */}
            {(() => {
              const day = itinerary.days[activeDay];
              return (
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Day {activeDay + 1} — {day.title}
                  </h2>

                  {[
                    { time: "Morning", icon: <Coffee size={20} className="text-[#3bbfb3]" />, data: day.morning },
                    { time: "Afternoon", icon: <Sun size={20} className="text-orange-400" />, data: day.afternoon },
                    { time: "Evening", icon: <Moon size={20} className="text-indigo-400" />, data: day.evening },
                  ].map(({ time, icon, data }) => (
                    <div key={time} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          {icon}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{time}</p>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{data.place}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">{data.description}</p>
                      <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-start gap-2">
                        <Sparkles size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-purple-700">
                          <span className="font-semibold">Local tip: </span>{data.tip}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Day navigation */}
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
                      disabled={activeDay === 0}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft size={14} /> Previous day
                    </button>
                    <button
                      onClick={() => setActiveDay(Math.min(itinerary.days.length - 1, activeDay + 1))}
                      disabled={activeDay === itinerary.days.length - 1}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3bbfb3] text-white text-sm disabled:opacity-30 hover:bg-[#2da89d] transition-colors"
                    >
                      Next day <ArrowLeft size={14} className="rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <footer className="mt-16 py-6 px-6 border-t border-gray-200 text-center text-sm text-gray-400 bg-[#eceae4]">
        <button onClick={() => router.push(`/city/${encodeURIComponent(cityName)}/plan`)}>
          Get the local plan — $4.99
        </button>
        © {new Date().getFullYear()} SwiftCity · Discover cities through local eyes
      </footer>
    </div>
  );
}