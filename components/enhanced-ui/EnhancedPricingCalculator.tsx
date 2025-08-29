'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Calculator, DollarSign, MapPin, Clock, FileText, Zap, Sparkles } from 'lucide-react'
import InteractiveButton from './InteractiveButton'

interface PricingBreakdown {
  base: number
  travel: number
  documents: number
  urgency: number
  total: number
}

export default function EnhancedPricingCalculator() {
  const [zip, setZip] = useState('')
  const [documents, setDocuments] = useState(1)
  const [urgency, setUrgency] = useState<'standard' | 'same-day' | 'urgent'>('standard')
  const [pricing, setPricing] = useState<PricingBreakdown>({ base: 75, travel: 0, documents: 0, urgency: 0, total: 75 })
  const [isCalculating, setIsCalculating] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const calculatePricing = () => {
    setIsCalculating(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const base = 75
      const travel = zip ? Math.min(25, Math.floor(Math.random() * 30)) : 0
      const extraDocs = Math.max(0, documents - 1) * 10
      const urgencyFee = urgency === 'same-day' ? 25 : urgency === 'urgent' ? 50 : 0
      
      const newPricing = {
        base,
        travel,
        documents: extraDocs,
        urgency: urgencyFee,
        total: base + travel + extraDocs + urgencyFee
      }
      
      setPricing(newPricing)
      setShowBreakdown(true)
      setIsCalculating(false)
    }, 1500)
  }

  useEffect(() => {
    if (zip && zip.length === 5) {
      calculatePricing()
    }
  }, [zip, documents, urgency])

  const urgencyOptions = [
    { key: 'standard', label: 'Standard (2-3 hours)', color: 'bg-green-500', fee: 0 },
    { key: 'same-day', label: 'Same-day (1-2 hours)', color: 'bg-yellow-500', fee: 25 },
    { key: 'urgent', label: 'Urgent (30-60 min)', color: 'bg-red-500', fee: 50 }
  ]

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="p-2 bg-primary/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Calculator className="h-5 w-5 text-primary" />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-white">Get Instant Pricing</h3>
          <p className="text-sm text-white/70">Transparent, no hidden fees</p>
        </div>
      </motion.div>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        {/* ZIP Code */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-white/80 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            ZIP Code
          </label>
          <motion.input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
            placeholder="77001"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            whileFocus={{ scale: 1.02 }}
            maxLength={5}
          />
        </motion.div>

        {/* Number of Documents */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-white/80 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Number of Documents
          </label>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setDocuments(Math.max(1, documents - 1))}
              className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              -
            </motion.button>
            <motion.span 
              className="flex-1 text-center py-2 bg-white/5 rounded-lg text-white font-medium"
              key={documents}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {documents}
            </motion.span>
            <motion.button
              onClick={() => setDocuments(documents + 1)}
              className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              +
            </motion.button>
          </div>
        </motion.div>

        {/* Urgency Level */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-medium text-white/80 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Service Speed
          </label>
          <div className="grid grid-cols-1 gap-2">
            {urgencyOptions.map((option) => (
              <motion.button
                key={option.key}
                onClick={() => setUrgency(option.key as any)}
                className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                  urgency === option.key
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.fee > 0 && (
                      <div className="text-sm text-white/60">+${option.fee} fee</div>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Price Display */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="text-white/70 mt-2">Calculating your personalized quote...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBreakdown && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            {/* Total Price */}
            <motion.div
              className="text-center mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-white">
                <DollarSign className="inline h-6 w-6" />
                {pricing.total}
              </div>
              <p className="text-white/60 text-sm">Total estimated cost</p>
            </motion.div>

            {/* Breakdown */}
            <div className="space-y-2 text-sm">
              <motion.div 
                className="flex justify-between text-white/80"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span>Base service</span>
                <span>${pricing.base}</span>
              </motion.div>
              
              {pricing.travel > 0 && (
                <motion.div 
                  className="flex justify-between text-white/80"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span>Travel fee</span>
                  <span>${pricing.travel}</span>
                </motion.div>
              )}
              
              {pricing.documents > 0 && (
                <motion.div 
                  className="flex justify-between text-white/80"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>Additional documents</span>
                  <span>${pricing.documents}</span>
                </motion.div>
              )}
              
              {pricing.urgency > 0 && (
                <motion.div 
                  className="flex justify-between text-white/80"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span>Urgency fee</span>
                  <span>${pricing.urgency}</span>
                </motion.div>
              )}
            </div>

            {/* CTA Button */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <InteractiveButton
                variant="primary"
                size="lg"
                className="w-full"
                glow
                ripple
              >
                <Zap className="h-5 w-5" />
                Book This Service
              </InteractiveButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

