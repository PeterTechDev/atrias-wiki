import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://janxtcbtksxrbghuoogd.supabase.co'
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rqA3EyqeIcyt_ARLfvLKSQ_MPigSdJl'

// Public credentials only. RLS, not the UI session, authorizes database access.
export const supabase = createClient(supabaseUrl, publishableKey)

export const avatars = [
  { id: 'mage', label: 'Mago', symbol: '🧙' },
  { id: 'knight', label: 'Cavaleiro', symbol: '🛡️' },
  { id: 'dragon', label: 'Dragão', symbol: '🐉' },
  { id: 'scribe', label: 'Escriba', symbol: '🪶' },
]

export function authError(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : ''
  switch (code) {
    case 'invalid_credentials': return 'Email ou senha incorretos.'
    case 'email_not_confirmed': return 'Sua conta está pendente. Fale com o administrador da wiki para liberar o acesso.'
    case 'user_already_exists': return 'Já existe uma conta com esse email. Faça login.'
    case 'weak_password': return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit': return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    default: return 'Não foi possível concluir. Verifique sua conexão e tente novamente.'
  }
}
