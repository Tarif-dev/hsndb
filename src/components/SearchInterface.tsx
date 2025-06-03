
import React, { useState } from 'react';
import { Search, Filter, Download, BookOpen, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const quickFilters = [
    'Human', 'Mouse', 'Cardiac', 'Neural', 'S-Nitrosylation', 'Recent (2024)'
  ];

  const sampleResults = [
    {
      id: 'P12345',
      name: 'Hemoglobin subunit alpha',
      organism: 'Homo sapiens',
      modifications: 3,
      tissue: 'Blood',
      confidence: 'High'
    },
    {
      id: 'Q98765',
      name: 'Cardiac troponin I',
      organism: 'Homo sapiens',
      modifications: 2,
      tissue: 'Heart',
      confidence: 'Medium'
    },
    {
      id: 'R54321',
      name: 'Neuronal protein 1',
      organism: 'Mus musculus',
      modifications: 5,
      tissue: 'Brain',
      confidence: 'High'
    }
  ];

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Explore the Database
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search through thousands of nitrosilated proteins with advanced filtering 
            and real-time results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Organism
                  </label>
                  <div className="space-y-2">
                    {['Homo sapiens', 'Mus musculus', 'Rattus norvegicus'].map((organism) => (
                      <label key={organism} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-600">{organism}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tissue Type
                  </label>
                  <div className="space-y-2">
                    {['Heart', 'Brain', 'Liver', 'Kidney'].map((tissue) => (
                      <label key={tissue} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-600">{tissue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Confidence Level
                  </label>
                  <div className="space-y-2">
                    {['High', 'Medium', 'Low'].map((level) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-600">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Search Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search proteins, UniProt IDs, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3"
                    />
                  </div>
                  <Button className="px-6 bg-blue-600 hover:bg-blue-700">
                    Search
                  </Button>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {quickFilters.map((filter) => (
                    <Badge
                      key={filter}
                      variant={activeFilters.includes(filter) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter(filter)}
                    >
                      {filter}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results Header */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold">1-3</span> of <span className="font-semibold">1,247</span> results
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>

            {/* Sample Results */}
            <div className="space-y-4">
              {sampleResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.name}
                          </h3>
                          <Badge variant="outline">{result.id}</Badge>
                          <Badge 
                            variant={result.confidence === 'High' ? 'default' : 'secondary'}
                          >
                            {result.confidence}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{result.organism}</span>
                          <span>•</span>
                          <span>{result.tissue} tissue</span>
                          <span>•</span>
                          <span>{result.modifications} modification sites</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          Nitrosilated protein involved in cellular signaling pathways 
                          with confirmed modification sites at cysteine residues.
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Visualize
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchInterface;
