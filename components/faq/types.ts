import type React from "react";

// FAQ data structure
export interface FAQ {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: string;
  keywords: string[];
  relatedQuestions?: string[];
  popular?: boolean;
}

// FAQ Category structure
export interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Search and filter state
export interface FAQFilters {
  searchTerm: string;
  selectedCategory: string;
  showPopularOnly: boolean;
}