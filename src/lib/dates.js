const DAY_MS = 86_400_000

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function dayDistance(value, from = new Date()) {
  const date = parseDateKey(value)
  if (!date) return Infinity
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((date - start) / DAY_MS)
}

export function formatDueDate(value) {
  const distance = dayDistance(value)
  if (distance < 0) return `逾期 ${Math.abs(distance)} 天`
  if (distance === 0) return '今天截止'
  if (distance === 1) return '明天'
  const date = parseDateKey(value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function getDueGroup(value) {
  const distance = dayDistance(value)
  if (distance <= 0) return 'today'
  if (distance <= 3) return 'soon'
  return 'later'
}

export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (Boolean(a.done_at) !== Boolean(b.done_at)) return a.done_at ? 1 : -1
    if (!a.due_date && b.due_date) return 1
    if (a.due_date && !b.due_date) return -1
    return (a.due_date ?? '').localeCompare(b.due_date ?? '') || b.created_at.localeCompare(a.created_at)
  })
}
