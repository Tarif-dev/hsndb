
import React from 'react';
import { Search, BarChart3, Download, Users, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: 'Advanced Search & Discovery',
      description: 'Intelligent auto-complete, multi-parameter filtering, and visual query builder for complex searches.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: BarChart3,
      title: 'Interactive Visualizations',
      description: '3D protein structures, network analysis, and dynamic charts with publication-ready exports.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Download,
      title: 'Flexible Data Export',
      description: 'Multiple formats including CSV, JSON, FASTA, and XML with custom field selection.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Collaborative Research',
      description: 'Share searches, create collections, and collaborate with researchers worldwide.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Sub-2 second load times, real-time search, and optimized for mobile devices.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'GDPR compliant, secure authentication, and 99.9% uptime with data versioning.',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Research
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with cutting-edge technology to provide researchers with the most 
            comprehensive and user-friendly protein database experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                Built for the Scientific Community
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">
                    <strong>API-First Design:</strong> Comprehensive RESTful API with detailed documentation for seamless integration
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">
                    <strong>Mobile Optimized:</strong> Full functionality on tablets and smartphones for field research
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">
                    <strong>Citation Ready:</strong> Automatic citation generation for publications and grant applications
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <p className="text-gray-700">
                    <strong>Version Control:</strong> Track database updates and maintain research reproducibility
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Researchers</span>
                  <span className="font-semibold text-gray-900">12,847+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Searches</span>
                  <span className="font-semibold text-gray-900">2.3M+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Publications Cited</span>
                  <span className="font-semibold text-gray-900">5,672+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Countries Represented</span>
                  <span className="font-semibold text-gray-900">94</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
