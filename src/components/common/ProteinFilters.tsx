import React from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FiltersType {
  cancerSites: string[];
  totalSites: string[];
  cancerTypes: string[];
}

interface ProteinFiltersProps {
  filters: FiltersType;
  filterOptions: FiltersType;
  isLoadingCancerTypes: boolean;
  onToggleFilter: (category: keyof FiltersType, value: string) => void;
  onClearAllFilters: () => void;
}

const ProteinFilters: React.FC<ProteinFiltersProps> = ({
  filters,
  filterOptions,
  isLoadingCancerTypes,
  onToggleFilter,
  onClearAllFilters,
}) => {
  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce(
      (sum, filterArray) => sum + filterArray.length,
      0
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-lg">Filters</span>
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {Object.entries(filterOptions).map(([category, options]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 capitalize">
              {category === "cancerSites"
                ? "Cancer Causing"
                : category === "totalSites"
                ? "Total Sites"
                : category === "cancerTypes"
                ? "Cancer Types"
                : category}
            </label>
            {filters[category as keyof FiltersType].length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters[category as keyof FiltersType].length}
              </Badge>
            )}
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
            {category === "cancerTypes" && isLoadingCancerTypes ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filters[category as keyof FiltersType].includes(
                      option
                    )}
                    onChange={() =>
                      onToggleFilter(category as keyof FiltersType, option)
                    }
                  />
                  <span className="text-sm text-gray-700 flex-1">{option}</span>
                </label>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Proteins
              </SheetTitle>
              <SheetDescription>
                Apply filters to narrow down your protein search results.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default ProteinFilters;
