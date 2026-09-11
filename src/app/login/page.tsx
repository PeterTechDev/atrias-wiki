'use client'

import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, Upload, LockKeyhole } from 'lucide-react'
import { profilePhotoError } from '@/lib/profilePhoto'
import { Avatar, useAuth } from '@/components/AuthProvider'
import { avatars, authError, supabase } from '@/lib/supabase'
import { signupPasswordError } from '@/lib/signupPassword'
import { syncWikiSession } from '@/lib/wikiSession'

const inputClass = 'mt-2 min-h-11 w-full rounded-md border border-amber-200/30 bg-slate-950/50 px-3 py-2 text-white focus:border-amber-400 focus:outline-2 focus:outline-amber-400'
const buttonClass = 'rounded bg-[#c6a862] px-5 py-3 font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-50'

function ProfileFields({ user, children }: { user?: User; children?: React.ReactNode }) {
  const [avatar, setAvatar] = useState(user?.user_metadata.avatar || 'mage')
  const [displayName, setDisplayName] = useState(user?.user_metadata.display_name || '')
  const [photo, setPhoto] = useState<{ url: string; name: string } | null>(null)
  const [photoError, setPhotoError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url) }, [photo])

  function clearPhoto() {
    if (photoRef.current) { photoRef.current.value = ''; photoRef.current.setCustomValidity('') }
    setPhoto(null)
    setPhotoError('')
  }

  return <div className="grid gap-8 md:grid-cols-[240px_1fr] md:gap-10">
    <fieldset className="min-w-0">
      <legend className="mb-4 font-semibold">Sua imagem</legend>
      <div className="mb-5 flex items-center gap-4 md:flex-col md:items-start">
        {photo ? <Image src={photo.url} alt="Prévia da foto selecionada" width={88} height={88} unoptimized className="h-22 w-22 shrink-0 rounded-full object-cover" /> : <Avatar value={avatar} size={88} />}
        <div className="min-w-0">
          <p className="break-words font-crimson text-2xl text-amber-100">{displayName.trim() || 'Seu nome na wiki'}</p>
          <p className="mt-1 text-xs text-slate-300">Assim você aparece na wiki.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 md:grid-cols-2">
        {avatars.map(option => <label key={option.id} className="relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-amber-200/20 px-1 py-3 hover:bg-amber-100/5 has-checked:border-[#c6a862] has-checked:bg-amber-100/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-amber-300">
          <input type="radio" name="avatar" value={option.id} checked={!photo && avatar === option.id} onChange={() => { clearPhoto(); setAvatar(option.id) }} className="peer sr-only" />
          <span aria-hidden="true"><Avatar value={option.id} size={44} /></span>
          <span className="text-xs">{option.label}</span>
          <Check size={14} aria-hidden="true" className="absolute right-1 top-1 hidden text-amber-200 peer-checked:block" />
        </label>)}
      </div>
      {user?.user_metadata.avatar?.startsWith('https://') && <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded px-2 has-focus-visible:outline-2 has-focus-visible:outline-amber-300">
        <input type="radio" name="avatar" value={user.user_metadata.avatar} checked={!photo && avatar === user.user_metadata.avatar} onChange={() => { clearPhoto(); setAvatar(user.user_metadata.avatar) }} className="accent-amber-300" />
        <span aria-hidden="true"><Avatar value={user.user_metadata.avatar} /></span><span className="text-sm">Manter foto atual</span>
      </label>}
      {user ? <div className="mt-5">
        <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-200/30 px-3 py-2 text-sm text-amber-100 hover:bg-amber-100/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-amber-300">
          <Upload size={16} aria-hidden="true" />{photo ? 'Trocar foto' : 'Enviar minha foto'}
          <input ref={photoRef} name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help photo-error" aria-invalid={!!photoError} className="sr-only" onChange={event => {
            const file = event.target.files?.[0]
            if (!file) return
            const error = profilePhotoError(file)
            event.target.setCustomValidity(error)
            setPhotoError(error)
            setPhoto(error ? null : { url: URL.createObjectURL(file), name: file.name })
          }} />
        </label>
        <p id="photo-help" className="mt-2 text-xs leading-relaxed text-slate-300">JPG, PNG ou WebP, até 2 MB. A imagem escolhida será pública.</p>
        <p id="photo-error" role="alert" className="mt-2 text-sm text-red-200">{photoError}</p>
        {(photo || photoError) && <div className="mt-2 text-sm">
          {photo && <p className="break-all text-slate-300">{photo.name}</p>}
          <button type="button" onClick={clearPhoto} className="min-h-11 text-amber-200 underline underline-offset-4">Remover foto selecionada</button>
        </div>}
      </div> : <p className="mt-4 text-xs leading-relaxed text-slate-300">Prefere uma foto? Você poderá enviá-la depois de criar sua conta.</p>}
      <p className="mt-4 text-xs leading-relaxed text-slate-400">Ícones: Lorc e Delapouite / <a href="https://game-icons.net" className="underline underline-offset-2 hover:text-amber-100">Game-icons</a> · <a href="https://creativecommons.org/licenses/by/3.0/" className="underline underline-offset-2 hover:text-amber-100">CC BY 3.0</a></p>
    </fieldset>
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 font-semibold">Identidade na wiki</h2>
        <label htmlFor="display-name" className="block text-sm">Nome exibido na wiki</label>
        <input id="display-name" name="display_name" required minLength={2} maxLength={50} value={displayName} onChange={event => setDisplayName(event.target.value)} aria-describedby="display-name-help" className={inputClass} />
        <p id="display-name-help" className="mt-2 text-xs leading-relaxed text-slate-300">Pode ser seu nome ou apelido. Aparece na autoria e nas edições dos posts.</p>
      </div>
      <div className="border-t border-amber-200/15 pt-6">
        <h2 className="mb-4 font-semibold">Dados da conta</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <label className="text-sm">Nome<input name="first_name" autoComplete="given-name" required maxLength={80} defaultValue={user?.user_metadata.first_name || ''} className={inputClass} /></label>
          <label className="text-sm">Sobrenome<input name="last_name" autoComplete="family-name" required maxLength={80} defaultValue={user?.user_metadata.last_name || ''} className={inputClass} /></label>
        </div>
      </div>
      {user && <div className="text-sm">
        <p className="flex items-center gap-2 text-slate-300"><LockKeyhole size={14} aria-hidden="true" />Email de acesso</p>
        <p className="mt-2 break-all">{user.email}</p>
        <p className="mt-2 text-xs text-slate-300">O email não pode ser alterado nesta tela.</p>
      </div>}
      {children}
    </div>
  </div>
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const confirmationRef = useRef<HTMLInputElement>(null)
  const next = typeof window === 'undefined' ? '/' : new URLSearchParams(window.location.search).get('next')
  const nextPath = next?.startsWith('/') && !next.startsWith('//') ? next : '/'

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    if (params.has('error')) {
      setError('Este link é inválido ou expirou. Entre com seu email e senha.')
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (user && next) window.location.replace(nextPath)
  }, [user, next, nextPath])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setMessage('')
    setError('')
    const email = String(data.get('email') || '').trim()
    const password = String(data.get('password') || '')
    const confirmation = String(data.get('confirm_password') || '')
    if (!user && mode === 'signup') {
      const passwordError = signupPasswordError(password, confirmation)
      if (passwordError) {
        setError(passwordError)
        requestAnimationFrame(() => confirmationRef.current?.focus())
        return
      }
    }
    setBusy(true)
    try {
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
            if (profilePhotoError(file)) {
              setError(profilePhotoError(file))
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
          if (result.session) { await syncWikiSession(result.session); window.location.assign(nextPath) }
          setMessage(result.session ? 'Conta criada! Você já pode personalizar seu perfil.' : 'Cadastro recebido. Entre com seu email e senha. Se não conseguir acessar, fale com o administrador da wiki.')
          setMode('login')
          setShowPassword(false)
          setShowConfirmation(false)
          form.reset()
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await syncWikiSession(data.session)
        window.location.assign(nextPath)
      }
    } catch (error) {
      setError(authError(error))
    } finally {
      setBusy(false)
    }
  }

  const accountFields = <>
              {!user && <label className="block">Email<input name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} /></label>}
              {!user && <div className="block"><label htmlFor="password">Senha</label><div className="relative mt-1"><input id="password" name="password" type={mode === 'signup' && showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : undefined} maxLength={128} className={`${inputClass}${mode === 'signup' ? ' pr-24' : ''}`} />{mode === 'signup' && <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-amber-300 hover:bg-amber-100/10 focus-visible:outline-2 focus-visible:outline-amber-400">{showPassword ? 'Ocultar' : 'Mostrar'}</button>}</div>{mode === 'signup' && <span className="text-xs text-slate-300">Pelo menos 8 caracteres.</span>}</div>}
              {!user && mode === 'signup' && <div className="block"><label htmlFor="confirm_password">Confirmar senha</label><div className="relative mt-1"><input ref={confirmationRef} id="confirm_password" name="confirm_password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} aria-invalid={error === 'As senhas não coincidem.'} aria-describedby={error === 'As senhas não coincidem.' ? 'confirm-password-error' : undefined} className={`${inputClass} pr-24`} /><button type="button" onClick={() => setShowConfirmation(value => !value)} aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-amber-300 hover:bg-amber-100/10 focus-visible:outline-2 focus-visible:outline-amber-400">{showConfirmation ? 'Ocultar' : 'Mostrar'}</button></div>{error === 'As senhas não coincidem.' && <span id="confirm-password-error" role="alert" className="mt-1 block text-sm text-red-200">As senhas não coincidem.</span>}</div>}
  </>

  return <main className="min-h-screen bg-[#0a1628] px-4 py-10 text-amber-50">
    <div className={`mx-auto ${user || mode === 'signup' ? 'max-w-3xl' : 'max-w-lg'}`}>
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-amber-200 hover:underline focus-visible:outline-2 focus-visible:outline-amber-300"><ArrowLeft size={16} aria-hidden="true" />Voltar à wiki</Link>
      <section className="mt-4 rounded-xl border border-amber-200/20 bg-slate-900/80 p-5 sm:p-8">
        <h1 className="font-cinzel text-3xl text-[#c6a862]">{user ? 'Meu perfil' : mode === 'signup' ? 'Criar conta' : 'Entrar na wiki'}</h1>
        <p className="mt-3 text-sm text-slate-300">{user ? 'Escolha como você aparece nas crônicas de Átrias.' : 'Faça parte das crônicas de Átrias. A leitura continua aberta a todos.'}</p>
        {loading ? <p role="status" className="mt-6">Carregando conta…</p> : <>
          {!user && <div className="my-6 flex gap-4" aria-label="Acesso à conta">
            <button type="button" disabled={busy} aria-pressed={mode === 'login'} onClick={() => { setMode('login'); setShowPassword(false); setShowConfirmation(false); setError(''); setMessage('') }} className={mode === 'login' ? 'text-amber-300 underline underline-offset-8' : 'text-slate-300'}>Entrar</button>
            <button type="button" disabled={busy} aria-pressed={mode === 'signup'} onClick={() => { setMode('signup'); setShowPassword(false); setShowConfirmation(false); setError(''); setMessage('') }} className={mode === 'signup' ? 'text-amber-300 underline underline-offset-8' : 'text-slate-300'}>Criar conta</button>
          </div>}
          <form key={user ? `${user.id}:${user.updated_at}` : mode} onSubmit={submit} className="mt-6 space-y-5">
            <fieldset disabled={busy} className="space-y-5">
              {user || mode === 'signup' ? <ProfileFields user={user || undefined}>{accountFields}</ProfileFields> : accountFields}
              {!user && mode === 'signup' && <p className="text-xs text-slate-300">O acesso é imediato, sem confirmação por email.</p>}
              <button className={`${buttonClass} w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300`} disabled={busy}>{busy ? 'Aguarde…' : user ? 'Salvar perfil' : mode === 'signup' ? 'Criar conta' : 'Entrar'}</button>
            </fieldset>
          </form>
        </>}
        {error && error !== 'As senhas não coincidem.' && <p role="alert" className="mt-5 rounded border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
        {message && <p role="status" className="mt-5 rounded border border-green-400/30 bg-green-950/30 p-3 text-sm text-green-200">{message}</p>}
      </section>
    </div>
  </main>
}
