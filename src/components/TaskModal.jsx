import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, LoaderCircle, Sparkles, X } from 'lucide-react'
import { useTasks } from '../context/TasksContext'
import { cleanTaskContent, detectSource, parseNaturalDate } from '../lib/parser'

const SOURCE_LABELS = { wechat: '公众号', douyin: '抖音', xhs: '小红书', web: '网页' }

export default function TaskModal({ open, type, initialText = '', onClose }) {
  const { addTask } = useTasks()
  const [text, setText] = useState(initialText)
  const [date, setDate] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const parsedDate = useMemo(() => parseNaturalDate(text), [text])
  const detectedSource = useMemo(() => detectSource(text), [text])

  useEffect(() => {
    if (open) {
      setText(initialText)
      setDate('')
      setSourceName('')
      setError('')
    }
  }, [open, initialText])

  useEffect(() => {
    if (!open) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  async function submit(event) {
    event.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setError('')
    try {
      await addTask({
        type,
        content: cleanTaskContent(text) || text.trim(),
        due_date: date || parsedDate,
        source_name: type === 'inspo' ? sourceName.trim() || null : null,
        source: type === 'inspo' ? detectedSource.source : null,
        source_url: type === 'inspo' ? detectedSource.sourceUrl : null,
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-[430px] rounded-t-[28px] bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]"
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-indigo-500">快速收进来</p>
            <h2 id="modal-title" className="mt-0.5 text-xl font-extrabold text-slate-800">
              添加{type === 'todo' ? '待办' : '灵感'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" aria-label="关闭">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">内容</span>
            <textarea
              autoFocus
              required
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={type === 'todo' ? '比如：7天后交房租' : '比如：下周五写 AI Agent 的 5 个改变'}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-[15px] leading-6 outline-none transition placeholder:text-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          {parsedDate && !date && (
            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-600">
              <Sparkles size={15} /> 已识别日期：{parsedDate}
            </div>
          )}

          {type === 'inspo' && detectedSource.source && (
            <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-600">
              <Sparkles size={15} /> 已识别来源：{SOURCE_LABELS[detectedSource.source]}
            </div>
          )}

          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <CalendarDays size={16} className="text-indigo-500" /> 日期（可选）
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          {type === 'inspo' && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">来源名（可选）</span>
              <input
                value={sourceName}
                onChange={(event) => setSourceName(event.target.value)}
                placeholder="比如：数字生命卡兹克"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          )}

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <button
            disabled={busy || !text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(99,102,241,.26)] disabled:opacity-50"
          >
            {busy && <LoaderCircle size={17} className="animate-spin" />}
            保存{type === 'todo' ? '待办' : '灵感'}
          </button>
        </form>
      </section>
    </div>
  )
}
