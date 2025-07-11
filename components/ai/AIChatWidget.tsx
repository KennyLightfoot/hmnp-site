'use client';

/**
 * 🤖 AI Chat Widget - Universal Customer Assistant
 * Houston Mobile Notary Pros
 * 
 * Features:
 * - Floating chat interface
 * - Context-aware responses
 * - Proactive engagement
 * - Mobile-optimized
 * - Voice input support
 * - Professional branding
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import AIMobileOptimizer from './AIMobileOptimizer';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Minimize2, 
  Maximize2,
  Bot,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Phone,
  Calendar
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  intent?: string;
  suggestedActions?: string[];
}

interface PageContext {
  type: 'homepage' | 'services' | 'booking' | 'faq' | 'contact' | 'general';
  path: string;
  intent: 'discovery' | 'comparison' | 'conversion' | 'support' | 'connection' | 'assistance';
  metadata?: Record<string, any>;
}

interface AIChatWidgetProps {
  className?: string;
  initialMessage?: string;
  proactiveDelay?: number;
  enableVoice?: boolean;
  enableProactive?: boolean;
}

// Quick action buttons for common needs
const QUICK_ACTIONS = [
  { id: 'get-quote', label: 'Get Quote', icon: Zap, color: 'bg-green-500' },
  { id: 'book-now', label: 'Book Now', icon: Calendar, color: 'bg-blue-500' },
  { id: 'call-now', label: 'Call Now', icon: Phone, color: 'bg-red-500' },
  { id: 'services', label: 'Services', icon: MessageCircle, color: 'bg-purple-500' },
];

export default function AIChatWidget({
  className = '',
  initialMessage,
  proactiveDelay = 30000, // 30 seconds
  enableVoice = true,
  enableProactive = true
}: AIChatWidgetProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [context, setContext] = useState<PageContext>();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Phase 4: Mobile optimization state
  const [isMobile, setIsMobile] = useState(false);
  const [pageStartTime] = useState(Date.now());
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Detect page context and mobile
  useEffect(() => {
    const detectPageContext = (): PageContext => {
      const pathname = window.location.pathname;
      const contexts: Record<string, Omit<PageContext, 'path'>> = {
        '/': { type: 'homepage', intent: 'discovery' },
        '/services': { type: 'services', intent: 'comparison' },
        '/booking': { type: 'booking', intent: 'conversion' },
        '/faq': { type: 'faq', intent: 'support' },
        '/contact': { type: 'contact', intent: 'connection' }
      };
      
      const matchedContext = contexts[pathname] || { type: 'general', intent: 'assistance' };
      return { ...matchedContext, path: pathname };
    };
    
    const detectMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    setContext(detectPageContext());
    detectMobile();
    
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);
  
  // Proactive engagement
  useEffect(() => {
    if (!enableProactive || hasInteracted || isOpen) return;
    
    const timer = setTimeout(() => {
      triggerProactiveMessage();
    }, proactiveDelay);
    
    return () => clearTimeout(timer);
  }, [enableProactive, hasInteracted, isOpen, proactiveDelay, context]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!enableVoice || typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, [enableVoice]);
  
  // Trigger proactive engagement
  const triggerProactiveMessage = useCallback(() => {
    if (!context) return;
    
    const proactiveMessages: Record<string, string> = {
      homepage: "👋 Hi there! Looking for notary services? I can help you find the perfect solution!",
      services: "🔍 Need help choosing the right service? I can explain the differences and help you decide!",
      booking: "📋 Let me guide you through the booking process step by step!",
      faq: "❓ Have questions about our notary services? Ask me anything!",
      contact: "💬 I can help you right now, or connect you with our team if you prefer!",
      general: "👋 Hi! I'm here to help with any questions about our notary services. What can I do for you?"
    };
    
    const message: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: proactiveMessages[context.type] || proactiveMessages.general,
      timestamp: new Date(),
      confidence: 1.0,
      intent: 'proactive_engagement'
    };
    
    setMessages([message]);
    setUnreadCount(1);
    
    // Show a subtle notification
    if (!isOpen) {
      // Could add a bounce animation or notification sound here
    }
  }, [context, isOpen]);
  
  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setHasInteracted(true);
    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: context,
          sessionId: `chat-${Date.now()}`,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        })
      });
      
      if (!response.ok) throw new Error('AI service unavailable');
      
      const aiResponse = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.response || "I'm sorry, I didn't understand that. Can you please rephrase?",
        timestamp: new Date(),
        confidence: aiResponse.confidence || 0.5,
        intent: aiResponse.intent || 'general_inquiry',
        suggestedActions: aiResponse.suggestedActions || []
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having technical difficulties right now. Would you like me to connect you with our team? You can call us at (832) 617-4285 or use the contact form.",
        timestamp: new Date(),
        confidence: 0.0,
        intent: 'technical_error',
        suggestedActions: ['call_now', 'contact_form']
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [context, messages]);
  
  // Handle quick actions
  const handleQuickAction = useCallback(async (actionId: string) => {
    const actionMessages: Record<string, string> = {
      'get-quote': "I need a price quote for notary services",
      'book-now': "I want to book an appointment",
      'call-now': "I need to speak with someone",
      'services': "Tell me about your services"
    };
    
    const message = actionMessages[actionId];
    if (message) {
      await handleSendMessage(message);
    }
  }, [handleSendMessage]);
  
  // Handle voice input
  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);
  
  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  }, [inputMessage, handleSendMessage]);
  
  // Toggle chat
  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  // Handle mobile engagement
  const handleMobileEngagement = useCallback(async (action: string, data?: any) => {
    setHasInteracted(true);
    
    switch (action) {
      case 'voice_input':
        if (data?.message) {
          await handleSendMessage(data.message);
        }
        break;
      case 'quick_action':
        if (data?.action === 'quick_quote') {
          await handleSendMessage("I need a quick price quote for notary services");
        } else if (data?.action === 'voice_booking') {
          await handleSendMessage("I'd like to book an appointment using voice");
        }
        break;
      case 'scroll_hesitation':
      case 'touch_hold':
      case 'shake_detected':
        if (data?.message && !isOpen) {
          setIsOpen(true);
          await handleSendMessage(data.message);
        }
        break;
      default:
        break;
    }
  }, [handleSendMessage, isOpen]);

  // Format message content
  const formatMessageContent = (content: string) => {
    // Basic markdown-style formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };
  
  if (!context) return null;
  
  return (
    <>
      {/* Phase 4: Mobile Optimizer */}
      <AIMobileOptimizer
        isMobile={isMobile}
        onMobileEngagement={handleMobileEngagement}
        chatContext={{
          isOpen,
          hasInteracted,
          currentPage: context.path,
          timeOnPage: Date.now() - pageStartTime
        }}
      />
      
      {/* Main Chat Widget */}
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Widget */}
      {isOpen && (
        <Card className={`mb-4 shadow-2xl border-2 border-[#A52A2A] ${
          isMinimized ? 'h-16' : 'h-96 md:h-[500px]'
        } w-80 md:w-96 transition-all duration-300 ease-in-out`}>
          
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-[#002147] to-[#003366] text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-[#A52A2A]" />
                <div>
                  <CardTitle className="text-sm font-semibold">AI Assistant</CardTitle>
                  <p className="text-xs text-blue-100">
                    {context.type === 'homepage' && 'Ready to help you get started!'}
                    {context.type === 'services' && 'Service guidance expert'}
                    {context.type === 'booking' && 'Booking assistance'}
                    {context.type === 'faq' && 'Got questions? Ask away!'}
                    {context.type === 'contact' && 'Here to connect you'}
                    {context.type === 'general' && 'Houston Mobile Notary Pros'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/10"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="h-8 w-8 p-0 text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Messages Area */}
          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-full">
              <ScrollArea className="flex-1 p-4 max-h-80">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-2 text-[#A52A2A]" />
                    <p className="text-sm">
                      Hi! I'm your AI assistant. How can I help you today?
                    </p>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {QUICK_ACTIONS.map(action => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action.id)}
                          className="flex items-center space-x-1 text-xs"
                        >
                          <action.icon className="h-3 w-3" />
                          <span>{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-[#A52A2A] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'ai' && (
                          <Bot className="h-4 w-4 mt-1 text-[#A52A2A] flex-shrink-0" />
                        )}
                        {message.type === 'user' && (
                          <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div
                            className="text-sm"
                            dangerouslySetInnerHTML={{
                              __html: formatMessageContent(message.content)
                            }}
                          />
                          {message.confidence && message.confidence < 0.7 && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Low confidence
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Suggested Actions */}
                      {message.suggestedActions && message.suggestedActions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.suggestedActions.map((action, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickAction(action)}
                              className="text-xs h-6 px-2"
                            >
                              {action.replace(/_/g, ' ')}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-[#A52A2A]" />
                        <Loader2 className="h-4 w-4 animate-spin text-[#A52A2A]" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  
                  {enableVoice && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      className={`px-3 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-[#A52A2A] hover:bg-[#8B0000] px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          )}
        </Card>
      )}
      
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-gray-500 hover:bg-gray-600' 
            : 'bg-[#A52A2A] hover:bg-[#8B0000]'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        )}
      </Button>
    </div>
    </>
  );
} 