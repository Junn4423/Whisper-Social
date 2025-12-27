'use client';

import { Header, Footer, ConfessionForm } from "@/components";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-dark">
      <Header />
      
      {/* Main Content */}
      <main className="pt-28 sm:pt-32 pb-16 px-4">
        <ConfessionForm />
      </main>
      
      <Footer />
    </div>
  );
}
