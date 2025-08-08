export interface Domain {
  id: string;
  name: string;
  extension: string;
  fullDomain: string;
  isAvailable?: boolean;
  isChecking?: boolean;
  price?: number;
  status: 'generated' | 'checked' | 'favorite' | 'purchased';
  createdAt: string;
  category?: string;
  brandingKit?: BrandingKit;
}

export interface GenerationSession {
  id: string;
  prompt: string;
  createdAt: string;
  model: string;
  domains: Domain[];
  userId: string;
  tier: SubscriptionTier;
  businessInfo?: BusinessInfo;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: UserSubscription;
  generationsUsed: number;
  generationsLimit: number;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'cancelled';
  currentPeriodEnd: string;
  features: string[];
}

export type SubscriptionTier = 'free' | 'mid' | 'premium';

export interface TierFeatures {
  tier: SubscriptionTier;
  name: string;
  price: number;
  generationsPerMonth: number;
  features: string[];
  logoGeneration: boolean;
  brandingKit: boolean;
  analytics: boolean;
  prioritySupport: boolean;
}

export interface BusinessInfo {
  industry: string;
  style: string;
  keywords: string[];
  targetAudience: string;
  brandPersonality: string[];
}

export interface BrandingKit {
  id: string;
  domainId: string;
  logo?: LogoDesign;
  colorPalette?: ColorPalette;
  socialHandles?: SocialHandles;
  trademarkRisk?: TrademarkAssessment;
  createdAt: string;
}

export interface LogoDesign {
  id: string;
  variations: LogoVariation[];
  selectedVariation?: string;
}

export interface LogoVariation {
  id: string;
  imageUrl: string;
  style: string;
  colors: string[];
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string[];
  gradients: string[];
}

export interface SocialHandles {
  platforms: SocialPlatform[];
  checkedAt: string;
}

export interface SocialPlatform {
  name: string;
  handle: string;
  available: boolean;
  url?: string;
}

export interface TrademarkAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  conflicts: TrademarkConflict[];
  recommendations: string[];
}

export interface TrademarkConflict {
  trademark: string;
  similarity: number;
  jurisdiction: string;
  status: string;
}

export interface Analytics {
  totalGenerations: number;
  successRate: number;
  favoriteCount: number;
  tierUsage: TierUsage;
  monthlyStats: MonthlyStats[];
  topKeywords: KeywordStat[];
}

export interface TierUsage {
  current: SubscriptionTier;
  generationsUsed: number;
  generationsLimit: number;
  featuresUsed: string[];
}

export interface MonthlyStats {
  month: string;
  generations: number;
  favorites: number;
  brandingKits: number;
}

export interface KeywordStat {
  keyword: string;
  count: number;
  successRate: number;
}

export interface GenerationRequest {
  prompt: string;
  model?: string;
  tier: SubscriptionTier;
  businessInfo?: BusinessInfo;
}

export interface AvailabilityCheck {
  domain: string;
  isAvailable: boolean;
  price?: number;
}
