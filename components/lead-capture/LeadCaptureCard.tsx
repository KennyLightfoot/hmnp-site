/**
 * Reusable Card Wrapper for Lead Capture Forms
 * Provides consistent styling and layout
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LeadCaptureCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'accent';
  className?: string;
}

export function LeadCaptureCard({
  title,
  description,
  children,
  variant = 'default',
  className = '',
}: LeadCaptureCardProps) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    accent: 'bg-[#002147]/5 border-[#002147]/20',
  };
  
  return (
    <Card className={`${variantClasses[variant]} ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#002147]">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

