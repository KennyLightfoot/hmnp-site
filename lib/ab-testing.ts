"use client"

interface Experiment {
  id: string
  name: string
  variants: {
    id: string
    name: string
    weight: number
  }[]
  isActive: boolean
}

interface ExperimentResult {
  experimentId: string
  variantId: string
  userId: string
  timestamp: Date
}

class ABTestingManager {
  private experiments: Map<string, Experiment> = new Map()
  private userAssignments: Map<string, Map<string, string>> = new Map()

  constructor() {
    // Initialize with some default experiments
    this.addExperiment({
      id: "hero_cta_text",
      name: "Hero CTA Button Text",
      variants: [
        { id: "book_now", name: "Book Now", weight: 50 },
        { id: "get_started", name: "Get Started Today", weight: 50 },
      ],
      isActive: true,
    })

    this.addExperiment({
      id: "pricing_display",
      name: "Pricing Section Layout",
      variants: [
        { id: "cards", name: "Card Layout", weight: 50 },
        { id: "table", name: "Table Layout", weight: 50 },
      ],
      isActive: true,
    })
  }

  addExperiment(experiment: Experiment) {
    this.experiments.set(experiment.id, experiment)
  }

  getVariant(experimentId: string, userId?: string): string | null {
    const experiment = this.experiments.get(experimentId)
    if (!experiment || !experiment.isActive) {
      return null
    }

    const effectiveUserId = userId || this.getUserId()

    // Check if user already has an assignment
    if (!this.userAssignments.has(effectiveUserId)) {
      this.userAssignments.set(effectiveUserId, new Map())
    }

    const userExperiments = this.userAssignments.get(effectiveUserId)!
    if (userExperiments.has(experimentId)) {
      return userExperiments.get(experimentId)!
    }

    // Assign variant based on weights
    const variant = this.assignVariant(experiment, effectiveUserId)
    userExperiments.set(experimentId, variant.id)

    // Track assignment
    this.trackExperimentAssignment(experimentId, variant.id, effectiveUserId)

    return variant.id
  }

  private assignVariant(experiment: Experiment, userId: string) {
    // Use userId hash for consistent assignment
    const hash = this.hashString(userId + experiment.id)
    const random = (hash % 100) + 1

    let cumulativeWeight = 0
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight
      if (random <= cumulativeWeight) {
        return variant
      }
    }

    return experiment.variants[0] // Fallback
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private getUserId(): string {
    if (typeof window === "undefined") return "anonymous"

    let userId = localStorage.getItem("ab_test_user_id")
    if (!userId) {
      userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("ab_test_user_id", userId)
    }
    return userId
  }

  trackConversion(experimentId: string, conversionType: string, value?: number) {
    const userId = this.getUserId()
    const userExperiments = this.userAssignments.get(userId)

    if (!userExperiments || !userExperiments.has(experimentId)) {
      return // User not in experiment
    }

    const variantId = userExperiments.get(experimentId)!

    // Track with analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "ab_test_conversion", {
        event_category: "ab_testing",
        event_label: `${experimentId}_${variantId}_${conversionType}`,
        value: value || 1,
        custom_parameters: {
          experiment_id: experimentId,
          variant_id: variantId,
          conversion_type: conversionType,
        },
      })
    }

    console.log("[v0] AB Test Conversion:", {
      experimentId,
      variantId,
      conversionType,
      value,
      userId,
    })
  }

  private trackExperimentAssignment(experimentId: string, variantId: string, userId: string) {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "ab_test_assignment", {
        event_category: "ab_testing",
        event_label: `${experimentId}_${variantId}`,
        custom_parameters: {
          experiment_id: experimentId,
          variant_id: variantId,
        },
      })
    }
  }
}

export const abTesting = new ABTestingManager()

// React hook for easy component usage
export function useABTest(experimentId: string) {
  const variant = abTesting.getVariant(experimentId)

  const trackConversion = (conversionType: string, value?: number) => {
    abTesting.trackConversion(experimentId, conversionType, value)
  }

  return { variant, trackConversion }
}
