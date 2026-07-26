import { useState } from 'react'
import { ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { configured, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!configured) {
      setMessage({ type: 'error', text: '请先在 .env.local 中配置 Supabase URL 和 anon key。' })
      return
    }
    setBusy(true)
    setMessage(null)
    const { data, error } = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else if (mode === 'signup' && !data.session) {
      setMessage({ type: 'success', text: '注册成功，请前往邮箱完成验证。' })
    }
  }

  return (
    <main className="min-h-screen px-5 pb-10 pt-[max(3.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-[430px]">
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_8px_30px_rgba(99,102,241,.32)]">
            <Sparkles size={26} aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold tracking-[0.16em] text-indigo-500">别让想法溜走</p>
          <h1 className="mt-1 bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Do &amp; Write
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">把要做的事和闪过的灵感，稳稳接住。</p>
        </header>

        <section className="mt-9 rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-card backdrop-blur">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist">
            {[
              ['signin', '登录'],
              ['signup', '注册'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => {
                  setMode(value)
                  setMessage(null)
                }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">邮箱</span>
              <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-300"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">密码</span>
              <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                <LockKeyhole size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="至少 6 位"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-300"
                />
              </span>
            </label>

            {message && (
              <div
                role="status"
                className={`flex gap-2 rounded-xl px-3 py-2.5 text-xs leading-5 ${
                  message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {message.type === 'success' && <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(99,102,241,.26)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {mode === 'signin' ? '进入 Do & Write' : '创建账号'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
