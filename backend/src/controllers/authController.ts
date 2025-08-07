import { Request, Response } from 'express';
import { getUserByEmail, createUser } from '../config/supabase';
import { ApiResponse, User } from '../types';

export const getCurrentUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // Get user from authentication middleware
    const authUser = (req as any).user;
    
    if (!authUser) {
      return res.status(401).json({
        status: 'error',
        error: 'User not authenticated'
      } as ApiResponse<null>);
    }

    // Try to get user from our database
    let user = await getUserByEmail(authUser.email);

    // If user doesn't exist in our database, create them
    if (!user) {
      try {
        user = await createUser(authUser.email, authUser.user_metadata?.name || authUser.email);
      } catch (createError) {
        console.error('Failed to create user in database:', createError);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to initialize user account'
        } as ApiResponse<null>);
      }
    }

    const response: ApiResponse<User & { auth_id: string }> = {
      status: 'success',
      data: {
        ...user,
        auth_id: authUser.id
      }
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
