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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-red-600 hover:text-red-700 h-7 text-xs ml-auto"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {Object.entries(filterOptions).map(([category, options]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              {category === "cancerSites"
                ? "Cancer Causing"
                : category === "totalSites"
                ? "Total Sites"
                : category === "cancerTypes"
                ? "Cancer Types"
                : category}
            </label>
            {filters[category as keyof FiltersType].length > 0 && (
              <Badge variant="secondary" className="text-xs h-4 px-1">
                {filters[category as keyof FiltersType].length}
              </Badge>
            )}
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
            {category === "cancerTypes" && isLoadingCancerTypes ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-xs text-gray-500">Loading...</span>
              </div>
            ) : (
              options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-white px-1 py-1 rounded text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filters[category as keyof FiltersType].includes(
                      option
                    )}
                    onChange={() =>
                      onToggleFilter(category as keyof FiltersType, option)
                    }
                  />
                  <span className="text-xs text-gray-700 flex-1">{option}</span>
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
      <div className="hidden lg:block lg:w-56 lg:flex-shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-base flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
