import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  BookOpen,
  BarChart3,
  ChevronDown,
  X,
  ExternalLink,
  Eye,
  InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCancerTypes } from "@/hooks/useCancerTypes";
import { ErrorBoundary } from "react-error-boundary";

// Define the common properties shared by different protein types
interface BaseProtein {
  id: string;
  hsn_id: string;
  gene_name: string | null;
  uniprot_id: string | null;
  protein_name: string | null;
  protein_length: number | null;
  alphafold_id: string | null;
  cancer_causing: boolean | null;
  cancer_types: string[] | null;
  total_sites?: number | null;
  positions_of_nitrosylation?: string | null;
}

// Props interface for the ProteinTableInterface component
interface ProteinTableInterfaceProps {
  initialQuery?: string;
  title: string;
  description: string;
  useHook: (params: any) => {
    data?: {
      data: any[];
      count: number;
      isMockData?: boolean;
    };
    isLoading: boolean;
    error: Error | null;
  };
  badgeText?: string;
  tooltipText?: string;
}

const ProteinTableInterface = ({
  initialQuery = "",
  title,
  description,
  useHook,
  badgeText,
  tooltipText,
}: ProteinTableInterfaceProps): React.ReactElement => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("hsn_id");
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [filters, setFilters] = useState({
    cancerSites: [] as string[],
    totalSites: [] as string[],
    cancerTypes: [] as string[],
  });

  // Fetch cancer types from database
  const { data: cancerTypesFromDB, isLoading: isLoadingCancerTypes } =
    useCancerTypes();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  // Fetch proteins data using the provided hook
  const {
    data: proteinsResult,
    isLoading,
    error,
  } = useHook({
    searchQuery: debouncedSearchQuery,
    filters: {
      cancerCausing:
        filters.cancerSites.length > 0
          ? filters.cancerSites.includes("Yes")
          : undefined,
      totalSites: filters.totalSites[0] || undefined,
      cancerTypes:
        filters.cancerTypes.length > 0 ? filters.cancerTypes : undefined,
    },
    sortBy,
    page: currentPage,
    itemsPerPage,
  });

  // Add defensive checks for data
  const results = proteinsResult?.data || [];
  const totalResults = proteinsResult?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const isMockData = proteinsResult?.isMockData || false;

  // Add effect to catch and log any rendering errors
  useEffect(() => {
    try {
      console.log("ProteinTableInterface rendering with:", {
        resultsLength: results?.length || 0,
        totalResults,
        isLoading,
        error: error?.message,
      });

      // Clear any previous errors
      setRenderError(null);
    } catch (err) {
      console.error("Error in ProteinTableInterface render cycle:", err);
      setRenderError(err as Error);
    }
  }, [results, totalResults, isLoading, error]);
  // Create filter options with dynamic cancer types
  const filterOptions = {
    cancerSites: ["Yes", "No"],
    totalSites: ["1", "2", "3-5", "6-10", "11+"],
    cancerTypes: cancerTypesFromDB || [],
  };

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      cancerSites: [],
      totalSites: [],
      cancerTypes: [],
    });
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce(
      (sum, filterArray) => sum + filterArray.length,
      0
    );
  };
  const getCancerBadgeVariant = (cancerCausing: boolean) => {
    return cancerCausing ? "destructive" : "secondary";
  };

  const handleSearch = () => {
    setDebouncedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    setSortBy(column);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handleRowClick = (id: string) => {
    navigate(`/protein/${id}`);
  };
  // If there's a render error, show a simplified view
  if (renderError) {
    return (
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We encountered an error while trying to display the proteins.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Error details: {renderError.message}
              </p>
              <div className="bg-gray-50 p-4 rounded mb-4 text-left overflow-auto max-h-48">
                <h4 className="font-mono text-xs mb-2">Debug Information:</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(renderError, null, 2)}
                </pre>
              </div>
              <Button onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {isMockData && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-800">
              <p className="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Using mock data for demonstration purposes
              </p>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">
            {description}{" "}
            {!isLoading && `(${totalResults.toLocaleString()} proteins)`}
          </p>
        </div>
        <div className="space-y-6">
          {/* Search and Filter Card */}
          <Card>
            {" "}
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search proteins, UniProt IDs, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>

              {/* Filter and Control Options */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left side: Filter, Sort by, Show */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getActiveFiltersCount()}
                          </Badge>
                        )}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                      <div className="p-4 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Filters</span>
                          {getActiveFiltersCount() > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Clear All
                            </Button>
                          )}
                        </div>

                        {Object.entries(filterOptions).map(
                          ([category, options]) => (
                            <div key={category}>
                              {" "}
                              <label className="text-sm font-medium text-gray-700 mb-3 block capitalize">
                                {category === "cancerSites"
                                  ? "Cancer Causing"
                                  : category === "totalSites"
                                  ? "Total Sites"
                                  : category === "cancerTypes"
                                  ? "Cancer Types"
                                  : category}
                              </label>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {category === "cancerTypes" &&
                                isLoadingCancerTypes ? (
                                  <div className="flex items-center justify-center py-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-sm text-gray-500">
                                      Loading...
                                    </span>
                                  </div>
                                ) : (
                                  options.map((option) => (
                                    <label
                                      key={option}
                                      className="flex items-center space-x-2 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={filters[
                                          category as keyof typeof filters
                                        ].includes(option)}
                                        onChange={() =>
                                          toggleFilter(
                                            category as keyof typeof filters,
                                            option
                                          )
                                        }
                                      />
                                      <span className="text-sm text-gray-600">
                                        {option}
                                      </span>
                                    </label>
                                  ))
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>{" "}
                  {/* Sort by dropdown */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {" "}
                      <option value="relevance">Relevance</option>
                      <option value="hsn_id">HSN ID</option>
                      <option value="gene_name">Gene Name</option>
                      <option value="total_sites">Total Sites</option>
                      <option value="protein_length">Length</option>
                    </select>
                  </div>
                  {/* Items per page */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Show:</span>
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

                {/* Right side: Analyze button */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>{" "}
          {/* Results Header */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold">
                    {totalResults === 0
                      ? 0
                      : (currentPage - 1) * itemsPerPage + 1}
                    -{Math.min(currentPage * itemsPerPage, totalResults)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {totalResults.toLocaleString()}
                  </span>{" "}
                  results
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-800">
                {badgeText}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <InfoIcon className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="max-w-xs">{tooltipText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {/* Results Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading proteins...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-600">
                    Error loading data. Please try again.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {error.message || "An unknown error occurred"}
                  </p>
                  <div className="bg-gray-50 p-4 rounded text-left overflow-auto max-h-48 mt-4">
                    <h4 className="font-mono text-xs mb-2">
                      Debug Information:
                    </h4>
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(
                        { error, query: debouncedSearchQuery, filters },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => window.location.reload()}
                  >
                    Reload page
                  </Button>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    No proteins found. Try adjusting your search or filters.
                  </p>
                  <div className="flex justify-center gap-2">
                    {" "}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        clearAllFilters();
                        setSortBy("hsn_id");
                      }}
                    >
                      Clear all filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Refresh page
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 w-[80px] border-r border-gray-200">
                          HSN ID
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[100px] border-r border-gray-200">
                          Gene Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[120px] border-r border-gray-200">
                          UniProt ID
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-auto border-r border-gray-200">
                          Protein Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[80px] border-r border-gray-200">
                          Length
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[120px] border-r border-gray-200">
                          AlphaFold ID
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[80px] border-r border-gray-200">
                          Sites
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[140px] border-r border-gray-200">
                          Nitrosylation Position
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[80px] border-r border-gray-200">
                          Cancer
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[140px]">
                          Cancer Types
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow
                          key={result.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(result.id)}
                        >
                          <TableCell className="font-medium text-blue-600 border-r border-gray-200">
                            {result.hsn_id}
                          </TableCell>
                          <TableCell className="font-medium border-r border-gray-200">
                            {result.gene_name}
                          </TableCell>
                          <TableCell className="border-r border-gray-200">
                            <a
                              href={`https://www.uniprot.org/uniprotkb/${result.uniprot_id}/entry`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline font-mono text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {result.uniprot_id}
                            </a>
                          </TableCell>
                          <TableCell className="max-w-[300px] border-r border-gray-200">
                            <div
                              className="truncate"
                              title={result.protein_name || ""}
                            >
                              {result.protein_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center border-r border-gray-200">
                            {result.protein_length}
                          </TableCell>
                          <TableCell className="font-mono text-sm border-r border-gray-200">
                            <a
                              href={`https://alphafold.ebi.ac.uk/search/text/${result.alphafold_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {result.alphafold_id}
                            </a>
                          </TableCell>
                          <TableCell className="text-center font-semibold border-r border-gray-200">
                            {result.total_sites ?? "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm border-r border-gray-200">
                            {result.positions_of_nitrosylation ?? "-"}
                          </TableCell>
                          <TableCell className="border-r border-gray-200">
                            <Badge
                              variant={getCancerBadgeVariant(
                                result.cancer_causing ?? false
                              )}
                            >
                              {result.cancer_causing ? "Y" : "N"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.cancer_types &&
                            result.cancer_types.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {result.cancer_types.map((type, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>{" "}
          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
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
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
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
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProteinTableInterface;
