import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://agrohub.local";
  const fecha = new Date();

  return [
    {
      url: baseUrl,
      lastModified: fecha,
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/analitica`,
      lastModified: fecha,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dispositivos`,
      lastModified: fecha,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/alertas`,
      lastModified: fecha,
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/alertas-sistema`,
      lastModified: fecha,
      changeFrequency: "always",
      priority: 0.9,
    },
  ];
}