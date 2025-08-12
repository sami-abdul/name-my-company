import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Initialize Groq client for LLaMA models (if API key is provided)
let groqClient: any = null;

// Initialize Groq client asynchronously
const initializeGroqClient = async () => {
  if (process.env["GROQ_API_KEY"] && !groqClient) {
    try {
      // Use dynamic ES6 import instead of require
      const { default: Groq } = await import("groq-sdk");
      groqClient = new Groq({
        apiKey: process.env["GROQ_API_KEY"],
      });
      console.log("Groq client initialized successfully");
    } catch (error) {
      console.warn(
        "Groq SDK not available, falling back to OpenAI only:",
        error
      );
    }
  }
};

export type AIModel = "gpt-4o-mini" | "gpt-4o" | "llama-3-70b" | "llama-3-8b";

// Enhanced prompt engineering for better domain suggestions
const createSystemPrompt = (businessType?: string, style?: string): string => {
  const basePrompt = `You are an expert domain name generator specializing in creating brandable, memorable, and available domain names for businesses. 

GUIDELINES:
1. Generate exactly 5 domain names without the .com extension
2. Focus on brandable names (not generic/descriptive)
3. Keep names short (5-12 characters ideal)
4. Make names easy to pronounce and spell
5. Avoid hyphens, numbers, and confusing spellings
6. Consider trademark-friendly options
7. Think about modern naming trends (portmanteau, invented words, etc.)

RESPONSE FORMAT:
Return only the domain names, one per line, with no additional text, explanations, or formatting.`;

  if (businessType || style) {
    return (
      basePrompt +
      `\n\nCONTEXT:\n${businessType ? `Business Type: ${businessType}` : ""}${
        style ? `\nStyle Preference: ${style}` : ""
      }`
    );
  }

  return basePrompt;
};

const createUserPrompt = (
  prompt: string,
  businessType?: string,
  keywords?: string[]
): string => {
  let enhancedPrompt = `Business concept: ${prompt}`;

  if (businessType) {
    enhancedPrompt += `\nIndustry: ${businessType}`;
  }

  if (keywords && keywords.length > 0) {
    enhancedPrompt += `\nKeywords to consider: ${keywords.join(", ")}`;
  }

  return enhancedPrompt;
};

export const generateDomains = async (
  prompt: string,
  options: {
    model?: AIModel;
    businessType?: string;
    style?: string;
    keywords?: string[];
  } = {}
): Promise<string> => {
  const { model = "gpt-4o-mini", businessType, style, keywords } = options;

  try {
    const hasOpenAIKey = !!process.env["OPENAI_API_KEY"];
    const hasGroqKey = !!process.env["GROQ_API_KEY"];
    // Validate at least one provider is configured
    if (!hasOpenAIKey && !hasGroqKey) {
      throw new Error("No AI provider configured");
    }

    const systemPrompt = createSystemPrompt(businessType, style);
    const userPrompt = createUserPrompt(prompt, businessType, keywords);

    console.log(`Generating domains with model: ${model}`);

    if (model.startsWith("llama")) {
      // Try to initialize Groq client if not already done
      if (!groqClient) {
        await initializeGroqClient();
      }

      // Use Groq if available, otherwise fall back to OpenAI
      if (groqClient) {
        return await generateWithGroq(model, systemPrompt, userPrompt);
      } else {
        console.warn(
          `Groq not available for ${model}, falling back to GPT-4o-mini`
        );
        if (!hasOpenAIKey) {
          throw new Error("AI service configuration error");
        }
        return await generateWithOpenAI(
          "gpt-4o-mini",
          systemPrompt,
          userPrompt
        );
      }
    } else {
      try {
        if (!hasOpenAIKey) {
          throw new Error("OpenAI API key is not configured");
        }
        return await generateWithOpenAI(model, systemPrompt, userPrompt);
      } catch (err) {
        // Graceful fallback to Groq for free/mid paths when OpenAI fails and Groq is available
        if (hasGroqKey) {
          try {
            if (!groqClient) {
              await initializeGroqClient();
            }
            if (groqClient) {
              console.warn(
                "OpenAI generation failed. Falling back to Groq (llama-3-8b)."
              );
              return await generateWithGroq(
                "llama-3-8b",
                systemPrompt,
                userPrompt
              );
            }
          } catch (fallbackErr) {
            console.error("Groq fallback failed:", fallbackErr);
          }
        }
        throw err instanceof Error ? err : new Error("AI generation failed");
      }
    }
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate domains");
  }
};

const generateWithOpenAI = async (
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> => {
  const openaiModel = model === "gpt-4o" ? "gpt-4o" : "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model: openaiModel,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
    top_p: 0.9,
    frequency_penalty: 0.5, // Encourage diversity
    presence_penalty: 0.3,
  });

  return completion.choices?.[0]?.message?.content || "";
};

const generateWithGroq = async (
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> => {
  if (!groqClient) {
    throw new Error("Groq client not initialized");
  }

  const groqModel =
    model === "llama-3-70b" ? "llama3-70b-8192" : "llama3-8b-8192";

  const completion = await groqClient.chat.completions.create({
    model: groqModel,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
    top_p: 0.9,
  });

  return completion.choices?.[0]?.message?.content || "";
};

// Get the most cost-effective model for a given tier
export const getModelForTier = (tier: "free" | "mid" | "premium"): AIModel => {
  const hasGroqKey = !!process.env["GROQ_API_KEY"];
  switch (tier) {
    case "free":
      // Prefer Groq/LLaMA for cost optimization if key is configured
      return hasGroqKey ? "llama-3-8b" : "gpt-4o-mini";
    case "mid":
      return "gpt-4o-mini"; // Good quality, low cost
    case "premium":
      return "gpt-4o"; // Best quality
    default:
      return "gpt-4o-mini";
  }
};

export const parseDomainSuggestions = (aiResponse: string): string[] => {
  return aiResponse
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 5); // Ensure we only get 5 domains
};
