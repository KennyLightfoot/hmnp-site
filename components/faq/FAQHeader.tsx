"use client";

import { Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface FAQHeaderProps {
  totalQuestions: number;
  answeredToday?: number;
}

export function FAQHeader({ totalQuestions, answeredToday = 47 }: FAQHeaderProps) {
  return (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {totalQuestions}+ Questions Answered
          </span>
          <span className="text-gray-400">•</span>
          <span>{answeredToday} answered today</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Frequently Asked
          <span className="block text-[#002147]">Questions</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Get instant answers to common questions about our mobile notary services, 
          document requirements, pricing, and scheduling process.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-[#002147]/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-secondary text-white p-3 rounded-full">
                <Phone className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Speak with Expert</h3>
                <p className="text-sm text-gray-600">Get immediate help</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-[#002147]/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-white p-3 rounded-full">
                <Mail className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-600">Detailed responses</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary-light text-white p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
        <p className="text-blue-100 mb-6 max-w-md mx-auto">
          Our certified notary team is ready to help with your urgent document needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            className="bg-white text-[#002147] hover:bg-gray-100 font-semibold"
          >
            <Link href="/booking">Book Appointment</Link>
          </Button>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-[#002147]"
          >
            <Phone className="mr-2 h-4 w-4" />
            Call (281) 991-7475
          </Button>
        </div>
      </div>
    </div>
  );
}