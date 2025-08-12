import { Request, Response } from "express";
import { getUserByEmail, createUser } from "../config/supabase";
import { ApiResponse, User } from "../types";
import { supabaseAuth } from "../config/supabase";

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    // Get user from authentication middleware
    const authUser = (req as any).user;

    if (!authUser) {
      return res.status(401).json({
        status: "error",
        error: "User not authenticated",
      } as ApiResponse<null>);
    }

    // Try to get user from our database
    let user = await getUserByEmail(authUser.email);

    // If user doesn't exist in our database, create them
    if (!user) {
      try {
        user = await createUser(
          authUser.email,
          authUser.user_metadata?.name || authUser.email
        );
      } catch (createError) {
        console.error("Failed to create user in database:", createError);
        return res.status(500).json({
          status: "error",
          error: "Failed to initialize user account",
        } as ApiResponse<null>);
      }
    }

    const response: ApiResponse<User & { auth_id: string }> = {
      status: "success",
      data: {
        ...user,
        auth_id: authUser.id,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      status: "error",
      error: "Failed to get current user",
    } as ApiResponse<null>);
  }
};

// User registration endpoint
export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        error: "Email and password are required",
      } as ApiResponse<null>);
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
          },
        },
      }
    );

    if (authError) {
      return res.status(400).json({
        status: "error",
        error: authError.message,
      } as ApiResponse<null>);
    }

    if (!authData.user) {
      return res.status(500).json({
        status: "error",
        error: "Failed to create user account",
      } as ApiResponse<null>);
    }

    // Create user in our database
    try {
      await createUser(email, name || email.split("@")[0]);
    } catch (dbError) {
      console.error("Failed to create user in database:", dbError);
      // Continue even if database creation fails (user can be created later)
    }

    const response: ApiResponse<{
      user: any;
      session: any;
      message: string;
    }> = {
      status: "success",
      data: {
        user: authData.user,
        session: authData.session,
        message: "User registered successfully",
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("User registration error:", error);
    return res.status(500).json({
      status: "error",
      error: "Failed to register user",
    } as ApiResponse<null>);
  }
};

// User login endpoint
export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        error: "Email and password are required",
      } as ApiResponse<null>);
    }

    // Sign in user with Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({
        status: "error",
        error: authError.message,
      } as ApiResponse<null>);
    }

    if (!authData.user || !authData.session) {
      return res.status(500).json({
        status: "error",
        error: "Failed to authenticate user",
      } as ApiResponse<null>);
    }

    // Get or create user in our database
    let user = await getUserByEmail(email);
    if (!user) {
      try {
        user = await createUser(
          email,
          authData.user.user_metadata?.["name"] || email.split("@")[0]
        );
      } catch (dbError) {
        console.error("Failed to create user in database:", dbError);
        // Continue even if database creation fails
      }
    }

    const response: ApiResponse<{
      user: any;
      session: any;
      message: string;
    }> = {
      status: "success",
      data: {
        user: authData.user,
        session: authData.session,
        message: "User logged in successfully",
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("User login error:", error);
    return res.status(500).json({
      status: "error",
      error: "Failed to authenticate user",
    } as ApiResponse<null>);
  }
};

// User logout endpoint
export const logoutUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        error: "Authorization header required",
      } as ApiResponse<null>);
    }

    // Sign out user with Supabase Auth
    const { error } = await supabaseAuth.auth.signOut();

    if (error) {
      return res.status(500).json({
        status: "error",
        error: error.message,
      } as ApiResponse<null>);
    }

    const response: ApiResponse<{ message: string }> = {
      status: "success",
      data: {
        message: "User logged out successfully",
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("User logout error:", error);
    return res.status(500).json({
      status: "error",
      error: "Failed to logout user",
    } as ApiResponse<null>);
  }
};

// Refresh token endpoint
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        status: "error",
        error: "Refresh token is required",
      } as ApiResponse<null>);
    }

    // Refresh session with Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAuth.auth.refreshSession({
        refresh_token,
      });

    if (authError) {
      return res.status(401).json({
        status: "error",
        error: authError.message,
      } as ApiResponse<null>);
    }

    if (!authData.session) {
      return res.status(401).json({
        status: "error",
        error: "Failed to refresh session",
      } as ApiResponse<null>);
    }

    const response: ApiResponse<{
      session: any;
      message: string;
    }> = {
      status: "success",
      data: {
        session: authData.session,
        message: "Token refreshed successfully",
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      status: "error",
      error: "Failed to refresh token",
    } as ApiResponse<null>);
  }
};
