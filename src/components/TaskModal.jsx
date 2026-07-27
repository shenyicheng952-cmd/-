import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, LoaderCircle, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useTasks } from '../context/TasksContext'
import { cleanTaskContent, detectSource, extractInspoContent, parseNaturalDate, splitTaskSteps } from '../lib/parser'

const SOURCE_LABELS = { wechat: '公众号', douyin: '抖音', xhs: '小红书', web: '网页' }

export default function TaskModal({ open, type, initialText = '', task = null, onClose }) {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [text, setText] = useState(initialText)
  const [date, setDate] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [draftSubtasks, setDraftSubtasks] = useState([])
  const [draftSubtasksTouched, setDraftSubtasksTouched] = useState(false)
  const [subtaskBusy, setSubtaskBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const parsedDate = useMemo(() => parseNaturalDate(text), [text])
  const detectedSource = useMemo(() => detectSource(text), [text])

  useEffect(() => {
    if (open) {
      setText(task?.content ?? initialText)
      setDate(task?.due_date?.slice(0, 10) ?? '')
      setSourceName(task?.source_name ?? '')
      setNewSubtask('')
      setDraftSubtasks(task ? [] : splitTaskSteps(initialText, type))
      setDraftSubtasksTouched(false)
      setError('')
    }
  }, [open, initialText, task])

  useEffect(() => {
    if (!open) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const subtasks = task ? tasks.filter((item) => item.parent_id === task.id) : []

  async function addSubtask() {
    const content = newSubtask.trim()
    if (!content || !task) return
    setSubtaskBusy(true)
    setError('')
    try {
      await addTask({
        type,
        content,
        parent_id: task.id,
        due_date: null,
        source: null,
        source_url: null,
        source_name: null,
        done_at: null,
      })
      setNewSubtask('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubtaskBusy(false)
    }
  }

  async function toggleSubtask(subtask) {
    setSubtaskBusy(true)
    setError('')
    try {
      await updateTask(subtask.id, {
        done_at: subtask.done_at ? null : new Date().toISOString(),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubtaskBusy(false)
    }
  }

  async function removeSubtask(id) {
    setSubtaskBusy(true)
    setError('')
    try {
      await deleteTask(id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubtaskBusy(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setError('')
    try {
      const values = {
        content: type === 'inspo' ? extractInspoContent(text) || text.trim() : cleanTaskContent(text) || text.trim(),
        due_date: date || parsedDate || null,
        source_name: type === 'inspo' ? sourceName.trim() || null : null,
        source:
          type === 'inspo'
            ? detectedSource.source ?? task?.source ?? null
            : null,
        source_url:
          type === 'inspo'
            ? detectedSource.sourceUrl ?? task?.source_url ?? null
            : null,
      }
      if (task) {
        await updateTask(task.id, values)
      } else {
        const parent = await addTask({
          ...values,
          type,
        })
        await Promise.all(
          draftSubtasks
            .map((content) => content.trim())
            .filter(Boolean)
            .map((content) =>
              addTask({
                type,
                content,
                parent_id: parent.id,
                due_date: null,
                source: null,
                source_url: null,
                source_name: null,
                done_at: null,
              }),
            ),
        )
      }
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
        className="max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]"
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-indigo-500">{task ? '更新记录' : '快速收进来'}</p>
            <h2 id="modal-title" className="mt-0.5 text-xl font-extrabold text-slate-800">
              {task ? '编辑' : '添加'}{type === 'todo' ? '待办' : '灵感'}
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
              onChange={(event) => {
                const value = event.target.value
                setText(value)
                if (!task && !draftSubtasksTouched) setDraftSubtasks(splitTaskSteps(value, type))
              }}
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

          {!task && (type === 'todo' || draftSubtasks.length > 0) && (
            <section className="rounded-2xl border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">子步骤</span>
                {draftSubtasks.length > 0 && (
                  <span className="text-xs text-indigo-500">已自动拆分，可手动调整</span>
                )}
              </div>
              <div className="space-y-2">
                {draftSubtasks.map((subtask, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={subtask}
                      onChange={(event) => {
                        setDraftSubtasksTouched(true)
                        setDraftSubtasks((current) =>
                          current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                        )
                      }}
                      placeholder={`子步骤 ${index + 1}`}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDraftSubtasksTouched(true)
                        setDraftSubtasks((current) => current.filter((_, itemIndex) => itemIndex !== index))
                      }}
                      className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      aria-label="删除子步骤"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraftSubtasksTouched(true)
                  setDraftSubtasks((current) => [...current, ''])
                }}
                className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600"
              >
                <Plus size={14} /> 添加子步骤
              </button>
            </section>
          )}

          {task && (
            <section className="rounded-2xl border border-slate-200 p-3">
              <div className="mb-2 text-sm font-bold text-slate-700">子步骤</div>
              {subtasks.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-400">把任务拆成可以逐个完成的小步骤</p>
              ) : (
                <div className="space-y-2">
                  {subtasks.map((subtask) => {
                    const done = Boolean(subtask.done_at)
                    return (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={subtaskBusy}
                          onClick={() => toggleSubtask(subtask)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                            done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400'
                          }`}
                          aria-label={done ? '标记子步骤为未完成' : '标记子步骤为已完成'}
                        >
                          {done && <Check size={12} strokeWidth={3} />}
                        </button>
                        <span
                          className={`min-w-0 flex-1 px-1 py-2 text-sm ${
                            done ? 'text-slate-400 line-through' : 'text-slate-700'
                          }`}
                        >
                          {subtask.content}
                        </span>
                        <button
                          type="button"
                          disabled={subtaskBusy}
                          onClick={() => removeSubtask(subtask.id)}
                          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                          aria-label="删除子步骤"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <input
                  value={newSubtask}
                  onChange={(event) => setNewSubtask(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addSubtask()
                    }
                  }}
                  placeholder="输入新的子步骤"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  disabled={subtaskBusy || !newSubtask.trim()}
                  onClick={addSubtask}
                  className="flex items-center gap-1 rounded-xl bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-600 disabled:opacity-50"
                >
                  {subtaskBusy ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
                  添加
                </button>
              </div>
            </section>
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
