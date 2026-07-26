import { LoaderCircle } from 'lucide-react'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import { useAuth } from './context/AuthContext'
import { TasksProvider } from './context/TasksContext'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-indigo-500">
        <LoaderCircle className="animate-spin" aria-label="正在加载" />
      </main>
    )
  }

  if (!user) return <AuthPage />

  return (
    <TasksProvider>
      <Dashboard />
    </TasksProvider>
  )
}
