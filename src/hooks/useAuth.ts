import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import type { User } from '@supabase/supabase-js'

interface MockUser {
  id: string
  email: string
}

interface AuthState {
  user: User | MockUser | null
  loading: boolean
  isAuthenticated: boolean
}

// Simple mock session storage key
const MOCK_SESSION_KEY = 'expertiz_mock_session'

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [user, setUser] = useState<User | MockUser | null>(null)
  const [loading, setLoading] = useState(true)

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(MOCK_SESSION_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check mock session
      const stored = localStorage.getItem(MOCK_SESSION_KEY)
      if (stored) {
        try {
          const mockUser = JSON.parse(stored)
          setUser(mockUser)
        } catch {
          localStorage.removeItem(MOCK_SESSION_KEY)
        }
      }
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  }
}

export function setMockSession(user: MockUser) {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user))
}
