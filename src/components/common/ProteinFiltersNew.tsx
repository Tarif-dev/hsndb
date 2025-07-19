import React, { useState, useMemo } from "react";
import {
  X,
  Filter,
  ChevronDown,
  ChevronRight,
  Database,
  Dna,
  Search,
  Star,
  Clock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersType {
  cancerSites: string[];
  totalSites: string[];
  cancerTypes: string[];
  // SCOP filters
  scopClasses: string[];
  scopFolds: string[];
  scopSuperfamilies: string[];
  scopFamilies: string[];
  scopProteinTypes: string[];
  // CATH filters
  cathTopologies: string[];
  cathSuperfamilies: string[];
  cathSseRanges: string[];
  cathPercentRanges: string[];
  cathPldtRanges: string[];
  cathLur: string[];
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
  const [openSections, setOpenSections] = useState({
    basic: true,
    scop: false,
    cath: false,
    cathNumerical: false,
  });

  // Search states for each filter category
  const [searchTerms, setSearchTerms] = useState({
    cancerTypes: "",
    scopClasses: "",
    scopFolds: "",
    scopSuperfamilies: "",
    scopFamilies: "",
    scopProteinTypes: "",
    cathTopologies: "",
    cathSuperfamilies: "",
  });

  // Filter presets for common use cases
  const filterPresets = [
    {
      name: "Cancer-related Alpha Proteins",
      icon: Star,
      filters: {
        cancerSites: ["Yes"],
        scopClasses: ["All alpha proteins"],
      },
    },
    {
      name: "High Confidence CATH",
      icon: Star,
      filters: {
        cathPldtRanges: ["Very High (90-100)", "High (70-89)"],
        cathLur: ["Yes"],
      },
    },
  ];

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateSearchTerm = (category: string, term: string) => {
    setSearchTerms((prev) => ({
      ...prev,
      [category]: term,
    }));
  };

  const applyPreset = (preset: any) => {
    // Clear all filters first
    onClearAllFilters();

    // Apply preset filters
    setTimeout(() => {
      Object.entries(preset.filters).forEach(([category, values]) => {
        (values as string[]).forEach((value) => {
          onToggleFilter(category as keyof FiltersType, value);
        });
      });
    }, 100);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce(
      (sum, filterArray) => sum + filterArray.length,
      0
    );
  };

  const getSectionCount = (section: string) => {
    switch (section) {
      case "basic":
        return (
          filters.cancerSites.length +
          filters.totalSites.length +
          filters.cancerTypes.length +
          filters.cathPercentRanges.length
        );
      case "scop":
        return (
          filters.scopClasses.length +
          filters.scopFolds.length +
          filters.scopSuperfamilies.length +
          filters.scopFamilies.length +
          filters.scopProteinTypes.length
        );
      case "cath":
        return filters.cathTopologies.length + filters.cathSuperfamilies.length;
      case "cathNumerical":
        return (
          filters.cathSseRanges.length +
          filters.cathPldtRanges.length +
          filters.cathLur.length
        );
      default:
        return 0;
    }
  };

  const renderFilterSection = (
    category: keyof FiltersType,
    label: string,
    options: string[],
    showSearch: boolean = false,
    maxInitialItems: number = 8
  ) => {
    if (options.length === 0) return null;

    const searchKey = category as keyof typeof searchTerms;
    const searchTerm = searchTerms[searchKey] || "";

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
      if (!searchTerm) return options;
      return options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm]);

    // Show selected items first, then others
    const sortedOptions = useMemo(() => {
      const selected = filteredOptions.filter((option) =>
        filters[category].includes(option)
      );
      const unselected = filteredOptions.filter(
        (option) => !filters[category].includes(option)
      );
      return [...selected, ...unselected];
    }, [filteredOptions, filters, category]);

    const [showAll, setShowAll] = useState(false);
    const displayOptions = showAll
      ? sortedOptions
      : sortedOptions.slice(0, maxInitialItems);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            {label}
          </label>
          {filters[category].length > 0 && (
            <Badge variant="secondary" className="text-xs h-4 px-1">
              {filters[category].length}
            </Badge>
          )}
        </div>

        {/* Search box for large lists */}
        {showSearch && options.length > 10 && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder={`Search ${label.toLowerCase()}...`}
              className="h-7 pl-7 text-xs"
              value={searchTerm}
              onChange={(e) => updateSearchTerm(searchKey, e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
          {category === "cancerTypes" && isLoadingCancerTypes ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-xs text-gray-500">Loading...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="text-xs text-gray-500 py-2 text-center">
              No options found
            </div>
          ) : (
            <>
              {displayOptions.map((option) => {
                const isSelected = filters[category].includes(option);
                return (
                  <label
                    key={option}
                    className={`flex items-center space-x-2 cursor-pointer hover:bg-white px-1 py-1 rounded text-xs transition-colors ${
                      isSelected ? "bg-blue-50 border-l-2 border-blue-500" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={isSelected}
                      onChange={() => onToggleFilter(category, option)}
                    />
                    <span
                      className={`text-xs flex-1 ${
                        isSelected
                          ? "font-medium text-blue-900"
                          : "text-gray-700"
                      }`}
                      title={option}
                    >
                      {option.length > 30
                        ? `${option.substring(0, 30)}...`
                        : option}
                    </span>
                    {isSelected && (
                      <Badge
                        variant="outline"
                        className="h-3 text-xs px-1 ml-auto"
                      >
                        ✓
                      </Badge>
                    )}
                  </label>
                );
              })}

              {/* Show More/Less button for large lists */}
              {sortedOptions.length > maxInitialItems && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-6 mt-2"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll
                    ? `Show Less`
                    : `Show ${sortedOptions.length - maxInitialItems} More`}
                  <ChevronDown
                    className={`h-3 w-3 ml-1 transition-transform ${
                      showAll ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const FilterContent = () => (
    <div className="space-y-3">
      {/* Filter Controls Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-2">
          {/* Filter Presets Dropdown */}
          <Select
            onValueChange={(presetName) => {
              const preset = filterPresets.find((p) => p.name === presetName);
              if (preset) applyPreset(preset);
            }}
          >
            <SelectTrigger className="h-7 w-24 text-xs">
              <Star className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Presets</span>
            </SelectTrigger>
            <SelectContent>
              {filterPresets.map((preset) => (
                <SelectItem
                  key={preset.name}
                  value={preset.name}
                  className="text-xs"
                >
                  <div className="flex items-center space-x-1">
                    <preset.icon className="h-3 w-3" />
                    <span>{preset.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear All Button */}
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-red-600 hover:text-red-700 h-6 text-xs px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Basic Protein Filters */}
      <Collapsible
        open={openSections.basic}
        onOpenChange={() => toggleSection("basic")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium">Basic Properties</span>
              {getSectionCount("basic") > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                  {getSectionCount("basic")}
                </Badge>
              )}
            </div>
            {openSections.basic ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 p-2">
          {renderFilterSection(
            "cancerSites",
            "Cancer Causing",
            filterOptions.cancerSites,
            false
          )}
          {renderFilterSection(
            "totalSites",
            "Total Sites",
            filterOptions.totalSites,
            false
          )}
          {renderFilterSection(
            "cancerTypes",
            "Cancer Types",
            filterOptions.cancerTypes,
            true
          )}
          {renderFilterSection(
            "cathPercentRanges",
            "Disorder %",
            filterOptions.cathPercentRanges,
            false,
            8
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* SCOP Structural Classification */}
      <Collapsible
        open={openSections.scop}
        onOpenChange={() => toggleSection("scop")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center">
              <Dna className="h-4 w-4 mr-2 text-purple-600" />
              <span className="text-sm font-medium">SCOP Classification</span>
              {getSectionCount("scop") > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                  {getSectionCount("scop")}
                </Badge>
              )}
            </div>
            {openSections.scop ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 p-2">
          {renderFilterSection(
            "scopClasses",
            "SCOP Classes",
            filterOptions.scopClasses,
            true,
            6
          )}
          {renderFilterSection(
            "scopFolds",
            "SCOP Folds",
            filterOptions.scopFolds,
            true,
            6
          )}
          {renderFilterSection(
            "scopSuperfamilies",
            "SCOP Superfamilies",
            filterOptions.scopSuperfamilies,
            true,
            6
          )}
          {renderFilterSection(
            "scopFamilies",
            "SCOP Families",
            filterOptions.scopFamilies,
            true,
            6
          )}
          {renderFilterSection(
            "scopProteinTypes",
            "Protein Types",
            filterOptions.scopProteinTypes,
            true,
            6
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* CATH Structural Classification */}
      <Collapsible
        open={openSections.cath}
        onOpenChange={() => toggleSection("cath")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-sm font-medium">CATH Classification</span>
              {getSectionCount("cath") > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                  {getSectionCount("cath")}
                </Badge>
              )}
            </div>
            {openSections.cath ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 p-2">
          {renderFilterSection(
            "cathTopologies",
            "CATH Topologies",
            filterOptions.cathTopologies,
            true,
            6
          )}
          {renderFilterSection(
            "cathSuperfamilies",
            "CATH Superfamilies",
            filterOptions.cathSuperfamilies,
            true,
            6
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* CATH Numerical Properties */}
      <Collapsible
        open={openSections.cathNumerical}
        onOpenChange={() => toggleSection("cathNumerical")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm font-medium">CATH Properties</span>
              {getSectionCount("cathNumerical") > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                  {getSectionCount("cathNumerical")}
                </Badge>
              )}
            </div>
            {openSections.cathNumerical ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 p-2">
          {renderFilterSection(
            "cathSseRanges",
            "SSE Ranges",
            filterOptions.cathSseRanges,
            false,
            8
          )}
          {renderFilterSection(
            "cathPldtRanges",
            "pLDDT Confidence",
            filterOptions.cathPldtRanges,
            false,
            8
          )}
          {renderFilterSection(
            "cathLur",
            "Low Uncertainty Region",
            filterOptions.cathLur,
            false
          )}
        </CollapsibleContent>
      </Collapsible>
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
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Proteins
              </SheetTitle>
              <SheetDescription>
                Apply filters to narrow down your protein search results using
                basic properties, SCOP structural classification, and CATH
                classification data.
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
