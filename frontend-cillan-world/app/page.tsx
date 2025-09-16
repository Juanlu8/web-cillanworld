import FullScreenScroll from "@/components/FullScreenScroll";
import HighlightsCarousel from "@/components/HighlightsCarousel";
import Footer from "@/components/Footer";
import * as React from "react"

//AAA

export default function Home() {
  return (
    <main>
      <img
        src="/images/white-logo-cillan.png"
        alt="Marca de agua"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 w-164 sm:w-184 md:w-224 lg:w-244 pointer-events-none select-none z-11"
      />
      <FullScreenScroll />
      <HighlightsCarousel />
      <Footer />
    </main>
  );
}
