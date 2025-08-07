// Simple in-memory cache for domain availability results (24-hour TTL)
interface DomainCacheEntry {
  isAvailable: boolean;
  timestamp: number;
}

const domainCache = new Map<string, DomainCacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const checkDomainAvailability = async (domainName: string): Promise<boolean> => {
  try {
    // Check cache first
    const cached = domainCache.get(domainName);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`Cache hit for domain: ${domainName}, available: ${cached.isAvailable}`);
      return cached.isAvailable;
    }

    console.log(`Checking availability for domain: ${domainName}`);
    
    // Use Domainr API for real domain availability checking
    const isAvailable = await checkDomainWithDomainr(domainName);
    
    // Cache the result
    domainCache.set(domainName, {
      isAvailable,
      timestamp: Date.now()
    });
    
    return isAvailable;
  } catch (error) {
    console.error('Domain availability check error:', error);
    // Fallback: if API fails, return false (assume not available)
    return false;
  }
};

const checkDomainWithDomainr = async (domainName: string): Promise<boolean> => {
  try {
    const rapidApiKey = process.env['RAPIDAPI_KEY'] || process.env['DOMAINR_API_KEY'];
    
    if (!rapidApiKey) {
      console.warn('No Domainr API key found, using mock implementation');
      // Fallback to mock implementation if no API key
      return Math.random() > 0.3; // 70% chance available for testing
    }

    const response = await fetch(`https://domainr.p.rapidapi.com/v2/status?domain=${encodeURIComponent(domainName)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'domainr.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Domainr API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    // Domainr returns status array with availability info
    if (data.status && data.status.length > 0) {
      const status = data.status[0].status;
      // Domainr statuses: "active" = taken, "inactive" = available, "undelegated" = available
      const isAvailable = status === 'inactive' || status === 'undelegated';
      console.log(`Domainr API result for ${domainName}: ${status} (available: ${isAvailable})`);
      return isAvailable;
    }
    
    // If no clear status, assume not available
    return false;
  } catch (error) {
    console.error(`Domainr API error for ${domainName}:`, error);
    // Fallback: return false if API call fails
    return false;
  }
};

export const validateDomainName = (domainName: string): boolean => {
  // Basic domain name validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domainName);
};
