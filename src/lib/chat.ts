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

export async function createConversation(title = 'New Chat'): Promise<ChatConversation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
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
  const { data, error } = await supabase
    .from('messages')
    .insert({ 
      conversation_id: conversationId, 
      role, 
      content, 
      model, 
      pipeline_steps: pipelineSteps,
      image_description: imageDescription,
      image_prompt: imagePrompt
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
