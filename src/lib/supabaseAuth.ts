import { supabase } from './supabase';

export interface SupabaseAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}

// Sign up with email and password
export async function signUpWithSupabase(
  email: string,
  password: string,
  name: string
): Promise<SupabaseAuthResult> {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Store name in user metadata
        },
      },
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // The trigger in the database will automatically create the user profile
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name,
      },
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Sign in with email and password
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signin error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to sign in' };
    }

    // Get user profile from database
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', data.user.id)
      .single();

    const name = userData?.name || data.user.email?.split('@')[0] || 'User';

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        name,
      },
    };
  } catch (error) {
    console.error('Signin error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Sign out
export async function signOutFromSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase signout error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Signout error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: unknown) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
