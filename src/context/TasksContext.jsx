import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user || !supabase) return
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    setLoading(false)
    if (queryError) setError(queryError.message)
    else {
      setTasks(data ?? [])
      setError('')
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addTask = useCallback(
    async (task) => {
      const { data, error: mutationError } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single()
      if (mutationError) throw mutationError
      setTasks((current) => [data, ...current])
      return data
    },
    [user],
  )

  const toggleTask = useCallback(async (task) => {
    const done_at = task.done_at ? null : new Date().toISOString()
    const { data, error: mutationError } = await supabase
      .from('tasks')
      .update({ done_at })
      .eq('id', task.id)
      .select()
      .single()
    if (mutationError) throw mutationError
    setTasks((current) => current.map((item) => (item.id === task.id ? data : item)))
  }, [])

  const updateTask = useCallback(async (id, updates) => {
    const { data, error: mutationError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (mutationError) throw mutationError
    setTasks((current) => current.map((item) => (item.id === id ? data : item)))
    return data
  }, [])

  const deleteTask = useCallback(async (id) => {
    const { error: mutationError } = await supabase.from('tasks').delete().eq('id', id)
    if (mutationError) throw mutationError
    setTasks((current) => current.filter((task) => task.id !== id && task.parent_id !== id))
  }, [])

  const value = useMemo(
    () => ({ tasks, loading, error, refresh, addTask, updateTask, toggleTask, deleteTask }),
    [tasks, loading, error, refresh, addTask, updateTask, toggleTask, deleteTask],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks 必须在 TasksProvider 中使用')
  return context
}
