import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// ── Same fallback data as city page so search always returns results ──────────
const FALLBACK_DATA = [
  // Vienna
  { id: "f-v1", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "restaurant", name: "Café Central", description: "One of Vienna's most iconic coffeehouses, housed in a stunning neo-Gothic palace. Locals come for the Melange coffee and apple strudel in a grand setting that feels like stepping back into the 1900s.", address: "Herrengasse 14, 1010 Wien", tips: "Go on a weekday morning to avoid tourist queues — weekends get packed by 10am." },
  { id: "f-v2", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "restaurant", name: "Naschmarkt", description: "Vienna's most beloved open-air market stretching over 1.5km. Locals shop here every Saturday morning for fresh produce, cheeses, meats, and street food from around the world.", address: "Naschmarkt, 1060 Wien", tips: "Arrive before 9am on Saturdays for the flea market section and the freshest produce." },
  { id: "f-v3", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "restaurant", name: "Figlmüller Bäckerstraße", description: "Home to Vienna's most famous Wiener Schnitzel, served since 1905. The schnitzels are larger than the plate — a true Viennese institution beloved by locals and visitors alike.", address: "Bäckerstraße 6, 1010 Wien", tips: "Book in advance or go right when they open at noon to get a table without waiting." },
  { id: "f-v4", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "activity", name: "Prater & Riesenrad", description: "Vienna's beloved public park where locals go to cycle, jog, and relax. The iconic giant Ferris wheel (Riesenrad) has been running since 1897 and offers panoramic views of the city.", address: "Prater, 1020 Wien", tips: "Rent a bike and cycle the Hauptallee — a 4.5km tree-lined boulevard that's gorgeous in autumn." },
  { id: "f-v5", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "activity", name: "Kunsthistorisches Museum", description: "One of the world's great art museums housed in a magnificent imperial building. Includes the largest Bruegel collection anywhere — yet it never feels as crowded as the Louvre.", address: "Maria-Theresien-Platz, 1010 Wien", tips: "Free entry on the first Sunday of each month. The museum café inside the rotunda is stunning." },
  { id: "f-v6", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "activity", name: "Belvedere Gardens", description: "The baroque gardens connecting the Upper and Lower Belvedere palaces are free to enter and perfect for a stroll. The Upper Belvedere houses Klimt's famous 'The Kiss'.", address: "Prinz-Eugen-Straße 27, 1030 Wien", tips: "Gardens are free. Visit the Upper Belvedere early morning for the Klimt rooms before tour groups arrive." },
  { id: "f-v7", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "hidden_gem", name: "Heuriger wine taverns in Grinzing", description: "Traditional Viennese wine taverns in the hills north of the city where local winegrowers serve their own wine straight from the barrel. A completely authentic experience tourists almost never find.", address: "Grinzing, 1190 Wien", tips: "Look for a pine branch above the door — it means they're open and wine is fresh." },
  { id: "f-v8", created_at: "", reviewer_id: "", approved: true, city: "Vienna", country: "Austria", category: "hidden_gem", name: "Augarten Porcelain Factory", description: "The world's second-oldest porcelain manufacturer (founded 1718) is hidden inside Vienna's largest baroque park. Free tours on weekdays — a genuinely unique Vienna secret.", address: "Obere Augartenstraße 1, 1020 Wien", tips: "Book the 11am tour on Tuesdays or Thursdays. The factory shop sells seconds at a fraction of normal prices." },
  // Lisbon
  { id: "f-l1", created_at: "", reviewer_id: "", approved: true, city: "Lisbon", country: "Portugal", category: "restaurant", name: "Time Out Market", description: "The world's first curated food market featuring the best chefs Lisbon has to offer under one roof. Locals actually eat here because the quality is genuinely exceptional.", address: "Av. 24 de Julho 49, 1200-479 Lisboa", tips: "Go for lunch on a weekday — evenings and weekends it's packed." },
  { id: "f-l2", created_at: "", reviewer_id: "", approved: true, city: "Lisbon", country: "Portugal", category: "restaurant", name: "A Cevicheria", description: "Chef Kiko's modern Portuguese restaurant is a local favourite. The octopus ceviche and signature Polvo à Lagareiro are dishes locals make reservations weeks in advance for.", address: "R. Dom Pedro V 129, 1250-097 Lisboa", tips: "Book 3 weeks ahead minimum. The wine bar next door serves the same snacks if you can't get a table." },
  { id: "f-l3", created_at: "", reviewer_id: "", approved: true, city: "Lisbon", country: "Portugal", category: "activity", name: "Miradouro da Graça", description: "The best viewpoint in Lisbon that locals actually use. Less famous than São Pedro de Alcântara but with a better view of the castle, river, and the 25 de Abril Bridge.", address: "Largo da Graça, 1170-165 Lisboa", tips: "Bring your own wine and arrive 30 minutes before sunset. On Tuesdays there's a small antique market nearby." },
  { id: "f-l4", created_at: "", reviewer_id: "", approved: true, city: "Lisbon", country: "Portugal", category: "activity", name: "LX Factory", description: "A converted 19th-century industrial complex turned creative village with independent shops, restaurants, and studios. The Sunday market is the best in Lisbon.", address: "R. Rodrigues de Faria 103, 1300-501 Lisboa", tips: "Sunday market runs 10am–6pm. The rooftop bookshop Ler Devagar is open daily." },
  { id: "f-l5", created_at: "", reviewer_id: "", approved: true, city: "Lisbon", country: "Portugal", category: "hidden_gem", name: "Museu do Azulejo", description: "The National Tile Museum is one of Lisbon's genuine treasures — a 16th-century convent filled with 35,000 tiles telling Portugal's entire history. Virtually no queues despite being world-class.", address: "R. da Madre de Deus 4, 1900-312 Lisboa", tips: "Spend at least 2 hours. The 36-metre blue-and-white panorama of pre-earthquake Lisbon is extraordinary." },
  // Kyoto
  { id: "f-k1", created_at: "", reviewer_id: "", approved: true, city: "Kyoto", country: "Japan", category: "restaurant", name: "Nishiki Market", description: "Known as Kyoto's Kitchen, this narrow 400-year-old covered market is where local chefs shop. Five blocks of fishmongers, pickle sellers, tofu makers, and street snack vendors.", address: "Nishiki Market, Nakagyo-ku, Kyoto", tips: "Go on a weekday morning before 10am. Try the fresh yuba and the grilled skewers at the east end." },
  { id: "f-k2", created_at: "", reviewer_id: "", approved: true, city: "Kyoto", country: "Japan", category: "activity", name: "Arashiyama Bamboo Grove at Dawn", description: "The iconic bamboo grove is genuinely magical — but only before 7am when tour groups haven't arrived. Locals walk their dogs here at dawn. At that hour it feels like another world.", address: "Sagaogurayama Tabuchiyamacho, Ukyo-ku, Kyoto", tips: "Be there by 6am. Combine with Okochi-Sanso villa garden which is almost always empty." },
  { id: "f-k3", created_at: "", reviewer_id: "", approved: true, city: "Kyoto", country: "Japan", category: "activity", name: "Philosopher's Path", description: "A 2km stone path along a cherry tree-lined canal connecting Ginkaku-ji and Nanzen-ji temples. Locals walk or cycle it year-round — cherry blossom season transforms it into something extraordinary.", address: "Tetsugaku no Michi, Sakyo-ku, Kyoto", tips: "Walk south to north. Stop at Omen noodle restaurant halfway." },
  { id: "f-k4", created_at: "", reviewer_id: "", approved: true, city: "Kyoto", country: "Japan", category: "hidden_gem", name: "Daitoku-ji Temple Complex", description: "A vast Zen temple complex of 24 sub-temples containing some of Kyoto's finest gardens, visited by almost nobody compared to Kinkaku-ji.", address: "53 Daitokujicho, Kita-ku, Kyoto", tips: "Visit Daisen-in sub-temple for its extraordinary dry garden. Both cost ¥400 and rarely have more than 10 visitors." },
  // Barcelona
  { id: "f-b1", created_at: "", reviewer_id: "", approved: true, city: "Barcelona", country: "Spain", category: "restaurant", name: "Bar Cañete", description: "A legendary Barcelona tapas bar near the Ramblas that locals actually love. The counter seating is the best spot — watch the chefs prepare anchoas, croquetas, and the city's finest pa amb tomàquet.", address: "C/ de la Unió 17, 08001 Barcelona", tips: "No reservations for the bar counter — arrive at opening (1pm lunch, 8pm dinner)." },
  { id: "f-b2", created_at: "", reviewer_id: "", approved: true, city: "Barcelona", country: "Spain", category: "activity", name: "Bunkers del Carmel", description: "The ruins of an anti-aircraft battery from the Spanish Civil War sit atop a hill offering the best 360° panoramic view of Barcelona that virtually no tourist ever finds.", address: "Turó de la Rovira, 08032 Barcelona", tips: "Bring drinks from a supermarket. Sunset here with locals watching the city light up is one of Barcelona's truly special experiences." },
  { id: "f-b3", created_at: "", reviewer_id: "", approved: true, city: "Barcelona", country: "Spain", category: "hidden_gem", name: "Gràcia neighbourhood on a Sunday", description: "The village-within-a-city feel of Gràcia is most apparent on Sunday mornings when locals fill its many plazas. Zero tourist presence.", address: "Gràcia, 08012 Barcelona", tips: "Have breakfast at Federal Café, then browse the Sunday antique market on C/ de la Riera de Sant Miquel." },
  // Copenhagen
  { id: "f-c1", created_at: "", reviewer_id: "", approved: true, city: "Copenhagen", country: "Denmark", category: "restaurant", name: "Torvehallerne Market", description: "Copenhagen's stunning covered market where locals shop and eat. Two glass halls filled with fresh produce, specialist food stalls, and the best smørrebrød in the city.", address: "Frederiksborggade 21, 1360 København", tips: "The coffee at The Coffee Collective here is the best in Denmark. For smørrebrød, go to Hallernes Smørrebrød — arrive before noon." },
  { id: "f-c2", created_at: "", reviewer_id: "", approved: true, city: "Copenhagen", country: "Denmark", category: "activity", name: "Cycling the city", description: "Copenhagen has more bikes than people. Renting a bike and following the locals across the harbour bridge, through Nørrebro, and along the canals is the definitive Copenhagen experience.", address: "City-wide — rent from Baisikeli, Nørrebrogade", tips: "Cycle to the Frederiksberg Gardens for a picnic, then loop through the Lakes at sunset." },
  { id: "f-c3", created_at: "", reviewer_id: "", approved: true, city: "Copenhagen", country: "Denmark", category: "hidden_gem", name: "Assistens Cemetery", description: "This beautiful tree-lined cemetery in Nørrebro is where locals jog, sunbathe, and have picnics. Hans Christian Andersen and Søren Kierkegaard are buried here.", address: "Kapelvej 2, 2200 København N", tips: "Free entry always. On summer Sundays the flea market along its outer walls is the best in the city." },
  // Buenos Aires
  { id: "f-ba1", created_at: "", reviewer_id: "", approved: true, city: "Buenos Aires", country: "Argentina", category: "restaurant", name: "Don Julio Parrilla", description: "Consistently voted South America's best restaurant. The USDA Prime dry-aged beef, the empanadas, and the 700-label wine cellar are without peer.", address: "Guatemala 4699, Palermo, Buenos Aires", tips: "Book 30 days ahead online. If you can't get a table, arrive at 7pm and wait at the bar." },
  { id: "f-ba2", created_at: "", reviewer_id: "", approved: true, city: "Buenos Aires", country: "Argentina", category: "activity", name: "Milonga at Club Gricel", description: "Buenos Aires has hundreds of milongas but Club Gricel is where serious local dancers go. The dancing is extraordinary to watch even if you don't participate.", address: "La Rioja 1180, San Cristóbal, Buenos Aires", tips: "Arrive by 1am. Dress smartly. The cabeceo (head nod) is the proper way to ask someone to dance." },
  { id: "f-ba3", created_at: "", reviewer_id: "", approved: true, city: "Buenos Aires", country: "Argentina", category: "hidden_gem", name: "El Ateneo Grand Splendid", description: "A 1919 theatre converted into what National Geographic called the world's most beautiful bookshop. The stage is now a café, the theatre boxes are reading nooks.", address: "Av. Santa Fe 1860, Recoleta, Buenos Aires", tips: "Go on a weekday morning before 11am. Order a coffee on the stage and read for an hour." },
];

function searchFallback(q: string) {
  const lower = q.toLowerCase();
  return FALLBACK_DATA.filter(
    (r) =>
      r.city.toLowerCase().includes(lower) ||
      r.name.toLowerCase().includes(lower) ||
      r.category.toLowerCase().includes(lower) ||
      r.description.toLowerCase().includes(lower) ||
      r.tips.toLowerCase().includes(lower)
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  if (!q) return NextResponse.json({ results: [] });

  // Search database
  let dbResults: any[] = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("recommendations")
      .select("*")
      .eq("approved", true)
      .or(`city.ilike.%${q}%,name.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%,tips.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20);
    dbResults = data ?? [];
  } catch {
    dbResults = [];
  }

  // Always merge with fallback so search never returns empty for our cities
  const fallbackResults = searchFallback(q);

  // Deduplicate: DB results take priority, fallback fills the rest
  const dbNames = new Set(dbResults.map((r) => r.name.toLowerCase()));
  const uniqueFallback = fallbackResults.filter(
    (r) => !dbNames.has(r.name.toLowerCase())
  );

  const results = [...dbResults, ...uniqueFallback];

  return NextResponse.json({ results });
}
