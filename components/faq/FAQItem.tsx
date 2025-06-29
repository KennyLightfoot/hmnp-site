"use client";

import { useState } from "react";
import { ChevronRight, Star, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FAQ } from "./types";

interface FAQItemProps {
  faq: FAQ;
  isHighlighted?: boolean;
  searchTerm?: string;
}

export function FAQItem({ faq, isHighlighted = false, searchTerm = "" }: FAQItemProps) {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHelpfulClick = (helpful: boolean) => {
    setIsHelpful(helpful);
    // Here you could track analytics
    console.log(`FAQ ${faq.id} marked as ${helpful ? 'helpful' : 'not helpful'}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: faq.question,
        text: `FAQ: ${faq.question}`,
        url: `${window.location.origin}/faq#${faq.id}`
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/faq#${faq.id}`);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div 
      id={faq.id}
      className={`
        transition-all duration-200 rounded-lg border-2 
        ${isHighlighted 
          ? 'border-blue-200 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${isExpanded ? 'shadow-lg' : ''}
      `}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={faq.id} className="border-none">
          <AccordionTrigger 
            className="px-6 py-4 hover:no-underline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-start justify-between w-full text-left">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  {faq.popular && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {faq.category}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                  {searchTerm ? highlightText(faq.question, searchTerm) : faq.question}
                </h3>
              </div>
              
              <ChevronRight 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`} 
              />
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              {/* Answer Content */}
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>

              {/* Related Questions */}
              {faq.relatedQuestions && faq.relatedQuestions.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Related Questions
                  </h4>
                  <div className="space-y-1">
                    {faq.relatedQuestions.map((relatedId, index) => (
                      <a
                        key={index}
                        href={`#${relatedId}`}
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        → {relatedId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  <Button
                    variant={isHelpful === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHelpfulClick(true)}
                    className="h-8 px-3"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Yes
                  </Button>
                  <Button
                    variant={isHelpful === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHelpfulClick(false)}
                    className="h-8 px-3"
                  >
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    No
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 px-3 text-gray-500 hover:text-gray-700"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>

              {/* Feedback Response */}
              {isHelpful !== null && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {isHelpful ? (
                    "Thank you for your feedback! We're glad this was helpful."
                  ) : (
                    <>
                      We're sorry this wasn't helpful. Please{" "}
                      <a href="/contact" className="text-blue-600 hover:underline">
                        contact us
                      </a>{" "}
                      for more specific assistance.
                    </>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}