export async function rewriteText(text: string, mood: 'happy' | 'sad'): Promise<string> {
  try {
    const response = await fetch('/api/rewrite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, mood }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to rewrite text');
    }

    const { rewrittenText } = await response.json();
    return rewrittenText;
  } catch (error) {
    console.error('Error rewriting text:', error);
    
    // Fallback to local transformation if API fails
    return fallbackRewrite(text, mood);
  }
}

// Fallback function in case OpenAI API fails
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

  return result + ' (Fallback mode - check your OpenAI API key)';
}