"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Video, Clock, Shield, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type ServiceMode = 'mobile' | 'ron';

interface ServiceToggleProps {
  selectedMode: ServiceMode;
  onModeChange: (mode: ServiceMode) => void;
  disabled?: boolean;
  showComingSoon?: boolean;
}

export default function ServiceToggle({ 
  selectedMode, 
  onModeChange, 
  disabled = false,
  showComingSoon = false 
}: ServiceToggleProps) {
  const [hoveredMode, setHoveredMode] = useState<ServiceMode | null>(null);

  const serviceOptions = {
    mobile: {
      icon: <MapPin className="h-5 w-5" />,
      title: "Mobile Notary",
      subtitle: "We come to you",
      description: "Traditional in-person notarization at your location",
      features: [
        "In-person service at your location",
        "Same-day availability",
        "All document types supported",
        "Personal interaction & guidance"
      ],
      badge: "Most Popular",
      badgeColor: "bg-green-500",
    },
    ron: {
      icon: <Video className="h-5 w-5" />,
      title: "Remote Online Notarization",
      subtitle: "Secure video session",
      description: "Convenient online notarization via secure video call",
      features: [
        "No travel required",
        "Flexible scheduling 24/7",
        "Digital document handling",
        "State-of-the-art security"
      ],
      badge: showComingSoon ? "Coming Soon" : "Available",
      badgeColor: showComingSoon ? "bg-orange-500" : "bg-blue-500",
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your Service Type
        </h2>
        <p className="text-gray-600 text-sm">
          Select how you'd like to complete your notarization
        </p>
      </div>

      {showComingSoon && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Remote Online Notarization</strong> will be available soon! 
            For now, enjoy our reliable mobile notary service.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(serviceOptions).map(([mode, option]) => {
          const isSelected = selectedMode === mode;
          const isDisabled = disabled || (mode === 'ron' && showComingSoon);
          const isHovered = hoveredMode === mode;

          return (
            <Card
              key={mode}
              className={`
                cursor-pointer transition-all duration-200 border-2
                ${isSelected 
                  ? 'border-[#A52A2A] bg-red-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
                ${isHovered && !isDisabled ? 'shadow-lg' : ''}
              `}
              onClick={() => !isDisabled && onModeChange(mode as ServiceMode)}
              onMouseEnter={() => setHoveredMode(mode as ServiceMode)}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isSelected 
                        ? 'bg-[#A52A2A] text-white' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {option.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {option.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    className={`${option.badgeColor} text-white text-xs px-2 py-1`}
                  >
                    {option.badge}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {option.description}
                </p>

                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className={`
                        w-1.5 h-1.5 rounded-full
                        ${isSelected ? 'bg-[#A52A2A]' : 'bg-gray-400'}
                      `} />
                      <span className={isSelected ? 'text-gray-800' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {mode === 'mobile' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Usually available within 2-4 hours</span>
                  </div>
                )}

                {mode === 'ron' && !showComingSoon && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>Bank-level security & compliance</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
          ${selectedMode === 'mobile' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
          }
        `}>
          {serviceOptions[selectedMode].icon}
          <span>
            {serviceOptions[selectedMode].title} selected
          </span>
        </div>
      </div>
    </div>
  );
} 