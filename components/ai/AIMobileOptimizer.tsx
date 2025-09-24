'use client';

/**
 * 🤖 AI Mobile Optimizer - Phase 4 Enhancement
 * Houston Mobile Notary Pros
 * 
 * Features:
 * - Mobile-specific AI chat optimizations
 * - Touch-friendly interactions
 * - Voice input optimization
 * - Mobile conversion triggers
 * - Gesture-based controls
 * - Mobile-first proactive engagement
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Phone, 
  Mic, 
  MicOff, 
  X, 
  ChevronUp,
  Smartphone,
  Zap,
  Star,
  ArrowUp
} from 'lucide-react';

interface AIMobileOptimizerProps {
  isMobile: boolean;
  onMobileEngagement: (action: string, data?: any) => void;
  chatContext: {
    isOpen: boolean;
    hasInteracted: boolean;
    currentPage: string;
    timeOnPage: number;
  };
  className?: string;
}

// Mobile-specific engagement triggers
const MOBILE_TRIGGERS = {
  SCROLL_HESITATION: {
    threshold: 3000, // 3 seconds without scrolling
    message: "👋 Need help finding what you're looking for?",
    action: "scroll_help"
  },
  FORM_FOCUS: {
    delay: 2000, // 2 seconds after form focus
    message: "🤖 I can help you fill this out quickly!",
    action: "form_assistance"
  },
  EXIT_INTENT: {
    threshold: 5, // pixels from edge
    message: "⚡ Wait! Let me help you complete your booking in 2 minutes!",
    action: "exit_prevention"
  },
  PHONE_SHAKE: {
    threshold: 15, // acceleration threshold
    message: "📱 Shake detected! Need quick help?",
    action: "shake_assistance"
  },
  TOUCH_HOLD: {
    duration: 1500, // 1.5 seconds
    message: "💡 Pro tip: I can explain anything you're unsure about!",
    action: "touch_guidance"
  }
};

// Mobile-optimized quick actions
const MOBILE_QUICK_ACTIONS = [
  {
    id: 'call_now',
    label: 'Call Now',
    icon: Phone,
    action: 'tel:+1234567890', // Replace with actual number
    priority: 'high',
    conversion: true
  },
  {
    id: 'quick_quote',
    label: 'Quick Quote',
    icon: Zap,
    action: 'quick_quote',
    priority: 'high',
    conversion: true
  },
  {
    id: 'voice_booking',
    label: 'Voice Booking',
    icon: Mic,
    action: 'voice_booking',
    priority: 'medium',
    conversion: true
  },
  {
    id: 'text_us',
    label: 'Text Us',
    icon: MessageCircle,
    action: 'sms:+1234567890', // Replace with actual number
    priority: 'medium',
    conversion: false
  }
];

export default function AIMobileOptimizer({
  isMobile,
  onMobileEngagement,
  chatContext,
  className = ''
}: AIMobileOptimizerProps) {
  
  // Mobile-specific state
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [shakeDetected, setShakeDetected] = useState(false);
  const [deviceMotion, setDeviceMotion] = useState({ x: 0, y: 0, z: 0 });
  
  // Refs for mobile interactions
  const touchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Only render on mobile devices
  if (!isMobile) return null;

  // Voice recognition setup
  const startVoiceInput = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        onMobileEngagement('voice_started');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onMobileEngagement('voice_input', { message: transcript });
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        onMobileEngagement('voice_error');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  }, [onMobileEngagement]);

  // Scroll hesitation detection
  useEffect(() => {
    const handleScroll = () => {
      setLastScrollTime(Date.now());
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set new timeout for scroll hesitation
      scrollTimeoutRef.current = setTimeout(() => {
        if (!chatContext.hasInteracted && !chatContext.isOpen) {
          onMobileEngagement('scroll_hesitation', MOBILE_TRIGGERS.SCROLL_HESITATION);
        }
      }, MOBILE_TRIGGERS.SCROLL_HESITATION.threshold);
    };

    if (isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('touchmove', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isMobile, chatContext, onMobileEngagement]);

  // Touch and hold detection
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartTime(Date.now());
      
      touchTimeoutRef.current = setTimeout(() => {
        if (!chatContext.hasInteracted) {
          onMobileEngagement('touch_hold', MOBILE_TRIGGERS.TOUCH_HOLD);
        }
      }, MOBILE_TRIGGERS.TOUCH_HOLD.duration);
    };

    const handleTouchEnd = () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };

    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [isMobile, chatContext, onMobileEngagement]);

  // Device motion detection (shake)
  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration || {};
      const totalAcceleration = Math.sqrt((x || 0) * (x || 0) + (y || 0) * (y || 0) + (z || 0) * (z || 0));

      if (totalAcceleration > MOBILE_TRIGGERS.PHONE_SHAKE.threshold && !shakeDetected) {
        setShakeDetected(true);
        onMobileEngagement('shake_detected', MOBILE_TRIGGERS.PHONE_SHAKE);
        
        // Reset shake detection after timeout
        shakeTimeoutRef.current = setTimeout(() => {
          setShakeDetected(false);
        }, 3000);
      }
    };

    if (isMobile && 'DeviceMotionEvent' in window) {
      // Request permission for iOS devices
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission().then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        });
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, [isMobile, shakeDetected, onMobileEngagement]);

  // Handle quick action clicks
  const handleQuickAction = (action: any) => {
    if (action.action.startsWith('tel:') || action.action.startsWith('sms:')) {
      window.location.href = action.action;
    } else {
      onMobileEngagement('quick_action', action);
    }
  };

  // Mobile-optimized floating quick actions
  if (chatContext.timeOnPage > 10000 && !chatContext.hasInteracted && !showQuickActions) {
    return (
      <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-none shadow-lg animate-bounce">
          <CardContent className="p-3">
            <Button
              onClick={() => setShowQuickActions(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-4 font-medium"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Quick Help
              <ArrowUp className="w-3 h-3 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expanded quick actions menu
  if (showQuickActions) {
    return (
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        <Card className="w-64 shadow-xl border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Quick Actions</h3>
                  <p className="text-xs text-gray-500">Get help instantly</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowQuickActions(false)}
                className="w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {MOBILE_QUICK_ACTIONS.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className={`w-full justify-start h-12 ${
                      action.priority === 'high' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-3" />
                    <span className="flex-1 text-left">{action.label}</span>
                    {action.conversion && (
                      <Badge className="bg-green-500 text-white ml-2">
                        <Star className="w-3 h-3" />
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
            
            {/* Voice input button */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button
                onClick={startVoiceInput}
                disabled={isListening}
                className={`w-full h-12 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Message
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                💡 Tip: Shake your phone for instant help
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 