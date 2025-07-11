import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SNitrosylatedTable from "@/components/SNitrosylatedTable";
import MotifTable from "@/components/MotifTable";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Microscope,
  Cpu,
  BarChart3,
  Database,
  ArrowRight,
  CheckCircle2,
  Activity,
  InfoIcon,
} from "lucide-react";

type DatabaseType = "experimental" | "motif";

const UnifiedBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get initial tab from URL params or default to experimental
  const initialTab =
    (searchParams.get("type") as DatabaseType) || "experimental";
  const initialQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<DatabaseType>(initialTab);

  // Update URL when tab changes
  const handleTabChange = (tab: DatabaseType) => {
    setActiveTab(tab);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("type", tab);
    setSearchParams(newSearchParams);
  };

  // Database statistics and information
  const databaseInfo = {
    experimental: {
      title: "Experimentally Verified Proteins",
      subtitle:
        "S-nitrosylation sites validated through laboratory experiments",
      count: "4,533",
      icon: Microscope,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      description:
        "High-confidence protein modifications with experimental validation",
      features: [
        "Laboratory-validated S-nitrosylation sites",
        "High-confidence data from published research",
        "Detailed experimental conditions",
        "Cancer association data",
      ],
    },
    motif: {
      title: "Motif-Based Predictions",
      subtitle:
        "Computationally predicted S-nitrosylation sites using motif analysis",
      count: "14,188",
      icon: Cpu,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      description:
        "Comprehensive proteome-wide predictions using computational analysis",
      features: [
        "Motif pattern-based predictions",
        "Proteome-wide coverage",
        "Computational validation methods",
        "Cross-referenced with experimental data",
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />

      <div className="pt-16">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="text-center mb-8 opacity-0 animate-fade-in">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Browse Protein Databases
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our comprehensive collection of S-nitrosylated proteins
                from both experimental validation and computational prediction
                approaches
              </p>
            </div>

            {/* Database Overview Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {Object.entries(databaseInfo).map(([key, info], index) => {
                const IconComponent = info.icon;
                const isActive = activeTab === key;

                return (
                  <div
                    key={key}
                    className="opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card
                      className={`h-full transition-all duration-300 cursor-pointer hover:shadow-lg ${
                        isActive
                          ? `${info.borderColor} border-2 shadow-md`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleTabChange(key as DatabaseType)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-3 rounded-lg ${info.lightColor}`}
                            >
                              <IconComponent
                                className={`h-6 w-6 ${info.textColor}`}
                              />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                {info.title}
                              </CardTitle>
                              <p className="text-sm text-gray-600 mt-1">
                                {info.subtitle}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {info.count}
                            </div>
                            <div className="text-sm text-gray-500">
                              proteins
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm mb-4">
                          {info.description}
                        </p>

                        <div className="space-y-2">
                          {info.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={`${info.lightColor} ${info.textColor} border-0`}
                          >
                            {key === "experimental"
                              ? "Validated Data"
                              : "Computational Analysis"}
                          </Badge>

                          {isActive && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Activity className="h-4 w-4 mr-1" />
                              Currently viewing
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-gray-200 opacity-0 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">18,721</div>
                  <div className="text-sm text-gray-600">Total Proteins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="text-sm text-gray-600">Database Types</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Human Proteome</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">2024</div>
                  <div className="text-sm text-gray-600">Latest Update</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Database Tables */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Tabs
            value={activeTab}
            onValueChange={(value) => handleTabChange(value as DatabaseType)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <TabsList className="grid w-fit grid-cols-2 bg-gray-100">
                <TabsTrigger
                  value="experimental"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <Microscope className="h-4 w-4 mr-2" />
                  Experimental ({databaseInfo.experimental.count})
                </TabsTrigger>
                <TabsTrigger
                  value="motif"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  Motif-Based ({databaseInfo.motif.count})
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <InfoIcon className="h-4 w-4 mr-1" />
                  Switch between databases using the tabs
                </div>

                {/* Quick action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTabChange(
                        activeTab === "experimental" ? "motif" : "experimental"
                      )
                    }
                    className="text-xs"
                  >
                    Switch to{" "}
                    {activeTab === "experimental"
                      ? "Motif-Based"
                      : "Experimental"}
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="experimental" className="mt-0">
              <div className="transition-all duration-400 ease-in-out">
                <SNitrosylatedTable initialQuery={initialQuery} />
              </div>
            </TabsContent>

            <TabsContent value="motif" className="mt-0">
              <div className="transition-all duration-400 ease-in-out">
                <MotifTable initialQuery={initialQuery} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UnifiedBrowse;
