
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, BookOpen, BarChart3, ChevronDown, X, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface BrowseInterfaceProps {
  initialQuery?: string;
}

const BrowseInterface = ({ initialQuery = '' }: BrowseInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    tissues: [] as string[],
    confidence: [] as string[],
    cancerSites: [] as string[],
    totalSites: [] as string[]
  });

  const filterOptions = {
    tissues: ['Heart', 'Brain', 'Liver', 'Kidney', 'Lung', 'Muscle', 'Blood', 'Prostate', 'Breast'],
    confidence: ['High', 'Medium', 'Low'],
    cancerSites: ['Yes', 'No'],
    totalSites: ['1-5', '6-10', '11-20', '21+']
  };

  // Mock data - in real app this would come from API
  const sampleResults = [
    {
      id: 'P12345',
      name: 'Hemoglobin subunit alpha',
      modifications: 3,
      tissue: 'Blood',
      confidence: 'High',
      uniprotId: 'P69905',
      molecularWeight: '15.1 kDa',
      modificationSites: 'Cys104, Cys111, Cys93',
      pmid: '28123456',
      cancerAssociated: 'No'
    },
    {
      id: 'Q98765',
      name: 'Cardiac troponin I',
      modifications: 2,
      tissue: 'Heart',
      confidence: 'Medium',
      uniprotId: 'P19429',
      molecularWeight: '24.0 kDa',
      modificationSites: 'Cys81, Cys145',
      pmid: '29234567',
      cancerAssociated: 'Yes'
    },
    {
      id: 'R54321',
      name: 'BRCA1 DNA repair protein',
      modifications: 5,
      tissue: 'Breast',
      confidence: 'High',
      uniprotId: 'P38398',
      molecularWeight: '207.7 kDa',
      modificationSites: 'Cys23, Cys89, Cys156, Cys201, Cys234',
      pmid: '30345678',
      cancerAssociated: 'Yes'
    }
  ];

  const totalResults = 8247;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setFilters({
      tissues: [],
      confidence: [],
      cancerSites: [],
      totalSites: []
    });
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((sum, filterArray) => sum + filterArray.length, 0);
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };

  const getCancerBadgeVariant = (cancerAssociated: string) => {
    return cancerAssociated === 'Yes' ? 'destructive' : 'secondary';
  };

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Human S-nitrosylation Database</h1>
          <p className="text-gray-600">
            Explore and filter through {totalResults.toLocaleString()} human S-nitrosylated proteins
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
                    )}
                  </CardTitle>
                  {getActiveFiltersCount() > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(filterOptions).map(([category, options]) => (
                  <div key={category}>
                    <label className="text-sm font-medium text-gray-700 mb-3 block capitalize">
                      {category === 'cancerSites' ? 'Cancer Associated' : 
                       category === 'totalSites' ? 'Total Sites' : category}
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {options.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={filters[category as keyof typeof filters].includes(option)}
                            onChange={() => toggleFilter(category as keyof typeof filters, option)}
                          />
                          <span className="text-sm text-gray-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search proteins, UniProt IDs, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Search
                  </Button>
                </div>

                {/* Sort and Display Options */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Sort by:</label>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="name">Name</option>
                        <option value="tissue">Tissue</option>
                        <option value="modifications">Sites Count</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Show:</label>
                      <select 
                        value={itemsPerPage} 
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
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
              </CardContent>
            </Card>

            {/* Results Header */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalResults)}</span> of <span className="font-semibold">{totalResults.toLocaleString()}</span> results
              </p>
            </div>

            {/* Results Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Protein Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">UniProt ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Tissue</TableHead>
                      <TableHead className="font-semibold text-gray-700">MW</TableHead>
                      <TableHead className="font-semibold text-gray-700">Sites</TableHead>
                      <TableHead className="font-semibold text-gray-700">Cancer</TableHead>
                      <TableHead className="font-semibold text-gray-700">Confidence</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleResults.map((result) => (
                      <TableRow key={result.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{result.name}</div>
                            <div className="text-sm text-gray-500">ID: {result.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {result.uniprotId}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">{result.tissue}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700 font-mono text-sm">{result.molecularWeight}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-blue-600">{result.modifications}</div>
                            <div className="text-xs text-gray-500 max-w-32 truncate" title={result.modificationSites}>
                              {result.modificationSites}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCancerBadgeVariant(result.cancerAssociated)}>
                            {result.cancerAssociated}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getConfidenceBadgeVariant(result.confidence)}>
                            {result.confidence}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Visualize">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="View Publication">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrowseInterface;
