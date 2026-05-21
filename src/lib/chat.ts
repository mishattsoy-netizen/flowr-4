import { supabase } from '@/lib/supabase';

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  pipeline_steps?: any;
  image_description?: string;
  image_prompt?: string;
  created_at: string;
}

export async function fetchConversations(): Promise<ChatConversation[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('[ChatLib] fetchConversations error:', error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error('[ChatLib] fetchConversations exception:', err);
    return [];
  }
}

export async function createConversation(title = 'New Chat'): Promise<ChatConversation | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase.from('conversations').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model?: string,
  pipelineSteps?: any,
  imageDescription?: string,
  imagePrompt?: string
): Promise<ChatMessage> {
  const insertPayload: Record<string, any> = {
    conversation_id: conversationId,
    role,
    content,
    model,
  };
  // Only include extra columns if the table has them (graceful fallback)
  if (pipelineSteps !== undefined) insertPayload.pipeline_steps = pipelineSteps;
  if (imageDescription !== undefined) insertPayload.image_description = imageDescription;
  if (imagePrompt !== undefined) insertPayload.image_prompt = imagePrompt;

  const { data, error } = await supabase
    .from('messages')
    .insert(insertPayload)
    .select()
    .single();
  if (error) {
    // If column doesn't exist error, retry with only guaranteed columns
    if (error.message?.includes('column') || error.code === 'PGRST204') {
      const fallbackPayload = {
        conversation_id: conversationId,
        role,
        content,
        model,
      };
      const { data: retryData, error: retryError } = await supabase
        .from('messages')
        .insert(fallbackPayload)
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  }
  return data;
}
