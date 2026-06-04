import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://thekharagpurwala.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/services", "/portfolio", "/pricing", "/blog", "/contact"],
      disallow: ["/dashboard", "/admin", "/api", "/login", "/signup"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
