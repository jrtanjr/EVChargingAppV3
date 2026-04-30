import { supabase } from './supabaseClient';

// ================= SIGN UP =================
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // 🔥 CREATE PROFILE AFTER SIGNUP
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
    });
  }

  return data;
};

// ================= LOGIN =================
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
};

// ================= LOGOUT =================
export const logout = async () => {
  await supabase.auth.signOut();
};

// ================= GET USER =================
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};