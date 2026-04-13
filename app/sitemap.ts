import { MetadataRoute } from "next";

const BASE_URL = "https://www.swiftcity.xyz";

const CITIES = [
  "Vienna",
  "Lisbon",
  "Kyoto",
  "Barcelona",
  "Copenhagen",
  "Buenos Aires",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const cityPages = CITIES.map((city) => ({
    url: `${BASE_URL}/city/${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const planPages = CITIES.map((city) => ({
    url: `${BASE_URL}/city/${encodeURIComponent(city)}/plan`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/reviewer/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/reviewer/signup`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...cityPages,
    ...planPages,
  ];
}
