function isToday(dateString) {
  if (!dateString) return false
  const today = new Date()
  const date = new Date(`${dateString}T00:00:00`)
  return date.toDateString() === today.toDateString()
}

export default function StatsRing({ tasks, type }) {
  const activeTasks = tasks.filter((task) => task.type === type && !task.parent_id)
  const stats = [
    {
      value: activeTasks.filter((task) => !task.done_at && isToday(task.due_date)).length,
      label: type === 'todo' ? '今天到期' : '今天要写',
      color: 'text-red-500',
    },
    {
      value: activeTasks.filter((task) => !task.done_at).length,
      label: type === 'todo' ? '待完成' : '待写',
      color: 'text-amber-500',
    },
    {
      value: activeTasks.filter((task) => task.done_at).length,
      label: type === 'todo' ? '已完成' : '已用',
      color: 'text-emerald-500',
    },
  ]

  return (
    <section className="mx-5 mb-5 grid grid-cols-3 rounded-[20px] border border-white bg-white/90 px-4 py-5 shadow-card backdrop-blur" aria-label="任务统计">
      {stats.map((stat, index) => (
        <div key={stat.label} className={`text-center ${index ? 'border-l border-slate-100' : ''}`}>
          <strong className={`block text-2xl font-extrabold tabular-nums ${stat.color}`}>{stat.value}</strong>
          <span className="mt-0.5 block text-[11px] text-slate-400">{stat.label}</span>
        </div>
      ))}
    </section>
  )
}
