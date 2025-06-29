"use client";

import { useMemo } from "react";
import { FAQItem } from "./FAQItem";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { FAQ, FAQFilters } from "./types";

interface FAQSectionProps {
  faqs: FAQ[];
  filters: FAQFilters;
}

export function FAQSection({ faqs, filters }: FAQSectionProps) {
  // Filter and search logic
  const filteredFAQs = useMemo(() => {
    let filtered = faqs;

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
        (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.selectedCategory) {
      filtered = filtered.filter(faq => faq.category === filters.selectedCategory);
    }

    // Apply popular filter
    if (filters.showPopularOnly) {
      filtered = filtered.filter(faq => faq.popular === true);
    }

    // Sort by relevance (popular questions first, then alphabetical)
    return filtered.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.question.localeCompare(b.question);
    });
  }, [faqs, filters]);

  // Group FAQs by category for better organization
  const groupedFAQs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};
    
    filteredFAQs.forEach(faq => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push(faq);
    });

    return groups;
  }, [filteredFAQs]);

  // Handle no results
  if (filteredFAQs.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No questions found
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.searchTerm 
              ? `No results found for "${filters.searchTerm}"`
              : "No questions match your current filters"
            }
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Using different keywords</li>
              <li>Removing some filters</li>
              <li>Checking spelling</li>
              <li>Using more general terms</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render grouped FAQs when category filter is applied
  if (filters.selectedCategory) {
    return (
      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <FAQItem 
            key={faq.id} 
            faq={faq} 
            searchTerm={filters.searchTerm}
          />
        ))}
      </div>
    );
  }

  // Render all FAQs grouped by category
  return (
    <div className="space-y-8">
      {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
        <div key={category} className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-xl font-semibold text-gray-900 capitalize">
              {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Questions
            </h2>
            <p className="text-sm text-gray-600">
              {categoryFAQs.length} question{categoryFAQs.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="space-y-3">
            {categoryFAQs.map((faq) => (
              <FAQItem 
                key={faq.id} 
                faq={faq} 
                searchTerm={filters.searchTerm}
                isHighlighted={filters.searchTerm.trim() !== ""}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}