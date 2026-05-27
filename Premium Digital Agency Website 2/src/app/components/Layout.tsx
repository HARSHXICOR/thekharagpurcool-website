import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { StickyButtons } from "./StickyButtons";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen bg-[#0a0a0f] text-white">
      <Navigation />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
      <StickyButtons />
    </div>
  );
}
