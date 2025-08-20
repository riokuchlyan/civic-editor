export async function rewriteText(text: string, mood: 'happy' | 'sad'): Promise<string> {
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
}