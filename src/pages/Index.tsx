import React from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import DatabaseOverview from "@/components/DatabaseOverview";
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
      <div className="py-4 bg-gray-50">
        <DatabaseOverview />
      </div>
      <FeaturesSection />
      <MotifSection />
      <Footer />
    </div>
  );
};

export default Index;
