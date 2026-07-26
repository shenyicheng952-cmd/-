import { Check, Trash2 } from 'lucide-react'
import { formatDueDate, getDueGroup } from '../lib/dates'

const TODO_ICONS = ['✦', '✓', '◌', '→']

export default function TodoCard({ task, index, onToggle, onDelete, onEdit }) {
  const done = Boolean(task.done_at)
  const dueGroup = getDueGroup(task.due_date)

  return (
    <article
      onClick={() => onEdit(task)}
      className={`group flex gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_5px_rgba(15,23,42,.04)] transition ${done ? 'opacity-50' : 'active:scale-[.985]'}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-lg font-bold text-indigo-500">
        {TODO_ICONS[index % TODO_ICONS.length]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggle(task)
            }}
            className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
              done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400'
            }`}
            aria-label={done ? '标记为未完成' : '标记为已完成'}
          >
            {done && <Check size={13} strokeWidth={3} />}
          </button>
          <p className={`min-w-0 flex-1 text-[15px] font-semibold leading-6 ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {task.content}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(task.id)
            }}
            className="rounded-lg p-1 text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="删除待办"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="ml-[34px] mt-1.5 text-xs">
          {done ? (
            <span className="text-slate-400">✓ 已完成</span>
          ) : task.due_date ? (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 font-bold ${
                dueGroup === 'today'
                  ? 'bg-red-50 text-red-500'
                  : dueGroup === 'soon'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-indigo-50 text-indigo-500'
              }`}
            >
              {formatDueDate(task.due_date)}
            </span>
          ) : (
            <span className="text-slate-400">未设期限</span>
          )}
        </div>
      </div>
    </article>
  )
}
