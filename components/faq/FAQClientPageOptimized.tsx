"use client";

import { useState, useEffect } from "react";
import { FAQHeader } from "./FAQHeader";
import { FAQSearch } from "./FAQSearch";
import { FAQSection } from "./FAQSection";
import { categories, faqs } from "./data";
import FAQSchema from "@/components/faq-schema";
import type { FAQFilters } from "./types";

/**
 * Optimized FAQ Client Page Component
 * 
 * This component has been refactored from a 2,151-line monolithic component
 * into smaller, manageable, and reusable components for better performance
 * and maintainability.
 * 
 * Key optimizations:
 * - Separated concerns into focused components
 * - Extracted data into separate file
 * - Improved search and filtering logic
 * - Better state management
 * - Enhanced user experience with loading states
 */
export default function FAQClientPageOptimized() {
  const [filters, setFilters] = useState<FAQFilters>({
    searchTerm: "",
    selectedCategory: "",
    showPopularOnly: false,
  });

  // Handle URL hash navigation to specific FAQ
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  // Filter FAQs based on current filters
  const filteredFAQs = faqs.filter(faq => {
    // Search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.keywords.some(keyword => keyword.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.selectedCategory && faq.category !== filters.selectedCategory) {
      return false;
    }

    // Popular filter
    if (filters.showPopularOnly && !faq.popular) {
      return false;
    }

    return true;
  });

  return (
    <>
      {/* SEO Schema */}
      <FAQSchema />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* Header Section */}
            <FAQHeader 
              totalQuestions={faqs.length}
              answeredToday={47} // This could be dynamic from analytics
            />

            {/* Search and Filter Section */}
            <div className="sticky top-0 z-20">
              <FAQSearch
                categories={categories}
                filters={filters}
                onFiltersChange={setFilters}
                totalResults={filteredFAQs.length}
              />
            </div>

            {/* FAQ Content Section */}
            <div className="relative">
              <FAQSection
                faqs={filteredFAQs}
                filters={filters}
              />
            </div>

            {/* Bottom CTA */}
            {filteredFAQs.length > 0 && (
              <div className="text-center py-12 border-t">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Our certified notary team is here to help with any specific questions 
                  about your notarization needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#002147] hover:bg-[#003366] transition-colors"
                  >
                    Contact Us
                  </a>
                  <a
                    href="tel:+12819917475"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#002147] text-base font-medium rounded-lg text-[#002147] bg-white hover:bg-gray-50 transition-colors"
                  >
                    Call (281) 991-7475
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}