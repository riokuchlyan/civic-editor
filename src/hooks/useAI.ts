import { useState, useCallback, useMemo } from 'react';
import { OpenAI } from 'openai';

export interface UseAIOptions {
  mood: 'happy' | 'sad';
  onSuccess?: (result: string) => void;
  onError?: (error: Error) => void;
}

export interface UseAIReturn {
  isProcessing: boolean;
  error: string | null;
  rewrite: (text: string) => Promise<string | null>;
  clearError: () => void;
}

export function useAI({ mood, onSuccess, onError }: UseAIOptions): UseAIReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openai = useMemo(() => new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  }), []);

  const rewrite = useCallback(async (text: string): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file.');
      }
      const systemPrompt = mood === 'happy' 
        ? `You are a creative writing assistant specializing in transforming text to be more positive, uplifting, and joyful. Your task is to rewrite the given text while:
          - Maintaining the core meaning and context
          - Adding enthusiasm, optimism, and cheerfulness
          - Using positive language and upbeat tone
          - Making it sound more inspiring and energetic
          - Adding exclamation points and positive adjectives where appropriate
          
          Always respond with only the rewritten text, no explanations or additional commentary.`
        : `You are a contemplative writing assistant specializing in transforming text to be more introspective, thoughtful, and melancholic. Your task is to rewrite the given text while:
          - Maintaining the core meaning and context
          - Adding depth, reflection, and philosophical undertones
          - Using more contemplative and profound language
          - Making it sound more introspective and somber
          - Adding ellipses and reflective phrases where appropriate
          
          Always respond with only the rewritten text, no explanations or additional commentary.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please rewrite this text in a ${mood} tone: ${text}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const result = completion.choices[0]?.message?.content?.trim() || text;
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OpenAI API failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [mood, onSuccess, onError, openai]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    rewrite,
    clearError,
  };
}
