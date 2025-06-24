import React from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SNitrosylatedTable from "@/components/SNitrosylatedTable";
import Footer from "@/components/Footer";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
        <SNitrosylatedTable initialQuery={initialQuery} />
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
