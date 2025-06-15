// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client with additional options for better performance and security
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Authentication helper functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Notes related functions
export const createNote = async (
  userId,
  title,
  content,
  spaceId,
  subspaceId = null,
  tags = []
) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        user_id: userId,
        space_id: spaceId,
        subspace_id: subspaceId,
        title,
        content,
        tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select();
  return { data, error };
};

export const getNotes = async (userId, spaceId = null, subspaceId = null) => {
  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (spaceId) {
    query = query.eq('space_id', spaceId);
  }
  if (subspaceId) {
    query = query.eq('subspace_id', subspaceId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const updateNote = async (noteId, updates) => {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select();
  return { data, error };
};

export const deleteNote = async (noteId) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  return { error };
};

// Add Spaces related functions
export const createSpace = async (userId, spaceName, emoji) => {
  const { data, error } = await supabase
    .from('spaces')
    .insert([
      {
        user_id: userId,
        name: spaceName,
        emoji: emoji,
        created_at: new Date().toISOString(),
      },
    ])
    .select();
  return { data, error };
};

export const getSpaces = async (userId) => {
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      subspaces (
        *,
        notes (*)
      ),
      notes (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return { data, error };
};

// Add Subspaces related functions
export const createSubspace = async (userId, spaceId, subspaceName, emoji) => {
  const { data, error } = await supabase
    .from('subspaces')
    .insert([
      {
        user_id: userId,
        space_id: spaceId,
        name: subspaceName,
        emoji: emoji,
        created_at: new Date().toISOString(),
      },
    ])
    .select();
  return { data, error };
};

// User profile functions with additional fields
export const createUserProfile = async (userId, username, avatarUrl = null) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
    ])
    .select();
  return { data, error };
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  return { data, error };
};
