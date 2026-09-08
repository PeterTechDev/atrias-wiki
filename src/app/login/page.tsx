'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Avatar, useAuth } from '@/components/AuthProvider'
import { avatars, authError, supabase } from '@/lib/supabase'

const inputClass = 'mt-1 w-full rounded border border-amber-200/30 bg-slate-950/50 px-3 py-2 text-white focus:border-amber-400 focus:outline-2 focus:outline-amber-400'
const buttonClass = 'rounded bg-[#c6a862] px-5 py-3 font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-50'

function ProfileFields({ user }: { user?: User }) {
  return <>
    <div className="grid gap-4 sm:grid-cols-2">
      <label>Nome<input name="first_name" autoComplete="given-name" required maxLength={80} defaultValue={user?.user_metadata.first_name || ''} className={inputClass} /></label>
      <label>Sobrenome<input name="last_name" autoComplete="family-name" required maxLength={80} defaultValue={user?.user_metadata.last_name || ''} className={inputClass} /></label>
    </div>
    <label className="block">Nome exibido na wiki<input name="display_name" required minLength={2} maxLength={50} defaultValue={user?.user_metadata.display_name || ''} className={inputClass} /><span className="mt-1 block text-xs text-slate-300">Público, usado na autoria e nas edições dos posts.</span></label>
    <fieldset>
      <legend className="mb-2">Avatar</legend>
      <div className="flex flex-wrap gap-3">
        {avatars.map(avatar => <label key={avatar.id} className="flex cursor-pointer flex-col items-center gap-1 rounded border border-amber-200/20 p-2 has-checked:border-amber-400 has-checked:bg-amber-100/10">
          <Avatar value={avatar.id} />
          <span className="text-xs">{avatar.label}</span>
          <input type="radio" name="avatar" value={avatar.id} defaultChecked={(user?.user_metadata.avatar || 'mage') === avatar.id} />
        </label>)}
        {user?.user_metadata.avatar?.startsWith('https://') && <label className="flex flex-col items-center gap-1 rounded border border-amber-200/20 p-2 has-checked:border-amber-400">
          <Avatar value={user.user_metadata.avatar} /><span className="text-xs">Foto atual</span>
          <input type="radio" name="avatar" value={user.user_metadata.avatar} defaultChecked />
        </label>}
      </div>
    </fieldset>
  </>
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    if (params.has('error')) {
      setError('Este link é inválido ou expirou. Entre com seu email e senha.')
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const email = String(data.get('email') || '').trim()
      const password = String(data.get('password') || '')
      if (user || mode === 'signup') {
        const profile = {
          first_name: String(data.get('first_name') || '').trim(),
          last_name: String(data.get('last_name') || '').trim(),
          display_name: String(data.get('display_name') || '').trim(),
          avatar: String(data.get('avatar') || 'mage'),
        }
        if (!profile.first_name || !profile.last_name || profile.display_name.length < 2) {
          setError('Preencha nome, sobrenome e um nome de exibição com pelo menos 2 caracteres.')
          return
        }
        if (user) {
          const file = data.get('photo')
          let uploadedPath: string | null = null
          if (file instanceof File && file.size) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
              setError('Envie uma imagem JPG, PNG ou WebP de até 2 MB.')
              return
            }
            uploadedPath = `${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`
            const { error } = await supabase.storage.from('avatars').upload(uploadedPath, file)
            if (error) throw error
            profile.avatar = supabase.storage.from('avatars').getPublicUrl(uploadedPath).data.publicUrl
          }
          const { error } = await supabase.auth.updateUser({ data: profile })
          if (error) {
            if (uploadedPath) await supabase.storage.from('avatars').remove([uploadedPath])
            throw error
          }
          const previousAvatar = user.user_metadata.avatar
          const ownFolder = supabase.storage.from('avatars').getPublicUrl(`${user.id}/`).data.publicUrl
          if (typeof previousAvatar === 'string' && previousAvatar.startsWith(ownFolder) && previousAvatar !== profile.avatar) {
            // ponytail: best-effort cleanup; add a scheduled orphan sweep if storage grows.
            await supabase.storage.from('avatars').remove([`${user.id}/${previousAvatar.slice(ownFolder.length)}`])
          }
          form.reset()
          setMessage('Perfil salvo.')
        } else {
          const { data: result, error } = await supabase.auth.signUp({ email, password, options: { data: profile } })
          if (error) throw error
          setMessage(result.session ? 'Conta criada! Você já pode personalizar seu perfil.' : 'Cadastro recebido. Entre com seu email e senha. Se não conseguir acessar, fale com o administrador da wiki.')
          setMode('login')
          form.reset()
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('Você entrou na wiki.')
      }
    } catch (error) {
      setError(authError(error))
    } finally {
      setBusy(false)
    }
  }

  return <main className="min-h-screen bg-[#0a1628] px-4 py-10 text-amber-50">
    <div className="mx-auto max-w-lg">
      <Link href="/" className="text-amber-300 hover:underline">← Voltar à wiki</Link>
      <section className="mt-6 rounded-xl border border-amber-200/20 bg-slate-900/80 p-6 shadow-xl sm:p-8">
        <h1 className="font-cinzel text-3xl text-[#c6a862]">{user ? 'Meu perfil' : mode === 'signup' ? 'Criar conta' : 'Entrar na wiki'}</h1>
        <p className="mt-3 text-sm text-slate-300">{user ? 'Sua identidade nas crônicas de Átrias.' : 'Faça parte das crônicas de Átrias. A leitura continua aberta a todos.'}</p>
        {loading ? <p role="status" className="mt-6">Carregando conta…</p> : <>
          {!user && <div className="my-6 flex gap-4" aria-label="Acesso à conta">
            <button type="button" disabled={busy} aria-pressed={mode === 'login'} onClick={() => { setMode('login'); setError(''); setMessage('') }} className={mode === 'login' ? 'text-amber-300 underline underline-offset-8' : 'text-slate-300'}>Entrar</button>
            <button type="button" disabled={busy} aria-pressed={mode === 'signup'} onClick={() => { setMode('signup'); setError(''); setMessage('') }} className={mode === 'signup' ? 'text-amber-300 underline underline-offset-8' : 'text-slate-300'}>Criar conta</button>
          </div>}
          <form key={user ? `${user.id}:${user.updated_at}` : mode} onSubmit={submit} className="mt-6 space-y-5">
            <fieldset disabled={busy} className="space-y-5">
              {(user || mode === 'signup') && <ProfileFields user={user || undefined} />}
              <label className="block">Email<input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={user?.email || ''} readOnly={!!user} className={inputClass} /></label>
              {!user && <label className="block">Senha<input name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : undefined} maxLength={128} className={inputClass} />{mode === 'signup' && <span className="text-xs text-slate-300">Pelo menos 8 caracteres.</span>}</label>}
              {user ? <label className="block">Enviar foto de perfil<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-amber-100 file:p-2 file:text-slate-900" /><span className="mt-1 block text-xs text-slate-300">JPG, PNG ou WebP, até 2 MB. A foto enviada substitui o avatar selecionado e será pública.</span></label> : mode === 'signup' && <p className="text-xs text-slate-300">O acesso é imediato, sem confirmação por email. Você poderá enviar sua foto no perfil após criar a conta.</p>}
              <button className={`${buttonClass} w-full`} disabled={busy}>{busy ? 'Aguarde…' : user ? 'Salvar perfil' : mode === 'signup' ? 'Criar conta' : 'Entrar'}</button>
            </fieldset>
          </form>
        </>}
        {error && <p role="alert" className="mt-5 rounded border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
        {message && <p role="status" className="mt-5 rounded border border-green-400/30 bg-green-950/30 p-3 text-sm text-green-200">{message}</p>}
      </section>
    </div>
  </main>
}
