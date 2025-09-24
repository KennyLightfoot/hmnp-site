'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Phase5TechnicalSEO on the client only
const Phase5Lazy = dynamic(() => import('@/components/phase5-technical-seo'), { ssr: false });

export default function Phase5TechnicalSEOLoader() {
  return <Phase5Lazy />;
} 