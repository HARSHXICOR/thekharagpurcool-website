import type { Metadata } from "next";
import "../styles/index.css";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "The Kharagpur Wala | Best Instagram Promotion & Creator Marketing in Kharagpur",
  description: "The Kharagpur Wala helps cafes, restaurants, events, and local brands grow through cinematic Instagram reels, campaigns, and digital promotions in Kharagpur and Paschim Medinipur.",
  metadataBase: new URL("https://thekharagpurwala.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Kharagpur Wala | Instagram Promotions & Creator Marketing",
    description: "Hyperlocal creator campaigns and cinematic reels driving real weekend footfall and brand awareness in Paschim Medinipur.",
    url: "https://thekharagpurwala.com",
    siteName: "The Kharagpur Wala",
    images: [
      {
        url: "/logo_large.png",
        width: 1200,
        height: 630,
        alt: "The Kharagpur Wala Creator Agency",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://thekharagpurwala.com/#agency",
        "name": "The Kharagpur Wala",
        "image": "https://thekharagpurwala.com/logo_large.png",
        "url": "https://thekharagpurwala.com",
        "telephone": "+919239063990",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kharagpur",
          "addressRegion": "West Bengal",
          "addressCountry": "IN",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 22.346,
          "longitude": 87.23,
        },
        "sameAs": [
          "https://www.instagram.com/the_kharagpur_wala_/",
          "https://wa.me/919239063990",
        ],
      },
      {
        "@type": "Organization",
        "@id": "https://thekharagpurwala.com/#organization",
        "name": "The Kharagpur Wala Media",
        "url": "https://thekharagpurwala.com",
        "logo": "https://thekharagpurwala.com/logo_large.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+919239063990",
          "contactType": "sales",
          "areaServed": "IN",
          "availableLanguage": ["en", "hi", "bn"],
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
