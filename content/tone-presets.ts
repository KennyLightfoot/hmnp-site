export type TonePresetId =
  | "friendly_reassuring"
  | "urgent_but_calm"
  | "professional_concise"
  | "warm_expert"
  | "direct_problem_solver";

export interface TonePreset {
  id: TonePresetId;
  label: string;
  description: string;
  examplePrompt: string;
}

export const TONE_PRESETS: TonePreset[] = [
  {
    id: "friendly_reassuring",
    label: "Friendly & reassuring",
    description:
      "Warm, calming tone that reduces anxiety for stressed customers and emphasizes that you have everything handled.",
    examplePrompt:
      "Use a friendly, reassuring tone focused on reducing stress for families and explaining the process in simple terms.",
  },
  {
    id: "urgent_but_calm",
    label: "Urgent, but calm",
    description:
      "For last-minute or emergency jobs. Communicates urgency without sounding panicked or salesy.",
    examplePrompt:
      "Use an urgent but calm tone that makes it clear we can move quickly without sounding desperate or pushy.",
  },
  {
    id: "professional_concise",
    label: "Professional & concise",
    description:
      "Ideal for B2B, lenders, title companies, and formal documentation where brevity and clarity matter.",
    examplePrompt:
      "Use a professional, concise tone with minimal fluff. Focus on clarity, compliance, and next steps.",
  },
  {
    id: "warm_expert",
    label: "Warm expert",
    description:
      "Balances authority and empathy. Great for educational content and explaining why HMNP’s approach is different.",
    examplePrompt:
      "Use a warm, expert tone that educates the reader and positions us as the go-to specialists in Houston.",
  },
  {
    id: "direct_problem_solver",
    label: "Direct problem-solver",
    description:
      "Speaks to busy pros who just want their problem fixed quickly with minimal friction or story-telling.",
    examplePrompt:
      "Use a direct, problem-solving tone that focuses on outcomes, speed, and concrete next steps.",
  },
];

export function getTonePreset(id: TonePresetId): TonePreset | undefined {
  return TONE_PRESETS.find((preset) => preset.id === id);
}


