import { supabase } from '@/integrations/supabase/client';

export async function callAI({ prompt, context }: { prompt: string; context?: string }): Promise<{ response: string; error: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        messages: [{ role: 'user', content: prompt }],
        context,
      },
    });

    if (error) {
      console.error('AI function error:', error);
      return { response: 'AI service temporarily unavailable. Please try again.', error: true };
    }

    return { response: data.response || 'No response generated.', error: data.error || false };
  } catch (e) {
    console.error('AI call failed:', e);
    return { response: 'Failed to connect to AI service.', error: true };
  }
}
