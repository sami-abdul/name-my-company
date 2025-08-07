import { Request, Response } from 'express';
import { generateDomains, parseDomainSuggestions, getModelForTier, AIModel } from '../services/aiService';
import { checkDomainAvailability as checkDomainService, validateDomainName } from '../services/domainService';
import { createGenerationSession, saveDomainSuggestions, getUserByEmail, getUserSessions } from '../config/supabase';
import { ApiResponse, CheckAvailabilityRequest } from '../types';

export const generateDomainSuggestions = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { 
      prompt, 
      user_id, 
      business_type, 
      style, 
      keywords, 
      model,
      tier = 'free' 
    } = req.body;

    console.log('Generating domains for prompt:', prompt);

    // Select appropriate AI model based on tier or user preference
    const selectedModel: AIModel = model || getModelForTier(tier);
    
    // Generate domains using enhanced AI service
    const aiResponse = await generateDomains(prompt, {
      model: selectedModel,
      businessType: business_type,
      style,
      keywords
    });
    
    const domainSuggestions = parseDomainSuggestions(aiResponse);

    if (domainSuggestions.length === 0) {
      return res.status(500).json({
        status: 'error',
        error: 'Failed to generate valid domain suggestions'
      } as ApiResponse<null>);
    }

    // Create generation session and save suggestions if user_id is provided
    let sessionId: string | undefined;
    if (user_id) {
      try {
        const session = await createGenerationSession(user_id, prompt, selectedModel);
        sessionId = session.id;
        
        // Save domain suggestions to database
        await saveDomainSuggestions(session.id, domainSuggestions);
        console.log(`Saved ${domainSuggestions.length} domain suggestions for session ${sessionId}`);
      } catch (dbError) {
        console.error('Database error during generation:', dbError);
        // Continue with response even if database save fails
      }
    }

    const response: ApiResponse<{
      domains: string[];
      session_id?: string;
      model_used: string;
      generated_at: string;
    }> = {
      status: 'success',
      data: {
        domains: domainSuggestions,
        model_used: selectedModel,
        generated_at: new Date().toISOString(),
        ...(sessionId && { session_id: sessionId })
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Domain generation error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate domain suggestions';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'AI service rate limit exceeded. Please try again later.';
      }
    }
    
    return res.status(500).json({
      status: 'error',
      error: errorMessage
    } as ApiResponse<null>);
  }
};

export const checkDomainAvailabilityController = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { domain_name }: CheckAvailabilityRequest = req.body;

    console.log('Checking availability for domain:', domain_name);

    const isAvailable = await checkDomainService(domain_name);

    const response: ApiResponse<{
      domain_name: string;
      is_available: boolean;
      checked_at: string;
    }> = {
      status: 'success',
      data: {
        domain_name,
        is_available: isAvailable,
        checked_at: new Date().toISOString()
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Domain availability check error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to check domain availability'
    } as ApiResponse<null>);
  }
};

export const getUserGenerationHistory = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const authUser = (req as any).user;
    const limit = Math.min(parseInt(req.query['limit'] as string) || 10, 50); // Cap at 50
    const offset = parseInt(req.query['offset'] as string) || 0;

    if (!authUser) {
      return res.status(401).json({
        status: 'error',
        error: 'User not authenticated'
      } as ApiResponse<null>);
    }

    // Get user by email from authenticated user
    const user = await getUserByEmail(authUser.email);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        error: 'User not found in database'
      } as ApiResponse<null>);
    }

    // Get user's generation sessions with domain suggestions
    const sessions = await getUserSessions(user.id, limit, offset);

    // Calculate some basic stats
    const totalSessions = sessions.length;
    const totalDomains = sessions.reduce((sum, session) => 
      sum + (session.domain_suggestions?.length || 0), 0
    );

    const response: ApiResponse<{
      sessions: typeof sessions;
      pagination: {
        limit: number;
        offset: number;
        total_sessions: number;
        total_domains: number;
      };
    }> = {
      status: 'success',
      data: {
        sessions,
        pagination: {
          limit,
          offset,
          total_sessions: totalSessions,
          total_domains: totalDomains
        }
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Get user history error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to retrieve generation history'
    } as ApiResponse<null>);
  }
};

export const batchCheckDomainAvailability = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { domains }: { domains: string[] } = req.body;

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'Domains array is required and must not be empty'
      } as ApiResponse<null>);
    }

    if (domains.length > 10) {
      return res.status(400).json({
        status: 'error',
        error: 'Maximum 10 domains can be checked at once'
      } as ApiResponse<null>);
    }

    // Validate all domain names
    const invalidDomains = domains.filter(domain => !validateDomainName(domain));
    if (invalidDomains.length > 0) {
      return res.status(400).json({
        status: 'error',
        error: `Invalid domain names: ${invalidDomains.join(', ')}`
      } as ApiResponse<null>);
    }

    console.log('Batch checking availability for domains:', domains);

    // Check availability for all domains
    const results = await Promise.allSettled(
      domains.map(async (domain) => ({
        domain_name: domain,
        is_available: await checkDomainService(domain),
        checked_at: new Date().toISOString()
      }))
    );

    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const response: ApiResponse<typeof successfulResults> = {
      status: 'success',
      data: successfulResults
    };

    return res.json(response);
  } catch (error) {
    console.error('Batch domain availability check error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to check domain availability'
    } as ApiResponse<null>);
  }
};
