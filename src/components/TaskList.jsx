import { LoaderCircle, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { getDueGroup, sortTasks } from '../lib/dates'
import TodoCard from './TodoCard'
import InspoCard from './InspoCard'
import TaskModal from './TaskModal'

const GROUPS = [
  { id: 'today', todoTitle: '今天到期', inspoTitle: '今天要写', dot: 'bg-red-500' },
  { id: 'soon', todoTitle: '即将到期', inspoTitle: '即将到期', dot: 'bg-amber-500' },
  { id: 'later', todoTitle: '有空再做', inspoTitle: '以后写', dot: 'bg-indigo-500' },
]

export default function TaskList({ type }) {
  const { tasks, loading, error, refresh, toggleTask, deleteTask } = useTasks()
  const [mutationError, setMutationError] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const typedTasks = sortTasks(tasks.filter((task) => task.type === type && !task.parent_id))

  async function handle(action) {
    setMutationError('')
    try {
      await action()
    } catch (err) {
      setMutationError(err.message)
    }
  }

  if (loading) {
    return <LoaderCircle className="mx-auto mt-12 animate-spin text-indigo-400" aria-label="正在加载内容" />
  }

  if (error) {
    return (
      <div className="mx-5 rounded-2xl bg-red-50 p-5 text-center text-sm text-red-600">
        <p>内容加载失败：{error}</p>
        <button onClick={refresh} className="mx-auto mt-3 flex items-center gap-1 font-bold">
          <RotateCw size={15} /> 重试
        </button>
      </div>
    )
  }

  if (!typedTasks.length) {
    return (
      <div className="mx-5 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-5 py-10 text-center">
        <p className="text-2xl">{type === 'todo' ? '📋' : '💡'}</p>
        <p className="mt-2 text-sm font-semibold text-slate-600">{type === 'todo' ? '今天想完成什么？' : '灵感来了，就先接住它。'}</p>
        <p className="mt-1 text-xs text-slate-400">用上方输入栏或右下角按钮添加第一条。</p>
      </div>
    )
  }

  return (
    <>
      {mutationError && <p className="mx-5 mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{mutationError}</p>}
      {GROUPS.map((group) => {
        const grouped = typedTasks.filter((task) => getDueGroup(task.due_date) === group.id)
        if (!grouped.length) return null
        return (
          <section key={group.id} className="mb-5 px-5">
            <h2 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-slate-700">
              <span className={`h-2 w-2 rounded-full ${group.dot}`} />
              {type === 'todo' ? group.todoTitle : group.inspoTitle}
              <span className="font-normal text-slate-300">{grouped.length}</span>
            </h2>
            <div className="space-y-2.5">
              {type === 'todo' &&
                grouped.map((task, index) => (
                  <TodoCard
                    key={task.id}
                    task={task}
                    subtasks={tasks.filter((item) => item.parent_id === task.id)}
                    index={index}
                    onToggle={(item) => handle(() => toggleTask(item))}
                    onToggleSubtask={(sub) => handle(() => toggleTask(sub))}
                    onDelete={(id) => handle(() => deleteTask(id))}
                    onEdit={setEditingTask}
                  />
                ))}
              {type === 'inspo' &&
                grouped.map((task) => (
                  <InspoCard
                    key={task.id}
                    task={task}
                    subtasks={tasks.filter((item) => item.parent_id === task.id)}
                    onToggle={(item) => handle(() => toggleTask(item))}
                    onDelete={(id) => handle(() => deleteTask(id))}
                    onEdit={setEditingTask}
                  />
                ))}
            </div>
          </section>
        )
      })}
      <TaskModal
        open={Boolean(editingTask)}
        type={editingTask?.type ?? type}
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </>
  )
}
