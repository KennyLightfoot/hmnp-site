"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, Phone, Calendar } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  quickReplies?: string[]
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const botResponses = {
    greeting: {
      text: "Hi! I'm here to help with your notary needs. What can I assist you with today?",
      quickReplies: ["Book an appointment", "Check pricing", "Service areas", "RON services"],
    },
    pricing: {
      text: "Our pricing is transparent and competitive:\n\n• Quick-Stamp Local: $50\n• Standard Mobile: $75\n• Extended Hours: $100\n• Loan Signing: $150\n• RON Services: $25/session\n\nWould you like to book a service?",
      quickReplies: ["Book now", "Learn about RON", "Service areas"],
    },
    booking: {
      text: "Great! I can help you book an appointment. Our online booking system makes it easy to schedule your notary service. What type of service do you need?",
      quickReplies: ["Mobile notary", "RON service", "Loan signing", "Call instead"],
    },
    areas: {
      text: "We serve the greater Houston area including:\n\n• Katy, Sugar Land, The Woodlands\n• Pearland, Cypress, Spring\n• And surrounding areas within 30 miles\n\nWhere do you need service?",
      quickReplies: ["Book appointment", "Check my area", "Call for details"],
    },
    ron: {
      text: "Remote Online Notarization (RON) lets you get documents notarized from anywhere! It's:\n\n• Available 24/7\n• Completely secure\n• Texas state compliant\n• Only $25 per session\n\nReady to try RON?",
      quickReplies: ["Start RON session", "Learn more", "Book mobile instead"],
    },
  }

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      let botResponse = botResponses.greeting

      const lowerText = text.toLowerCase()
      if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("fee")) {
        botResponse = botResponses.pricing
      } else if (lowerText.includes("book") || lowerText.includes("appointment") || lowerText.includes("schedule")) {
        botResponse = botResponses.booking
      } else if (lowerText.includes("area") || lowerText.includes("location") || lowerText.includes("where")) {
        botResponse = botResponses.areas
      } else if (lowerText.includes("ron") || lowerText.includes("remote") || lowerText.includes("online")) {
        botResponse = botResponses.ron
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        isBot: true,
        timestamp: new Date(),
        quickReplies: botResponse.quickReplies,
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply)
  }

  const openChat = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      // Send initial greeting
      const greeting: ChatMessage = {
        id: "greeting",
        text: botResponses.greeting.text,
        isBot: true,
        timestamp: new Date(),
        quickReplies: botResponses.greeting.quickReplies,
      }
      setMessages([greeting])
    }

    // Track chat opened
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "chat_opened", {
        event_category: "engagement",
        event_label: "live_chat_widget",
      })
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 shadow-lg animate-pulse"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open chat</span>
      </Button>
    )
  }

  return (
    <div className={`fixed z-50 ${isMobile ? "inset-4" : "bottom-6 right-6 w-80 h-96"}`}>
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 bg-accent text-accent-foreground rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <CardTitle className="text-sm font-medium">Houston Mobile Notary</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-accent-foreground hover:bg-accent-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  {message.quickReplies && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.quickReplies.map((reply) => (
                        <Button
                          key={reply}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-transparent"
                          onClick={() => handleQuickReply(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-2">
            <div className="flex gap-1 mb-2">
              <Button asChild variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                <a href="tel:+17135550123" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Call
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                <a href="/booking" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Book
                </a>
              </Button>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                className="flex-1"
              />
              <Button size="icon" onClick={() => handleSendMessage(inputValue)} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
