import { create } from "zustand";
import { supabase } from "../services/supabase";

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true });

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // Ignore not found error initially
          console.error("Error fetching profile:", error);
        }

        set({ user: session.user, profile: profile || null, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }

      // Listen for changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          set({ user: session.user, profile: profile || null, loading: false });
        } else {
          set({ user: null, profile: null, loading: false });
        }
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  signIn: async ({ email, password }) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    return { data };
  },

  signUp: async ({ email, password, fullName, phone, role }) => {
    set({ loading: true, error: null });
    // 1. Sign up auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: role,
        },
      },
    });

    if (authError) {
      set({ error: authError.message, loading: false });
      return { error: authError };
    }

    // 2. We depend on a Supabase Trigger to create the profile usually,
    // but we can optimistic update or handle additional logic here if needed.
    // For now, assume trigger handles public.profiles creation.

    set({ loading: false });
    return { data: authData };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
