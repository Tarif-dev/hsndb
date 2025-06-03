
import React from 'react';
import { Search, ArrowDown, Database, BarChart3, Globe, Dna, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="block">Global Nitrosilated</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Proteins Database
            </span>
          </h1>

          {/* Detailed Explanation */}
          <div className="max-w-5xl mx-auto mb-12">
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Discover, analyze, and visualize nitrosilated proteins with the most comprehensive 
              database platform designed for modern scientific research.
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Understanding Human Nitrosilated Proteins</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <Dna className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">What is Protein Nitrosylation?</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Protein nitrosylation is a crucial post-translational modification where nitric oxide (NO) 
                    covalently binds to cysteine residues, forming S-nitrosothiol groups. This reversible 
                    modification regulates protein function, localization, and stability.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">Biological Significance</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    In humans, nitrosilated proteins play vital roles in cardiovascular health, 
                    immune responses, and neurological functions. Dysregulation is linked to diseases 
                    like heart failure, stroke, and neurodegenerative disorders.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <Brain className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">Research Applications</h3>
                  </div>
                  <p className="text-gray-700">
                    Understanding nitrosilation patterns helps researchers identify therapeutic targets, 
                    develop biomarkers for disease diagnosis, and design interventions for conditions 
                    involving nitric oxide signaling pathways.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <Database className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">Our Database</h3>
                  </div>
                  <p className="text-gray-700">
                    Our comprehensive platform aggregates nitrosilation data from thousands of studies, 
                    providing researchers with unprecedented access to modification sites, tissue 
                    distributions, and functional annotations across species.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">25,847</div>
              <div className="text-gray-600">Nitrosilated Proteins</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">1,247</div>
              <div className="text-gray-600">Species Covered</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">156,394</div>
              <div className="text-gray-600">Modification Sites</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
            >
              Explore Database
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 rounded-xl"
            >
              View Documentation
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16 flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
