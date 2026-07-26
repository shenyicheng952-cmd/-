import { useState } from 'react'
import { Lightbulb, ListTodo, LogOut, Plus, Send, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'
import StatsRing from './StatsRing'
import TaskList from './TaskList'
import TaskModal from './TaskModal'

export default function Dashboard() {
  const { signOut } = useAuth()
  const { tasks } = useTasks()
  const [activeTab, setActiveTab] = useState('todo')
  const [quickText, setQuickText] = useState('')
  const [modal, setModal] = useState({ open: false, text: '' })
  function handleQuickSubmit(event) {
    event.preventDefault()
    if (!quickText.trim()) return
    setModal({ open: true, text: quickText.trim() })
  }

  return (
    <main className="mx-auto min-h-screen max-w-[430px] pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <header className="relative px-5 pb-5 pt-[max(2.5rem,env(safe-area-inset-top))] text-center">
        <button
          type="button"
          onClick={signOut}
          className="absolute right-5 top-[max(2.5rem,env(safe-area-inset-top))] rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
          aria-label="退出登录"
        >
          <LogOut size={18} />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-sm font-semibold tracking-[0.12em] text-indigo-500">
          <Sparkles size={14} /> 别让想法溜走
        </p>
        <h1 className="mt-1 bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-[34px] font-extrabold tracking-tight text-transparent">
          Do &amp; Write
        </h1>
      </header>

      <form onSubmit={handleQuickSubmit} className="mx-5 mb-4 flex items-center rounded-[20px] border border-white bg-white p-1 shadow-card">
        <input
          value={quickText}
          onChange={(event) => setQuickText(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-slate-300"
          placeholder={activeTab === 'todo' ? '明天写 AI 工具，或交房租' : '记下选题、链接或一闪而过的想法'}
          aria-label="快速记录"
        />
        <button className="flex items-center gap-1.5 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200">
          <Send size={15} /> 记录
        </button>
      </form>

      <div className="mx-5 mb-4 grid grid-cols-2 gap-2" role="tablist" aria-label="内容类型">
        {[
          ['todo', ListTodo, '待办'],
          ['inspo', Lightbulb, '灵感'],
        ].map(([value, Icon, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={activeTab === value}
            onClick={() => setActiveTab(value)}
            className={`flex items-center justify-center gap-2 rounded-[14px] py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
              activeTab === value
                ? value === 'todo'
                  ? 'bg-indigo-500 text-white shadow-[0_3px_14px_rgba(99,102,241,.28)]'
                  : 'bg-violet-500 text-white shadow-[0_3px_14px_rgba(139,92,246,.28)]'
                : value === 'todo'
                  ? 'bg-indigo-50 text-indigo-500'
                  : 'bg-violet-50 text-violet-500'
            }`}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>

      <StatsRing tasks={tasks} type={activeTab} />

      <TaskList type={activeTab} />

      <button
        type="button"
        onClick={() => setModal({ open: true, text: '' })}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-[max(1.25rem,calc((100vw-430px)/2+1.25rem))] flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_8px_28px_rgba(99,102,241,.42)] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 active:scale-95"
        aria-label={`添加${activeTab === 'todo' ? '待办' : '灵感'}`}
      >
        <Plus size={26} />
      </button>
      <TaskModal
        open={modal.open}
        type={activeTab}
        initialText={modal.text}
        onClose={() => {
          setModal({ open: false, text: '' })
          setQuickText('')
        }}
      />
    </main>
  )
}
