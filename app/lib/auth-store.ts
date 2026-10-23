import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type AuthStatus = "loading" 
  | "authenticated" 
  | "unauthenticated"

interface AuthState {
  session: Session | null
  user: User | null
  status: AuthStatus

  setSession: (session: Session | null) => void
  
  signUp: (
    email: string,
    password: string,
  ) => Promise<void>
  
  signIn: (
    email: string, 
    password: string
  ) => Promise<void>

  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: "loading",

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? "authenticated" : "unauthenticated",
    }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // options: {
      //   // 이메일 확인 메일을 보낼 때 돌아올 주소 지정 가능
      //   emailRedirectTo: `${window.location.origin}`,
      // },
    })

    if (error) throw new Error(error.message)

    if (!data.session) { // data.session === null
      console.log("회원가입 성공, 이메일 확인 필요")
      set({ status: "unauthenticated" })
      return
    }

    console.log("회원가입 성공", data.session.user)

    set({ 
      session: data.session, 
      user: data.user, 
      status: "authenticated" 
    })
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw new Error(error.message)

    console.log("로그인 성공", data.session.user)

    set({ 
      session: data.session, 
      user: data.session?.user ?? null, 
      status: "authenticated" 
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    
    set({ 
      session: null, 
      user: null, 
      status: "unauthenticated" 
    })
  },
}))
