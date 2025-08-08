import type { TierFeatures } from "@/types";

export const SUBSCRIPTION_TIERS: TierFeatures[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    generationsPerMonth: 5,
    features: [
      '5 domain generations per month',
      'Basic domain suggestions',
      'Domain availability checking',
      'Basic history tracking'
    ],
    logoGeneration: false,
    brandingKit: false,
    analytics: false,
    prioritySupport: false
  },
  {
    tier: 'mid',
    name: 'Mid',
    price: 5,
    generationsPerMonth: 50,
    features: [
      '50 domain generations per month',
      'Advanced domain suggestions',
      'Logo generation (3 variations)',
      'Basic branding kit',
      'Social media handle checking',
      'Basic analytics',
      'Priority email support'
    ],
    logoGeneration: true,
    brandingKit: true,
    analytics: true,
    prioritySupport: false
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: 10,
    generationsPerMonth: 200,
    features: [
      'Unlimited domain generations',
      'Premium domain suggestions',
      'Logo generation (10 variations)',
      'Complete branding kit',
      'Trademark risk assessment',
      'Advanced analytics & insights',
      'Priority chat support',
      'Export capabilities',
      'Bulk operations'
    ],
    logoGeneration: true,
    brandingKit: true,
    analytics: true,
    prioritySupport: true
  }
];

export const BUSINESS_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Real Estate',
  'Food & Beverage',
  'Fashion',
  'Travel',
  'Entertainment',
  'Consulting',
  'Manufacturing',
  'Other'
];

export const BRAND_STYLES = [
  'Modern',
  'Classic',
  'Minimalist',
  'Bold',
  'Elegant',
  'Playful',
  'Professional',
  'Creative',
  'Luxury',
  'Casual'
];

export const BRAND_PERSONALITIES = [
  'Innovative',
  'Trustworthy',
  'Friendly',
  'Professional',
  'Creative',
  'Reliable',
  'Dynamic',
  'Sophisticated',
  'Approachable',
  'Expert'
];

export const SOCIAL_PLATFORMS = [
  'Twitter',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'TikTok',
  'YouTube',
  'Pinterest',
  'Snapchat'
];

export const DOMAIN_EXTENSIONS = [
  '.com',
  '.net',
  '.org',
  '.io',
  '.co',
  '.ai',
  '.app',
  '.dev',
  '.tech',
  '.online',
  '.store',
  '.shop'
];
