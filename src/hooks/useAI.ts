import { useState, useCallback } from 'react';
import { rewriteText } from '../lib/ai';

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

  const rewrite = useCallback(async (text: string): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await rewriteText(text, mood);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [mood, onSuccess, onError]);

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
