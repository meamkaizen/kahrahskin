export type UserRole = 'seeker' | 'vendor';

export interface WaitlistSubmission {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  skinConcerns?: string[];
  vendorType?: string;
  referralCode: string;
  positionNumber: number;
  createdAt: string;
}

export interface WaitlistStats {
  totalWaitlistCount: number;
  seekerCount: number;
  vendorCount: number;
  betaSpotsRemaining: number;
}

export interface SkinMetric {
  name: string;
  score: number; // 0 to 100
  status: 'optimal' | 'balanced' | 'needs_attention';
  insight: string;
}

export interface SkinDiagnosticResult {
  fitzpatrickScaleEstimate?: string;
  skinTypeSummary: string;
  melaninHealthNote: string;
  metrics: SkinMetric[];
  keyIngredientsToLookFor: string[];
  ingredientsToAvoid: string[];
  recommendedVendorCategories: string[];
  compassionateAdvice: string;
}

export interface CoreValueItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  /** Optional list rendered under the answer, for answers that name several things. */
  bullets?: string[];
  category: 'general' | 'brand' | 'ai' | 'melanin' | 'vendors' | 'privacy';
}

export interface TimelinePhase {
  phase: string;
  title: string;
  timelineLabel: string;
  status: 'current' | 'upcoming' | 'planned';
  description: string;
  deliverables: string[];
}
