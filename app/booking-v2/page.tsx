/**
 * 🚀 HMNP V2 Booking Page
 * The beautiful booking experience that matches our legendary backend
 * Fast, smooth, conversion-optimized
 */

import { Metadata } from 'next';
import BookingFormV2 from '@/components/v2/BookingFormV2';
import { Shield, Star, Clock, MapPin, Phone, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book Your Notary Service | Houston Mobile Notary Pros',
  description: 'Book professional mobile notary and remote online notarization services in Houston, TX. Secure, fast, and reliable notary services at your location.',
  keywords: 'mobile notary Houston, RON service Texas, notary booking, loan signing, document notarization',
  openGraph: {
    title: 'Book Your Notary Service | Houston Mobile Notary Pros',
    description: 'Professional mobile notary and RON services in Houston. Book online in minutes.',
    type: 'website',
    locale: 'en_US'
  }
};

export default function BookingV2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional Notary Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Secure, reliable, and convenient notarization services in Houston and surrounding areas
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Same-Day Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Fully Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="font-semibold">Texas Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Booking Form */}
      <div className="relative -mt-8">
        <BookingFormV2 />
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Houston Mobile Notary Pros?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just notaries - we're your trusted partners for all document notarization needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Mobile & Remote Services',
                description: 'We come to you or meet online - your choice, your convenience',
                features: ['Mobile notary services', 'Remote online notarization (RON)', 'Flexible scheduling']
              },
              {
                icon: Clock,
                title: 'Fast & Reliable',
                description: 'Same-day appointments available with professional, timely service',
                features: ['Same-day booking', 'Extended hours available', 'Emergency services']
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                description: 'Texas-certified notaries with full insurance and bonding',
                features: ['Texas state certified', 'Fully insured & bonded', 'Secure document handling']
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              We Serve the Greater Houston Area
            </h2>
            <p className="text-xl text-gray-600">
              Professional notary services throughout Houston and surrounding communities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            {[
              'Houston', 'Texas City', 'La Marque', 'Dickinson', 'League City', 'Friendswood',
              'Pearland', 'Pasadena', 'Clear Lake', 'Galveston', 'Baytown', 'Deer Park'
            ].map((city, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900">{city}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Don't see your city? <a href="tel:+1-555-123-4567" className="text-blue-600 hover:underline font-semibold">Call us</a> - we may still be able to help!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Your Documents Notarized?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied customers who trust Houston Mobile Notary Pros
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#booking-form" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Online Now
            </a>
            <a 
              href="tel:+1-555-123-4567" 
              className="flex items-center gap-2 border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call (555) 123-4567
            </a>
          </div>
          
          <div className="mt-8 text-white/80">
            <p className="text-sm">Available 7 days a week | Same-day appointments | Emergency services available</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Houston Mobile Notary Pros</h3>
              <p className="text-gray-300 mb-4">
                Your trusted partner for professional notary services in the Houston area.
              </p>
              <div className="flex space-x-4">
                <span className="text-sm text-gray-400">Texas Certified • Insured • Bonded</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Mobile Notary Services</li>
                <li>Remote Online Notarization (RON)</li>
                <li>Loan Signing Services</li>
                <li>Real Estate Closings</li>
                <li>Legal Document Notarization</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (555) 123-4567
                </p>
                <p>Available 7 days a week</p>
                <p>Emergency services available</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Houston Mobile Notary Pros. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}