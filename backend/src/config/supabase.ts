import { createClient } from "@supabase/supabase-js";
import prisma from "./prisma";

const supabaseUrl = process.env["SUPABASE_URL"];
if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

// Client for user authentication (uses anon key)
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"];
if (!supabaseAnonKey) {
  throw new Error("Missing SUPABASE_ANON_KEY environment variable");
}

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Enhanced database operations with better error handling and retry logic

// Input validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validateString = (str: string, maxLength: number = 255): boolean => {
  return (
    typeof str === "string" && str.trim().length > 0 && str.length <= maxLength
  );
};

export const createUser = async (email: string, name: string) => {
  try {
    // Validate inputs before database operation
    if (!validateEmail(email)) {
      throw new Error("Invalid email format or length");
    }

    if (!validateString(name, 255)) {
      throw new Error("Invalid name format or length");
    }
    const created = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), name: name.trim() },
    });
    return {
      ...created,
      created_at: created.createdAt as unknown as string,
    } as any;
  } catch (error) {
    console.error(
      "Error in createUser:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
};

export const createGenerationSession = async (
  userId: string,
  prompt: string,
  modelUsed: string = "gpt-4o-mini"
) => {
  try {
    // Validate inputs
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid user ID");
    }

    if (!validateString(prompt, 500)) {
      throw new Error("Invalid prompt format or length (max 500 characters)");
    }

    if (!validateString(modelUsed, 100)) {
      throw new Error("Invalid model name");
    }
    const created = await prisma.generationSession.create({
      data: {
        userId: userId.trim(),
        prompt: prompt.trim(),
        modelUsed: modelUsed.trim(),
      },
    });
    // Provide backward-compatible shape with snake_case aliases
    return {
      ...created,
      user_id: created.userId,
      model_used: created.modelUsed,
      created_at: created.createdAt,
    } as any;
  } catch (error) {
    console.error(
      "Error in createGenerationSession:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
};

export const saveDomainSuggestions = async (
  sessionId: string,
  domains: string[]
) => {
  try {
    // Validate inputs
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Invalid session ID");
    }

    if (!Array.isArray(domains) || domains.length === 0) {
      throw new Error("Invalid domains array");
    }

    // Validate each domain
    const validDomains = domains.filter((domain) => {
      if (typeof domain !== "string" || domain.trim().length === 0) {
        return false;
      }
      // Basic domain validation - alphanumeric, hyphens, dots only
      const domainRegex = /^[a-zA-Z0-9.-]+$/;
      return domainRegex.test(domain) && domain.length <= 255;
    });

    if (validDomains.length === 0) {
      throw new Error("No valid domains provided");
    }
    const created = await prisma.domainSuggestion.createMany({
      data: validDomains.map((domain) => ({
        sessionId: sessionId.trim(),
        domainName: domain.trim().toLowerCase(),
      })),
    });
    // Return inserted items count to keep behavior similar (array previously)
    return created;
  } catch (error) {
    console.error(
      "Error in saveDomainSuggestions:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
};

export const updateDomainAvailability = async (
  domainName: string,
  isAvailable: boolean
) => {
  try {
    const result = await prisma.domainSuggestion.updateMany({
      where: { domainName: domainName },
      data: {
        isAvailable: isAvailable,
        checkedAt: new Date(),
      },
    });
    return result;
  } catch (error) {
    console.error("Error in updateDomainAvailability:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    // Validate email input
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return user
      ? ({
          ...user,
          created_at: user.createdAt as unknown as string,
        } as any)
      : null;
  } catch (error) {
    console.error(
      "Error in getUserByEmail:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
};

export const getUserSessions = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
) => {
  try {
    // Validate inputs
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid user ID");
    }

    if (limit < 1 || limit > 50) {
      throw new Error("Limit must be between 1 and 50");
    }

    if (offset < 0) {
      throw new Error("Offset must be non-negative");
    }
    const sessions = await prisma.generationSession.findMany({
      where: { userId: userId.trim() },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { domainSuggestions: true },
    });
    // Map to backward-compatible shape with snake_case and nested relation alias
    const mapped = sessions.map((s) => ({
      ...s,
      user_id: s.userId,
      model_used: s.modelUsed,
      created_at: s.createdAt,
      domain_suggestions: s.domainSuggestions.map((d) => ({
        ...d,
        session_id: d.sessionId,
        domain_name: d.domainName,
        is_available: d.isAvailable,
        checked_at: d.checkedAt,
        created_at: d.createdAt,
      })),
    }));
    return mapped as any;
  } catch (error) {
    console.error(
      "Error in getUserSessions:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
};

// Health check for database connection
export const checkDatabaseConnection = async () => {
  try {
    await prisma.user.count({ take: 1 });
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
};

export const deleteUserByEmail = async (email: string) => {
  try {
    const deleted = await prisma.user.delete({
      where: { email: email.toLowerCase().trim() },
    });
    return deleted;
  } catch (error) {
    // Ignore if not found
    return null;
  }
};
