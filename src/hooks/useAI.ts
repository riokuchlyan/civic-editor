import { useState, useCallback } from 'react';
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

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true, // Allow client-side usage
  });

  const rewrite = useCallback(async (text: string): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file.');
      }

      // Different prompts for happy and sad modes
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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please rewrite this text in a ${mood} tone: "${text}"`
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
      console.error('OpenAI API error:', err);
      
      // Fallback to local transformation
      const fallbackResult = fallbackRewrite(text, mood);
      const errorMessage = err instanceof Error ? err.message : 'OpenAI API failed, using fallback mode';
      setError(`${errorMessage} - Using local fallback.`);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      return fallbackResult;
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

// Fallback function for when OpenAI API is not available
function fallbackRewrite(text: string, mood: 'happy' | 'sad'): string {
  const happyTransformations = {
    'okay': 'absolutely wonderful',
    'fine': 'fantastic',
    'good': 'amazing',
    'great': 'absolutely spectacular',
    'nice': 'incredible',
    'bad': 'challenging but rewarding',
    'difficult': 'exciting challenge',
    'problem': 'opportunity',
    'tired': 'ready for rest and rejuvenation',
    'stressed': 'energized and focused'
  };

  const sadTransformations = {
    'okay': 'disappointing',
    'fine': 'mediocre',
    'good': 'barely acceptable',
    'great': 'overhyped',
    'nice': 'somewhat tolerable',
    'bad': 'terrible',
    'difficult': 'overwhelming',
    'problem': 'insurmountable obstacle',
    'tired': 'utterly exhausted',
    'stressed': 'overwhelmed and anxious'
  };

  let result = text;
  const transformations = mood === 'happy' ? happyTransformations : sadTransformations;

  // Apply word transformations
  Object.entries(transformations).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    result = result.replace(regex, replacement);
  });

  // Add mood-appropriate style enhancements
  if (mood === 'happy') {
    result = result.replace(/\.$/, '!');
    result = result.replace(/\b(I am|I'm)\b/gi, "I'm absolutely");
    if (!result.includes('!') && !result.includes('?')) {
      result += '!';
    }
  } else {
    result = result.replace(/!$/, '.');
    result = result.replace(/\b(I am|I'm)\b/gi, "I find myself");
    if (!result.includes('.') && !result.includes('?')) {
      result += '...';
    }
  }

  return result;
}
