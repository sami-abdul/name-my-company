import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export const generateDomains = async (prompt: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a domain name generator. Generate 5 creative domain names based on the user's prompt. Return only the domain names, one per line, without any additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate domains');
  }
};

export const parseDomainSuggestions = (aiResponse: string): string[] => {
  return aiResponse
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 5); // Ensure we only get 5 domains
};
