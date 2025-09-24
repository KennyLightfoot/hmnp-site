'use client';

/**
 * 🤖 AI Booking Assistant - Contextual Help During Booking Process
 * Houston Mobile Notary Pros
 * 
 * Features:
 * - Context-aware assistance based on current booking step
 * - Proactive help detection (form abandonment, errors, hesitation)
 * - Smart service recommendations based on user inputs
 * - Real-time form validation assistance
 * - Instant answers to common booking questions
 * - Mobile-optimized slide-in interface
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  X, 
  Send, 
  Minimize2, 
  MessageCircle,
  Lightbulb,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Types
interface BookingContext {
  currentStep: number;
  stepId: string;
  formData: any;
  errors: string[];
  completedSteps: number[];
  timeOnStep: number;
  userActions: string[];
  selectedService?: string;
  location?: string;
  urgency?: string;
}

interface AIMessage {
  id: string;
  type: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

interface AIBookingAssistantProps {
  bookingContext: BookingContext;
  onContextualHelp: (action: string, data?: any) => void;
  onServiceRecommendation: (serviceId: string) => void;
  onFieldFocus: (fieldName: string) => void;
  className?: string;
}

// Step-specific context and help
const STEP_CONTEXTS = {
  0: {
    name: 'Service Selection',
    commonQuestions: [
      'What\'s the difference between services?',
      'Which service is right for me?',
      'How much does it cost?',
      'Do you have same-day service?'
    ],
    helpTriggers: [
      'user_hovering_over_services',
      'time_on_step_over_60s',
      'multiple_service_clicks',
      'price_comparison_behavior'
    ],
    smartSuggestions: [
      'Most customers choose Standard Mobile Notary for routine documents',
      'Need it today? Extended Hours guarantees same-day service',
      'Loan signing? Our specialists handle complex real estate docs'
    ]
  },
  1: {
    name: 'Customer Information',
    commonQuestions: [
      'Is my information secure?',
      'Do you need my phone number?',
      'Will you spam me?',
      'Can I change this later?'
    ],
    helpTriggers: [
      'email_validation_error',
      'phone_field_hesitation',
      'privacy_concerns',
      'form_abandonment'
    ],
    smartSuggestions: [
      'We only use your email for booking confirmations',
      'Phone is optional but helps with urgent updates',
      'Your information is encrypted and never shared'
    ]
  },
  2: {
    name: 'Location',
    commonQuestions: [
      'Do you travel to my area?',
      'Are there travel fees?',
      'Can you meet me at work?',
      'What about parking?'
    ],
    helpTriggers: [
      'address_validation_error',
      'distance_calculation',
      'travel_fee_concerns',
      'location_uncertainty'
    ],
    smartSuggestions: [
      'We travel to you - no need to come to us!',
      'Free travel within 30 miles',
      'We can meet at your office, home, or convenient location'
    ]
  },
  3: {
    name: 'Scheduling',
    commonQuestions: [
      'What times are available?',
      'Can you come same-day?',
      'What if I need to reschedule?',
      'Do you work weekends?'
    ],
    helpTriggers: [
      'no_available_times',
      'same_day_urgency',
      'time_conflicts',
      'weekend_requests'
    ],
    smartSuggestions: [
      'Same-day available before 3pm',
      'Weekend appointments available',
      'Flexible scheduling - we work around your time'
    ]
  },
  4: {
    name: 'Review & Confirm',
    commonQuestions: [
      'Can I make changes?',
      'What payment methods do you accept?',
      'What if I need to cancel?',
      'Will I get a confirmation?'
    ],
    helpTriggers: [
      'payment_hesitation',
      'booking_review_time',
      'cancellation_policy_check',
      'confirmation_uncertainty'
    ],
    smartSuggestions: [
      'You can modify your booking anytime',
      'Secure payment at time of service',
      'Instant confirmation via email & text'
    ]
  }
};

export default function AIBookingAssistant({
  bookingContext,
  onContextualHelp,
  onServiceRecommendation,
  onFieldFocus,
  className = ''
}: AIBookingAssistantProps) {
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProactiveSuggestion, setShowProactiveSuggestion] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null);
  const [userInteractionCount, setUserInteractionCount] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Initialize with context-aware welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const stepContext = STEP_CONTEXTS[bookingContext.currentStep as keyof typeof STEP_CONTEXTS];
      const welcomeMessage: AIMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hi! I'm your AI booking assistant. I'm here to help you with ${stepContext?.name || 'your booking'}. ${stepContext?.smartSuggestions[0] || 'Let me know if you need any help!'}`,
        timestamp: new Date(),
        suggestions: stepContext?.commonQuestions?.slice(0, 2) || []
      };
      setMessages([welcomeMessage]);
    }
  }, [bookingContext.currentStep, messages.length]);

  // Proactive help detection
  useEffect(() => {
    const stepContext = STEP_CONTEXTS[bookingContext.currentStep as keyof typeof STEP_CONTEXTS];
    
    // Time-based triggers
    if (bookingContext.timeOnStep > 60000) { // 60 seconds
      triggerProactiveHelp('time_on_step_over_60s');
    }
    
    // Error-based triggers
    if (bookingContext.errors.length > 0) {
      triggerProactiveHelp('validation_errors');
    }
    
    // Step completion triggers
    if (bookingContext.completedSteps.length === 0 && bookingContext.timeOnStep > 30000) {
      triggerProactiveHelp('first_step_hesitation');
    }
  }, [bookingContext.timeOnStep, bookingContext.errors.length, bookingContext.completedSteps.length]);

  // Smart service recommendations
  useEffect(() => {
    if (bookingContext.currentStep === 0 && bookingContext.formData) {
      generateServiceRecommendation();
    }
  }, [bookingContext.formData, bookingContext.currentStep]);

  const triggerProactiveHelp = useCallback((trigger: string) => {
    const stepContext = STEP_CONTEXTS[bookingContext.currentStep as keyof typeof STEP_CONTEXTS];
    
    if (stepContext?.helpTriggers.includes(trigger)) {
      const suggestion = getProactiveSuggestion(trigger);
      if (suggestion) {
        setCurrentSuggestion(suggestion);
        setShowProactiveSuggestion(true);
      }
    }
  }, [bookingContext.currentStep]);

  const getProactiveSuggestion = (trigger: string): string | null => {
    const suggestions = {
      'time_on_step_over_60s': 'I notice you\'ve been on this step for a while. Need help choosing the right option?',
      'validation_errors': 'I can help you fix those form errors. Would you like some guidance?',
      'first_step_hesitation': 'First time booking? I can walk you through the process step by step!',
      'email_validation_error': 'Having trouble with the email format? Let me help you get that right.',
      'phone_field_hesitation': 'Phone number is optional - we use it for urgent updates about your appointment.',
      'address_validation_error': 'I can help you format your address correctly for our system.',
      'no_available_times': 'No available times? I can help you find alternative options or expedite your booking.',
      'same_day_urgency': 'Need same-day service? I can show you which services guarantee same-day availability.',
      'payment_hesitation': 'Questions about payment? We accept all major cards and payment is secure at time of service.'
    };
    
    return suggestions[trigger as keyof typeof suggestions] || null;
  };

  const generateServiceRecommendation = async () => {
    // This would normally call your AI service, but for now using smart logic
    const { formData, selectedService, location, urgency } = bookingContext;
    
    if (!selectedService || userInteractionCount > 0) {
      // Generate smart recommendation based on context
      const recommendation = getSmartServiceRecommendation(formData, location, urgency);
      
      if (recommendation) {
        const message: AIMessage = {
          id: `rec_${Date.now()}`,
          type: 'assistant',
          content: `Based on your needs, I recommend **${recommendation.serviceName}**. ${recommendation.reason}`,
          timestamp: new Date(),
          actions: [{
            label: `Select ${recommendation.serviceName}`,
            action: 'select_service',
            data: { serviceId: recommendation.serviceId }
          }]
        };
        
        setMessages(prev => [...prev, message]);
        setIsOpen(true);
      }
    }
  };

  const getSmartServiceRecommendation = (formData: any, location?: string, urgency?: string) => {
    // Smart recommendation logic based on context
    if (urgency === 'today') {
      return {
        serviceId: 'EXTENDED_HOURS',
        serviceName: 'Extended Hours Mobile',
        reason: 'This service guarantees same-day availability and can accommodate urgent requests.'
      };
    }
    
    if (formData?.documentType?.includes('loan') || formData?.documentType?.includes('real estate')) {
      return {
        serviceId: 'LOAN_SIGNING',
        serviceName: 'Loan Signing Specialist',
        reason: 'Our specialists have expertise with loan documents and real estate transactions.'
      };
    }
    
    return {
      serviceId: 'STANDARD_NOTARY',
      serviceName: 'Standard Mobile Notary',
      reason: 'This is our most popular service, perfect for routine document notarization.'
    };
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);
    setUserInteractionCount(prev => prev + 1);
    
    // Simulate AI response (in production, this would call your AI API)
    setTimeout(() => {
      const aiResponse = generateAIResponse(currentMessage, bookingContext);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Auto-scroll to bottom
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 1000);
  };

  const generateAIResponse = (userMessage: string, context: BookingContext): AIMessage => {
    const stepContext = STEP_CONTEXTS[context.currentStep as keyof typeof STEP_CONTEXTS];
    
    // Simple keyword-based responses (in production, this would use your AI service)
    const responses = {
      'cost': 'Our services range from $50-$250 depending on complexity. Standard Mobile Notary is $75 and most popular.',
      'same-day': 'Yes! Extended Hours Mobile guarantees same-day service if booked before 3pm.',
      'travel': 'We travel to you at no extra cost within 30 miles. Further distances may have small travel fees.',
      'secure': 'Your information is encrypted and secure. We never share your data and only use email for booking confirmations.',
      'cancel': 'You can cancel or reschedule anytime. We\'re flexible and understand plans change.',
      'payment': 'We accept all major credit cards. Payment is processed securely at time of service.',
      'weekend': 'Yes, we offer weekend appointments with Extended Hours Mobile service.',
      'documents': 'Bring a valid ID and the documents to be notarized. We\'ll guide you through the rest!'
    };
    
    let responseContent = 'I\'m here to help! Can you be more specific about what you need assistance with?';
    
    // Match user message to appropriate response
    for (const [keyword, response] of Object.entries(responses)) {
      if (userMessage.toLowerCase().includes(keyword)) {
        responseContent = response;
        break;
      }
    }
    
    return {
      id: `ai_${Date.now()}`,
      type: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      suggestions: stepContext?.commonQuestions?.slice(0, 2) || []
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    handleSendMessage();
  };

  const handleActionClick = (action: string, data?: any) => {
    switch (action) {
      case 'select_service':
        if (data?.serviceId) {
          onServiceRecommendation(data.serviceId);
          setIsOpen(false);
        }
        break;
      case 'focus_field':
        if (data?.fieldName) {
          onFieldFocus(data.fieldName);
        }
        break;
      case 'contextual_help':
        onContextualHelp(action, data);
        break;
      default:
        break;
    }
  };

  const handleProactiveSuggestionAccept = () => {
    setShowProactiveSuggestion(false);
    setIsOpen(true);
    
    if (currentSuggestion) {
      const message: AIMessage = {
        id: `proactive_${Date.now()}`,
        type: 'assistant',
        content: currentSuggestion,
        timestamp: new Date(),
        suggestions: STEP_CONTEXTS[bookingContext.currentStep as keyof typeof STEP_CONTEXTS]?.commonQuestions?.slice(0, 2) || []
      };
      setMessages(prev => [...prev, message]);
    }
  };

  const handleProactiveSuggestionDismiss = () => {
    setShowProactiveSuggestion(false);
    setCurrentSuggestion(null);
  };

  // Proactive suggestion bubble
  if (showProactiveSuggestion && currentSuggestion && !isOpen) {
    return (
      <div className={`fixed bottom-20 right-4 z-50 max-w-sm ${className}`}>
        <Card className="bg-blue-50 border-blue-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{currentSuggestion}</p>
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleProactiveSuggestionAccept}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Yes, help me
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleProactiveSuggestionDismiss}
                  >
                    <X className="w-3 h-3 mr-1" />
                    No thanks
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chat widget toggle button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg ${className}`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    );
  }

  // Main chat interface
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className={`w-80 md:w-96 ${isMinimized ? 'h-14' : 'h-96'} shadow-xl transition-all duration-300`}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">AI Booking Assistant</CardTitle>
                <p className="text-xs text-gray-500">Here to help with your booking</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
              <div className="space-y-3 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Action buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="secondary"
                              onClick={() => handleActionClick(action.action, action.data)}
                              className="h-7 px-2 text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="h-6 px-2 text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask me anything about your booking..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 