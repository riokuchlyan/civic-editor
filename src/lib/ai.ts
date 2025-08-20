export async function rewriteText(text: string, mood: 'happy' | 'sad'): Promise<string> {
  // Simulate API delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // For demo purposes - replace with actual AI API call
  const happyTransformations = {
    'okay': 'absolutely wonderful',
    'fine': 'fantastic',
    'good': 'amazing',
    'great': 'absolutely spectacular',
    'nice': 'incredible',
    'pretty': 'absolutely stunning',
    'weather': 'beautiful weather',
    'day': 'spectacular day',
    'time': 'wonderful time',
    'morning': 'glorious morning',
    'evening': 'magical evening',
    'work': 'fulfilling work',
    'job': 'dream job',
    'bad': 'challenging but rewarding',
    'difficult': 'exciting challenge',
    'hard': 'inspiring journey',
    'problem': 'opportunity',
    'issue': 'growth opportunity',
    'tired': 'ready for rest and rejuvenation',
    'stressed': 'energized and focused',
    'busy': 'productively engaged'
  };

  const sadTransformations = {
    'okay': 'disappointing',
    'fine': 'mediocre',
    'good': 'barely acceptable',
    'great': 'overhyped',
    'nice': 'somewhat tolerable',
    'pretty': 'unremarkably ordinary',
    'weather': 'dreary weather',
    'day': 'gloomy day',
    'time': 'difficult time',
    'morning': 'bleak morning',
    'evening': 'lonely evening',
    'work': 'burdensome work',
    'job': 'soul-crushing job',
    'bad': 'terrible',
    'difficult': 'overwhelming',
    'hard': 'impossibly challenging',
    'problem': 'insurmountable obstacle',
    'issue': 'devastating complication',
    'tired': 'utterly exhausted',
    'stressed': 'overwhelmed and anxious',
    'busy': 'frantically overloaded'
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
    // Make it more enthusiastic
    result = result.replace(/\.$/, '!');
    result = result.replace(/\b(I am|I'm)\b/gi, "I'm absolutely");
    result = result.replace(/\b(feel|feeling)\b/gi, "feeling wonderfully");
    if (!result.includes('!') && !result.includes('?')) {
      result += '!';
    }
  } else {
    // Make it more contemplative and melancholic
    result = result.replace(/!$/, '.');
    result = result.replace(/\b(I am|I'm)\b/gi, "I find myself");
    result = result.replace(/\b(feel|feeling)\b/gi, "feeling deeply");
    result = result.replace(/\b(think|thinking)\b/gi, "contemplating");
    if (!result.includes('.') && !result.includes('?')) {
      result += '...';
    }
  }

  return result;
}