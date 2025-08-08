import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Domain, GenerationSession, User, Analytics, BrandingKit } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced mock data for Phase 2
export const mockDomains: Domain[] = [
  {
    id: '1',
    name: 'techstartup',
    extension: '.com',
    fullDomain: 'techstartup.com',
    isAvailable: true,
    price: 12.99,
    status: 'favorite',
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Technology'
  },
  {
    id: '2',
    name: 'innovateai',
    extension: '.io',
    fullDomain: 'innovateai.io',
    isAvailable: false,
    status: 'checked',
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Technology'
  },
  {
    id: '3',
    name: 'smartsolutions',
    extension: '.net',
    fullDomain: 'smartsolutions.net',
    isAvailable: true,
    price: 15.99,
    status: 'generated',
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Business'
  },
  {
    id: '4',
    name: 'futuretech',
    extension: '.co',
    fullDomain: 'futuretech.co',
    isAvailable: true,
    price: 25.99,
    status: 'favorite',
    createdAt: '2024-01-14T15:45:00Z',
    category: 'Technology'
  },
  {
    id: '5',
    name: 'digitalventure',
    extension: '.com',
    fullDomain: 'digitalventure.com',
    isAvailable: false,
    status: 'checked',
    createdAt: '2024-01-14T15:45:00Z',
    category: 'Business'
  }
];

export const mockGenerationHistory: GenerationSession[] = [
  {
    id: '1',
    prompt: 'AI-powered fitness tracking app',
    createdAt: '2024-01-15T10:30:00Z',
    model: 'gpt-4',
    userId: 'user1',
    tier: 'premium',
    domains: mockDomains.slice(0, 3),
    businessInfo: {
      industry: 'Technology',
      style: 'Modern',
      keywords: ['AI', 'fitness', 'tracking'],
      targetAudience: 'Health-conscious professionals',
      brandPersonality: ['Innovative', 'Trustworthy', 'Dynamic']
    }
  },
  {
    id: '2',
    prompt: 'Sustainable fashion e-commerce platform',
    createdAt: '2024-01-14T15:45:00Z',
    model: 'gpt-4',
    userId: 'user1',
    tier: 'mid',
    domains: [
      {
        id: '6',
        name: 'ecofashion',
        extension: '.com',
        fullDomain: 'ecofashion.com',
        isAvailable: true,
        price: 18.99,
        status: 'favorite',
        createdAt: '2024-01-14T15:45:00Z',
        category: 'Fashion'
      },
      {
        id: '7',
        name: 'sustainablestyle',
        extension: '.shop',
        fullDomain: 'sustainablestyle.shop',
        isAvailable: true,
        price: 22.99,
        status: 'generated',
        createdAt: '2024-01-14T15:45:00Z',
        category: 'Fashion'
      }
    ],
    businessInfo: {
      industry: 'Fashion',
      style: 'Elegant',
      keywords: ['sustainable', 'fashion', 'eco'],
      targetAudience: 'Environmentally conscious consumers',
      brandPersonality: ['Trustworthy', 'Creative', 'Sophisticated']
    }
  }
];

export const mockUser: User = {
  id: 'user1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar: '/diverse-user-avatars.png',
  subscription: {
    tier: 'premium',
    status: 'active',
    currentPeriodEnd: '2024-02-15T00:00:00Z',
    features: [
      'Unlimited generations',
      'Logo generation',
      'Complete branding kit',
      'Advanced analytics',
      'Priority support'
    ]
  },
  generationsUsed: 23,
  generationsLimit: 200
};

export const mockAnalytics: Analytics = {
  totalGenerations: 47,
  successRate: 78.5,
  favoriteCount: 12,
  tierUsage: {
    current: 'premium',
    generationsUsed: 23,
    generationsLimit: 200,
    featuresUsed: ['logo_generation', 'branding_kit', 'analytics']
  },
  monthlyStats: [
    { month: 'Dec 2023', generations: 15, favorites: 4, brandingKits: 2 },
    { month: 'Jan 2024', generations: 32, favorites: 8, brandingKits: 5 }
  ],
  topKeywords: [
    { keyword: 'AI', count: 8, successRate: 85.2 },
    { keyword: 'tech', count: 6, successRate: 72.1 },
    { keyword: 'app', count: 5, successRate: 90.0 }
  ]
};

export const mockBrandingKit: BrandingKit = {
  id: 'brand1',
  domainId: '1',
  logo: {
    id: 'logo1',
    variations: [
      {
        id: 'var1',
        imageUrl: '/placeholder.svg?height=100&width=200&text=Logo+1',
        style: 'Modern',
        colors: ['#3B82F6', '#1E40AF']
      },
      {
        id: 'var2',
        imageUrl: '/placeholder.svg?height=100&width=200&text=Logo+2',
        style: 'Minimalist',
        colors: ['#10B981', '#059669']
      }
    ],
    selectedVariation: 'var1'
  },
  colorPalette: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B',
    neutral: ['#F9FAFB', '#6B7280', '#374151'],
    gradients: ['linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)']
  },
  socialHandles: {
    platforms: [
      { name: 'Twitter', handle: '@techstartup', available: true },
      { name: 'Instagram', handle: '@techstartup', available: false },
      { name: 'Facebook', handle: 'techstartup', available: true }
    ],
    checkedAt: '2024-01-15T10:30:00Z'
  },
  trademarkRisk: {
    riskLevel: 'low',
    conflicts: [],
    recommendations: [
      'Consider registering trademark in key markets',
      'Monitor for similar domain registrations'
    ]
  },
  createdAt: '2024-01-15T10:30:00Z'
};

// Utility functions
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'free':
      return 'text-gray-600 bg-gray-100';
    case 'mid':
      return 'text-blue-600 bg-blue-100';
    case 'premium':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'text-green-600 bg-green-100';
    case 'taken':
      return 'text-red-600 bg-red-100';
    case 'favorite':
      return 'text-yellow-600 bg-yellow-100';
    case 'purchased':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Add this export at the end of the file
// Re-export extension list from constants to keep a single source of truth
export { DOMAIN_EXTENSIONS } from '@/lib/constants';
