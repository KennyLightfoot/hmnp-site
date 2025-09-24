"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FAQCategory, FAQFilters } from "./types";

interface FAQSearchProps {
  categories: FAQCategory[];
  filters: FAQFilters;
  onFiltersChange: (filters: FAQFilters) => void;
  totalResults: number;
}

export function FAQSearch({ 
  categories, 
  filters, 
  onFiltersChange, 
  totalResults 
}: FAQSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      selectedCategory: filters.selectedCategory === categoryId ? "" : categoryId
    });
  };

  const handlePopularToggle = () => {
    onFiltersChange({
      ...filters,
      showPopularOnly: !filters.showPopularOnly
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      selectedCategory: "",
      showPopularOnly: false
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.selectedCategory || filters.showPopularOnly;

  return (
    <Card className="sticky top-4 z-10 shadow-lg border-2">
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search frequently asked questions..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-3 text-base border-2 focus:border-[#002147]"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {[filters.selectedCategory, filters.showPopularOnly].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {totalResults} questions found
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={filters.selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                      className="flex items-center gap-2"
                    >
                      {category.icon}
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Popular Questions Toggle */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h4>
                <Button
                  variant={filters.showPopularOnly ? "default" : "outline"}
                  size="sm"
                  onClick={handlePopularToggle}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 hover:from-yellow-500 hover:to-orange-600"
                >
                  ⭐ Popular Questions
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.id === filters.selectedCategory)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCategoryChange(filters.selectedCategory)}
                  />
                </Badge>
              )}
              {filters.showPopularOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Popular Questions
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={handlePopularToggle}
                  />
                </Badge>
              )}
              {filters.searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  "{filters.searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleSearchChange("")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}