import { supabase, isSupabaseConfigured } from './supabase'

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    // Mock login for demo purposes
    if (email === 'demo@ekspertiz.com' && password === 'demo1234') {
      return { 
        data: { 
          user: { id: 'mock-user-id', email },
          session: { access_token: 'mock-token' }
        }, 
        error: null 
      }
    }
    return { data: null, error: { message: 'Geçersiz e-posta veya şifre' } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return { error: null }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return null
  }
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return null
  }
  const { data } = await supabase.auth.getUser()
  return data.user
}
