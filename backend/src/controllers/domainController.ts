import { Request, Response } from 'express';
import { generateDomains, parseDomainSuggestions } from '../services/aiService';
import { checkDomainAvailability, validateDomainName } from '../services/domainService';
import { createGenerationSession } from '../config/supabase';
import { ApiResponse, GenerateDomainsRequest, CheckAvailabilityRequest } from '../types';

export const generateDomainSuggestions = async (req: Request, res: Response) => {
  try {
    const { prompt, user_id }: GenerateDomainsRequest = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'Prompt is required'
      } as ApiResponse<null>);
    }

    // Generate domains using AI
    const aiResponse = await generateDomains(prompt);
    const domainSuggestions = parseDomainSuggestions(aiResponse);

    // Create generation session if user_id is provided
    let sessionId: string | undefined;
    if (user_id) {
      const session = await createGenerationSession(user_id, prompt);
      sessionId = session.id;
    }

    const response: ApiResponse<{
      domains: string[];
      session_id?: string;
    }> = {
      status: 'success',
      data: {
        domains: domainSuggestions,
        session_id: sessionId
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Domain generation error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to generate domain suggestions'
    } as ApiResponse<null>);
  }
};

export const checkDomainAvailability = async (req: Request, res: Response) => {
  try {
    const { domain_name }: CheckAvailabilityRequest = req.body;

    if (!domain_name || !validateDomainName(domain_name)) {
      return res.status(400).json({
        status: 'error',
        error: 'Valid domain name is required'
      } as ApiResponse<null>);
    }

    const isAvailable = await checkDomainAvailability(domain_name);

    const response: ApiResponse<{
      domain_name: string;
      is_available: boolean;
    }> = {
      status: 'success',
      data: {
        domain_name,
        is_available: isAvailable
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Domain availability check error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to check domain availability'
    } as ApiResponse<null>);
  }
};
