import type { Metadata } from "next";
import "../styles/index.css";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "The Kharagpur Wala | Blogger & Digital Creator",
  description: "The Kharagpur Wala is one of Kharagpur’s leading digital creators and regional influencers, collaborating with major education institutes, automobile brands, restaurants, cafes, fashion stores, and local businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
