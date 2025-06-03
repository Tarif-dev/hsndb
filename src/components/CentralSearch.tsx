
import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const CentralSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Mock suggestions - in real app this would come from API
  const suggestions = [
    { type: 'protein', value: 'Hemoglobin subunit alpha', organism: 'Homo sapiens' },
    { type: 'protein', value: 'Cardiac troponin I', organism: 'Homo sapiens' },
    { type: 'organism', value: 'Homo sapiens', count: '15,234 proteins' },
    { type: 'organism', value: 'Mus musculus', count: '8,765 proteins' },
    { type: 'modification', value: 'S-Nitrosylation', count: '25,847 sites' },
    { type: 'tissue', value: 'Cardiac tissue', count: '3,456 proteins' },
  ];

  const popularSearches = [
    'Human proteins',
    'S-Nitrosylation',
    'Cardiac tissue',
    'Mouse models',
    'Recent studies 2024'
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        handleSearch(filteredSuggestions[activeSuggestion].value);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    const iconClass = "h-4 w-4 text-gray-400";
    switch (type) {
      case 'protein': return '🧬';
      case 'organism': return '🔬';
      case 'modification': return '⚛️';
      case 'tissue': return '🫀';
      default: return '🔍';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Search the Global Database
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover nitrosilated proteins, modifications, and research data 
            across thousands of species and studies.
          </p>
        </div>

        {/* Main Search Interface */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <Input
              type="text"
              placeholder="Search proteins, organisms, modifications, or UniProt IDs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setActiveSuggestion(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="pl-14 pr-32 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
            <Button 
              size="lg" 
              onClick={() => handleSearch()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Search
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (searchQuery || !searchQuery) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchQuery && filteredSuggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2">Suggestions</div>
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3 ${
                        index === activeSuggestion ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleSearch(suggestion.value)}
                    >
                      <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{suggestion.value}</div>
                        <div className="text-sm text-gray-500">
                          {suggestion.organism || suggestion.count}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div className="p-2">
                  <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 px-3 py-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Popular Searches</span>
                  </div>
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/browse')}
            className="rounded-full"
          >
            Browse All Proteins
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSearch('Homo sapiens')}
            className="rounded-full"
          >
            Human Proteins
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSearch('S-Nitrosylation')}
            className="rounded-full"
          >
            S-Nitrosylation
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSearch('Cardiac tissue')}
            className="rounded-full"
          >
            Cardiac Proteins
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CentralSearch;
