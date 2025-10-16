import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ReviewsCarousel from "../components/ReviewCorousel";
import Features from "../components/FeaturesSection";
import Contact from "../components/ContactSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06060A] via-[#0b0f1a] to-[#071427] text-white">
      <Navbar />
      <main className="pt-24">
        <Hero />
        <ReviewsCarousel />
        <Features />
        <Contact />
      </main>
    </div>
  );
};

export default HomePage;
