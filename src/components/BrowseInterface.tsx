
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
    totalSites: ['1', '2', '3-5', '6-10', '11+']
  };

  // Sample data matching the screenshot format
  const sampleResults = [
    {
      hsnId: 'HSN1',
      geneName: 'NUDT4B',
      uniprotId: 'A0A024RBG1',
      proteinName: 'Diphosphoinositol polyphosphate phosphohydrolase NUDT4B',
      proteinLength: 181,
      alphafoldId: 'AF-A0A024RBG1-F1',
      totalSites: 1,
      positionOfNitrosylation: '132',
      cancerCausing: false
    },
    {
      hsnId: 'HSN2',
      geneName: 'PPIAL4E',
      uniprotId: 'A0A075B759',
      proteinName: 'Peptidyl-prolyl cis-trans isomerase A-like 4E',
      proteinLength: 164,
      alphafoldId: 'AF-A0A075B759-F1',
      totalSites: 1,
      positionOfNitrosylation: '62',
      cancerCausing: false
    },
    {
      hsnId: 'HSN3',
      geneName: 'PPIAL4H',
      uniprotId: 'A0A075B767',
      proteinName: 'Peptidyl-prolyl cis-trans isomerase A-like 4H',
      proteinLength: 164,
      alphafoldId: 'AF-A0A075B767-F1',
      totalSites: 1,
      positionOfNitrosylation: '62',
      cancerCausing: false
    },
    {
      hsnId: 'HSN9',
      geneName: 'RBM47',
      uniprotId: 'A0AV96',
      proteinName: 'RNA-binding protein 47',
      proteinLength: 393,
      alphafoldId: 'AF-A0AV96-F1',
      totalSites: 2,
      positionOfNitrosylation: '273, 349',
      cancerCausing: true
    },
    {
      hsnId: 'HSN10',
      geneName: 'UBA6',
      uniprotId: 'A0AVT1',
      proteinName: 'Ubiquitin-like modifier-activating enzyme 6',
      proteinLength: 1052,
      alphafoldId: 'AF-A0AVT1-F1',
      totalSites: 6,
      positionOfNitrosylation: '156, 174, 197, 347, 721, 96',
      cancerCausing: true
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
    setCurrentPage(1);
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

  const getCancerBadgeVariant = (cancerCausing: boolean) => {
    return cancerCausing ? 'destructive' : 'secondary';
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
                      {category === 'cancerSites' ? 'Cancer Causing' : 
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
                        <option value="hsnId">HSN ID</option>
                        <option value="geneName">Gene Name</option>
                        <option value="totalSites">Total Sites</option>
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
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700 min-w-[80px]">HSN ID</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[100px]">Gene Name</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[120px]">UniProt ID</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[200px]">Protein Name</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[100px]">Protein Length</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[150px]">AlphaFold ID</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[100px]">Total Sites</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[180px]">Position of Nitrosylation</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[120px]">Cancer Causing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleResults.map((result) => (
                      <TableRow key={result.hsnId} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-blue-600">
                          {result.hsnId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.geneName}
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`https://www.uniprot.org/uniprotkb/${result.uniprotId}/entry`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-mono text-sm"
                          >
                            {result.uniprotId}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={result.proteinName}>
                            {result.proteinName}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {result.proteinLength}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <a 
                            href={`https://alphafold.ebi.ac.uk/search/text/${result.alphafoldId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {result.alphafoldId}
                          </a>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {result.totalSites}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {result.positionOfNitrosylation}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCancerBadgeVariant(result.cancerCausing)}>
                            {result.cancerCausing ? 'Y' : 'N'}
                          </Badge>
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
