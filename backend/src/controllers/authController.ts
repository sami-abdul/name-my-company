import { Request, Response } from 'express';
import { getUserByEmail } from '../config/supabase';
import { ApiResponse, User } from '../types';

export const getCurrentUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // For Day 1, this is a simplified implementation
    // In Phase 2, this will integrate with Supabase Auth middleware
    const userEmail = req.headers['x-user-email'] as string;

    if (!userEmail) {
      return res.status(401).json({
        status: 'error',
        error: 'User email not provided'
      } as ApiResponse<null>);
    }

    const user = await getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        error: 'User not found'
      } as ApiResponse<null>);
    }

    const response: ApiResponse<User> = {
      status: 'success',
      data: user
    };

    return res.json(response);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to get current user'
    } as ApiResponse<null>);
  }
};
