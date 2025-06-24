import React from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CentralSearch from "@/components/CentralSearch";
import MotifSection from "@/components/MotifSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {" "}
      <Navigation />
      <HeroSection />
      <CentralSearch />
      <FeaturesSection />
      <MotifSection />
      <Footer />
    </div>
  );
};

export default Index;
