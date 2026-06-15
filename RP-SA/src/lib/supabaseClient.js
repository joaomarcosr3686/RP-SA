import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cliente unico e compartilhado em toda a aplicacao.
// Manter uma unica instancia evita conflitos de sessao/estado de autenticacao
// entre componentes (que era uma das causas do bug de "login por cima do outro").
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
