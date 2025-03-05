
/**
 * Client for making API requests to DeepSeek
 */
export async function callDeepseekAPI(systemPrompt: string, userPrompt: string): Promise<any> {
  console.log("[DeepSeek] Sending request with prompts:", {
    systemPromptLength: systemPrompt.length,
    userPromptLength: userPrompt.length,
    model: 'deepseek-chat'
  });

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 1.0,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[DeepSeek] API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[DeepSeek] Raw API response received');
  return data;
}
