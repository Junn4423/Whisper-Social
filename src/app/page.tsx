'use client';

import { Header, Footer, HeroSection, ConfessionFeed } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark">
      <Header />
      
      {/* Main Content with padding for fixed header */}
      <main className="pt-20 sm:pt-24">
        <HeroSection />
        <ConfessionFeed />
      </main>
      
      <Footer />
    </div>
  );
}
