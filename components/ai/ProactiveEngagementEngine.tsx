'use client';

/**
 * 🤖 Proactive Engagement Engine - Phase 4 Enhancement
 * Houston Mobile Notary Pros
 * 
 * Features:
 * - Behavior pattern analysis
 * - Smart engagement triggers
 * - A/B testing for messaging
 * - Exit intent detection
 * - Scroll depth tracking
 * - Time-based engagement
 * - Conversion optimization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Clock, 
  Target, 
  Zap, 
  TrendingUp,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface UserBehavior {
  sessionId: string;
  timeOnPage: number;
  scrollDepth: number;
  mouseMovements: number;
  clickCount: number;
  formInteractions: number;
  pageViews: string[];
  engagementScore: number;
  exitIntentDetected: boolean;
  conversionLikelihood: number;
  hasInteractedWithAI: boolean;
}

interface EngagementTrigger {
  id: string;
  name: string;
  condition: (behavior: UserBehavior) => boolean;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldownMs: number;
  conversionWeight: number;
  testVariant?: 'A' | 'B' | 'C';
}

interface ProactiveEngagementProps {
  onEngagement: (trigger: EngagementTrigger, behavior: UserBehavior) => void;
  onAnalytics: (event: string, data: any) => void;
  className?: string;
}

// Advanced engagement triggers with A/B testing
const ENGAGEMENT_TRIGGERS: EngagementTrigger[] = [
  // Exit Intent Prevention
  {
    id: 'exit_intent_critical',
    name: 'Exit Intent - Critical',
    condition: (b) => b.exitIntentDetected && !b.hasInteractedWithAI,
    message: '⚡ Wait! Get a quote in 30 seconds - no phone call needed!',
    priority: 'critical',
    cooldownMs: 0, // No cooldown for exit intent
    conversionWeight: 0.9,
    testVariant: 'A'
  },
  {
    id: 'exit_intent_alternative',
    name: 'Exit Intent - Alternative',
    condition: (b) => b.exitIntentDetected && !b.hasInteractedWithAI,
    message: '🎯 Before you go - let me answer any questions in 10 seconds!',
    priority: 'critical',
    cooldownMs: 0,
    conversionWeight: 0.85,
    testVariant: 'B'
  },
  
  // High Engagement Scoring
  {
    id: 'high_engagement_booking',
    name: 'High Engagement - Booking Focus',
    condition: (b) => b.engagementScore >= 80 && b.timeOnPage > 60000,
    message: '🚀 I see you\'re really interested! Want me to help you book right now?',
    priority: 'high',
    cooldownMs: 120000, // 2 minutes
    conversionWeight: 0.8,
    testVariant: 'A'
  },
  {
    id: 'high_engagement_pricing',
    name: 'High Engagement - Pricing Focus',
    condition: (b) => b.engagementScore >= 80 && b.timeOnPage > 60000,
    message: '💰 Ready for pricing? I can give you an instant quote!',
    priority: 'high',
    cooldownMs: 120000,
    conversionWeight: 0.75,
    testVariant: 'B'
  },
  
  // Scroll Depth Triggers
  {
    id: 'deep_scroll_services',
    name: 'Deep Scroll - Services Page',
    condition: (b) => b.scrollDepth >= 75 && b.pageViews.includes('/services'),
    message: '📋 Questions about our services? I can explain everything!',
    priority: 'medium',
    cooldownMs: 180000, // 3 minutes
    conversionWeight: 0.6
  },
  
  // Form Abandonment
  {
    id: 'form_abandonment',
    name: 'Form Abandonment',
    condition: (b) => b.formInteractions >= 3 && b.timeOnPage > 45000,
    message: '🤝 Need help completing your booking? I can guide you step by step!',
    priority: 'high',
    cooldownMs: 60000, // 1 minute
    conversionWeight: 0.85
  },
  
  // Time-based Engagement
  {
    id: 'time_based_gentle',
    name: 'Time Based - Gentle',
    condition: (b) => b.timeOnPage >= 90000 && !b.hasInteractedWithAI,
    message: '👋 Hi there! Anything I can help you find today?',
    priority: 'low',
    cooldownMs: 300000, // 5 minutes
    conversionWeight: 0.4,
    testVariant: 'A'
  },
  {
    id: 'time_based_value',
    name: 'Time Based - Value Prop',
    condition: (b) => b.timeOnPage >= 90000 && !b.hasInteractedWithAI,
    message: '⭐ Did you know we serve Houston 24/7? Ask me anything!',
    priority: 'low',
    cooldownMs: 300000,
    conversionWeight: 0.45,
    testVariant: 'B'
  },
  
  // Conversion Likelihood
  {
    id: 'high_conversion_direct',
    name: 'High Conversion - Direct',
    condition: (b) => b.conversionLikelihood >= 0.8,
    message: '🎯 Ready to book? I can get you scheduled in under 2 minutes!',
    priority: 'high',
    cooldownMs: 90000,
    conversionWeight: 0.95
  },
  
  // Mobile-specific
  {
    id: 'mobile_quick_help',
    name: 'Mobile Quick Help',
    condition: (b) => b.timeOnPage > 30000 && typeof window !== 'undefined' && window.innerWidth <= 768,
    message: '📱 Quick question? Tap to chat - faster than calling!',
    priority: 'medium',
    cooldownMs: 240000, // 4 minutes
    conversionWeight: 0.7
  }
];

export default function ProactiveEngagementEngine({
  onEngagement,
  onAnalytics,
  className = ''
}: ProactiveEngagementProps) {
  
  // Behavior tracking state
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    sessionId: `session_${Date.now()}`,
    timeOnPage: 0,
    scrollDepth: 0,
    mouseMovements: 0,
    clickCount: 0,
    formInteractions: 0,
    pageViews: [window.location.pathname],
    engagementScore: 0,
    exitIntentDetected: false,
    conversionLikelihood: 0,
    hasInteractedWithAI: false
  });
  
  const [triggeredEngagements, setTriggeredEngagements] = useState<Set<string>>(new Set());
  const [lastTriggerTime, setLastTriggerTime] = useState<Map<string, number>>(new Map());
  const [abTestVariant, setAbTestVariant] = useState<'A' | 'B' | 'C'>('A');
  const [showEngagementPopup, setShowEngagementPopup] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<EngagementTrigger | null>(null);
  
  // Refs for tracking
  const startTime = useRef(Date.now());
  const scrollDepthRef = useRef(0);
  const mouseMovementRef = useRef(0);
  const lastScrollPosition = useRef(0);
  const exitIntentTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize A/B test variant
  useEffect(() => {
    const savedVariant = localStorage.getItem('ai_engagement_variant') as 'A' | 'B' | 'C';
    if (savedVariant) {
      setAbTestVariant(savedVariant);
    } else {
      const variants: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      setAbTestVariant(randomVariant);
      localStorage.setItem('ai_engagement_variant', randomVariant);
    }
  }, []);

  // Time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setUserBehavior(prev => ({
        ...prev,
        timeOnPage: Date.now() - startTime.current
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      scrollDepthRef.current = Math.max(scrollDepthRef.current, scrollPercent);
      
      setUserBehavior(prev => ({
        ...prev,
        scrollDepth: scrollDepthRef.current
      }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse movement tracking
  useEffect(() => {
    const handleMouseMove = () => {
      mouseMovementRef.current++;
      
      if (mouseMovementRef.current % 50 === 0) { // Update every 50 movements
        setUserBehavior(prev => ({
          ...prev,
          mouseMovements: mouseMovementRef.current
        }));
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Click tracking
  useEffect(() => {
    const handleClick = () => {
      setUserBehavior(prev => ({
        ...prev,
        clickCount: prev.clickCount + 1
      }));
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Form interaction tracking
  useEffect(() => {
    const handleFormInteraction = (e: Event) => {
      if ((e.target as HTMLElement).matches('input, textarea, select')) {
        setUserBehavior(prev => ({
          ...prev,
          formInteractions: prev.formInteractions + 1
        }));
      }
    };

    document.addEventListener('focus', handleFormInteraction, true);
    document.addEventListener('input', handleFormInteraction, true);
    return () => {
      document.removeEventListener('focus', handleFormInteraction, true);
      document.removeEventListener('input', handleFormInteraction, true);
    };
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !userBehavior.exitIntentDetected) {
        setUserBehavior(prev => ({
          ...prev,
          exitIntentDetected: true
        }));
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [userBehavior.exitIntentDetected]);

  // Calculate engagement score
  useEffect(() => {
    const calculateEngagementScore = () => {
      let score = 0;
      
      // Time weight (0-25 points)
      score += Math.min(userBehavior.timeOnPage / 1000 / 4, 25); // 25 points at 100 seconds
      
      // Scroll depth weight (0-20 points)
      score += (userBehavior.scrollDepth / 100) * 20;
      
      // Interaction weight (0-30 points)
      score += Math.min(userBehavior.clickCount * 2, 15);
      score += Math.min(userBehavior.formInteractions * 5, 15);
      
      // Page exploration weight (0-15 points)
      score += Math.min(userBehavior.pageViews.length * 3, 15);
      
      // Mouse movement weight (0-10 points)
      score += Math.min(userBehavior.mouseMovements / 100, 10);
      
      return Math.min(score, 100);
    };
    
    const calculateConversionLikelihood = () => {
      let likelihood = 0;
      
      // High engagement indicates interest
      likelihood += userBehavior.engagementScore / 100 * 0.4;
      
      // Form interactions show intent
      likelihood += Math.min(userBehavior.formInteractions / 5, 1) * 0.3;
      
      // Time on site shows consideration
      likelihood += Math.min(userBehavior.timeOnPage / 120000, 1) * 0.2; // 2 minutes
      
      // Page views show exploration
      likelihood += Math.min(userBehavior.pageViews.length / 3, 1) * 0.1;
      
      return Math.min(likelihood, 1);
    };

    const engagementScore = calculateEngagementScore();
    const conversionLikelihood = calculateConversionLikelihood();
    
    setUserBehavior(prev => ({
      ...prev,
      engagementScore,
      conversionLikelihood
    }));
  }, [
    userBehavior.timeOnPage,
    userBehavior.scrollDepth,
    userBehavior.clickCount,
    userBehavior.formInteractions,
    userBehavior.mouseMovements,
    userBehavior.pageViews.length
  ]);

  // Trigger evaluation
  useEffect(() => {
    const evaluateTriggers = () => {
      const now = Date.now();
      
      for (const trigger of ENGAGEMENT_TRIGGERS) {
        // Skip if already triggered and in cooldown
        const lastTrigger = lastTriggerTime.get(trigger.id);
        if (lastTrigger && (now - lastTrigger) < trigger.cooldownMs) {
          continue;
        }
        
        // Skip if wrong A/B test variant
        if (trigger.testVariant && trigger.testVariant !== abTestVariant) {
          continue;
        }
        
        // Check if condition is met
        if (trigger.condition(userBehavior)) {
          triggerEngagement(trigger);
          break; // Only trigger one at a time
        }
      }
    };

    const evaluationInterval = setInterval(evaluateTriggers, 2000); // Check every 2 seconds
    return () => clearInterval(evaluationInterval);
  }, [userBehavior, abTestVariant, lastTriggerTime]);

  // Trigger engagement
  const triggerEngagement = useCallback((trigger: EngagementTrigger) => {
    if (triggeredEngagements.has(trigger.id)) return;
    
    setCurrentTrigger(trigger);
    setShowEngagementPopup(true);
    setTriggeredEngagements(prev => new Set([...prev, trigger.id]));
    setLastTriggerTime(prev => new Map([...prev, [trigger.id, Date.now()]]));
    
    // Analytics tracking
    onAnalytics('proactive_engagement_triggered', {
      triggerId: trigger.id,
      triggerName: trigger.name,
      priority: trigger.priority,
      userBehavior,
      abTestVariant,
      conversionWeight: trigger.conversionWeight
    });
  }, [triggeredEngagements, onAnalytics, userBehavior, abTestVariant]);

  // Handle engagement action
  const handleEngagementAction = useCallback((action: 'accept' | 'dismiss') => {
    if (!currentTrigger) return;
    
    if (action === 'accept') {
      setUserBehavior(prev => ({ ...prev, hasInteractedWithAI: true }));
      onEngagement(currentTrigger, userBehavior);
    }
    
    // Analytics tracking
    onAnalytics('proactive_engagement_response', {
      triggerId: currentTrigger.id,
      action,
      userBehavior,
      abTestVariant
    });
    
    setShowEngagementPopup(false);
    setCurrentTrigger(null);
  }, [currentTrigger, userBehavior, onEngagement, onAnalytics, abTestVariant]);

  // Page change tracking
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (!userBehavior.pageViews.includes(currentPath)) {
      setUserBehavior(prev => ({
        ...prev,
        pageViews: [...prev.pageViews, currentPath]
      }));
    }
  }, []);

  // Engagement popup
  if (showEngagementPopup && currentTrigger) {
    return (
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}>
        <Card className="max-w-sm shadow-2xl border-2 border-blue-200 animate-in zoom-in-95">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentTrigger.priority === 'critical' ? 'bg-red-500' :
                  currentTrigger.priority === 'high' ? 'bg-orange-500' :
                  currentTrigger.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <Badge variant="outline" className="text-xs">
                  {currentTrigger.priority.toUpperCase()}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEngagementAction('dismiss')}
                className="w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentTrigger.message}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleEngagementAction('accept')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Let's Chat
              </Button>
              <Button
                onClick={() => handleEngagementAction('dismiss')}
                variant="outline"
                size="sm"
                className="px-3"
              >
                Maybe Later
              </Button>
            </div>
            
            {/* A/B Test Indicator (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-400 text-center">
                Variant: {abTestVariant} | Score: {userBehavior.engagementScore.toFixed(0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 