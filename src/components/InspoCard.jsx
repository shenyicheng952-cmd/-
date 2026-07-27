import { Check, Pencil, Trash2 } from 'lucide-react'
import { formatDueDate, getDueGroup } from '../lib/dates'

const SOURCES = {
  wechat: { label: '公众号', icon: '📱', iconClass: 'bg-emerald-50', tagClass: 'bg-emerald-100 text-emerald-800' },
  douyin: { label: '抖音', icon: '🎵', iconClass: 'bg-red-50', tagClass: 'bg-red-100 text-red-800' },
  xhs: { label: '小红书', icon: '📕', iconClass: 'bg-orange-50', tagClass: 'bg-orange-100 text-orange-800' },
  web: { label: '网页', icon: '🌐', iconClass: 'bg-blue-50', tagClass: 'bg-blue-100 text-blue-800' },
}

export default function InspoCard({ task, subtasks = [], onToggle, onDelete, onEdit }) {
  const done = Boolean(task.done_at)
  const source = SOURCES[task.source] ?? { label: '灵感', icon: '💡', iconClass: 'bg-violet-50', tagClass: 'bg-violet-100 text-violet-800' }
  const dueGroup = getDueGroup(task.due_date)
  const completedSubtasks = subtasks.filter((subtask) => subtask.done_at).length

  return (
    <article
      onClick={() => onEdit(task)}
      className={`group flex cursor-pointer gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_5px_rgba(15,23,42,.04)] transition ${done ? 'opacity-50' : 'active:scale-[.985]'}`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${source.iconClass}`}>{source.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggle(task)
            }}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
              done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-violet-400'
            }`}
            aria-label={done ? '标记为未使用' : '标记为已用'}
          >
            {done && <Check size={12} strokeWidth={3} />}
          </button>
          <p className={`min-w-0 flex-1 text-[15px] font-semibold leading-[1.45] ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {task.content}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(task)
            }}
            className="rounded-lg p-1 text-violet-400 transition hover:bg-violet-50 hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
            aria-label="编辑灵感"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(task.id)
            }}
            className="rounded-lg p-1 text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-none sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="删除灵感"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className={`rounded-full px-2.5 py-1 font-bold ${source.tagClass}`}>{source.label}</span>
          {task.source_name && <span>{task.source_name}</span>}
          {subtasks.length > 0 && <span className="font-bold text-violet-500">{completedSubtasks}/{subtasks.length} 已完成</span>}
          {done ? (
            <span>✓ 已用</span>
          ) : task.due_date ? (
            <span
              className={`rounded-full px-2.5 py-1 font-bold ${
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
            <span>未设日期</span>
          )}
        </div>
        {task.source_url && (
          <a
            href={task.source_url}
            onClick={(event) => event.stopPropagation()}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate border-t border-slate-100 pt-2 text-xs font-semibold text-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            📎 来源链接
          </a>
        )}
      </div>
    </article>
  )
}
