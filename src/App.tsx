//TO RUN, TWO TERMINALS => npm run dev     npx json-server db.json --port 3001       

import { useEffect, useState } from 'react'
import './App.css'
import TaskCard from './components/TaskCard'
import { Status, statuses, Task } from './utils/data-tasks'
import { api } from './utils/api'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [currentlyHoveringOver, setCurrentlyHoveringOver] = useState<Status | null>(null)

  const columns = statuses.map((status) => {
    const tasksInColumn = tasks.filter((task) => task.status === status)
    return {
      status,
      tasks: tasksInColumn
    }
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await api.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (task: Task) => {
    // Optimistic update
    const previousTasks = [...tasks]
    const updatedTasks = tasks.map((t) => (t.id === task.id ? task : t))
    setTasks(updatedTasks)

    try {
      await api.updateTask(task)
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert on error
      setTasks(previousTasks)
    }
  }

  const deleteTask = async (id: string) => {
    // Optimistic update
    const previousTasks = [...tasks]
    const updatedTasks = tasks.filter(task => task.id !== id)
    setTasks(updatedTasks)

    try {
      await api.deleteTask(id)
    } catch (error) {
      console.error('Error deleting task:', error)
      // Revert on error
      setTasks(previousTasks)
    }
  }

  const addNewTask = async () => {
    if (newTaskTitle.trim() === '') return

    // Generate a temporary ID for optimistic update or wait for server response
    // Since json-server generates IDs, it's safer to wait for response to avoid ID conflicts or sync issues
    // But for better UX, we can show a valid loading state or just wait.
    // Let's wait for the server response to get the real ID to keep it simple and robust for this level.


    const newTaskPayload = {
      id: `TASK-${Date.now()}`, // Temporary ID, json-server might overwrite or we use this
      title: newTaskTitle,
      status: 'todo' as Status,
      priority: 'medium' as const, // Fix type inference
      points: 0
    }

    try {
      const createdTask = await api.addTask(newTaskPayload)
      setTasks(prev => [...prev, createdTask])
      setNewTaskTitle('')
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleDragEnter = (status: Status) => {
    setCurrentlyHoveringOver(status)
  }

  const handleDragLeave = () => {
    setCurrentlyHoveringOver(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault()
    setCurrentlyHoveringOver(null)
    const id = e.dataTransfer.getData("id")
    const task = tasks.find((task) => task.id === id)
    if (task) {
      updateTask({ ...task, status })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading tasks...</div>
  }

  return (
    <div className="p-4">
      {/* ADD NEW TASK FORM */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Add New Task</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter task title..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
          />
          <button
            onClick={addNewTask}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!newTaskTitle.trim()}
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="flex divide-x overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.status}
            onDrop={(e) => handleDrop(e, column.status)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => handleDragEnter(column.status)}
            onDragLeave={handleDragLeave}
            className={`flex-1 min-w-[300px] transition-colors duration-200 rounded-lg mx-2 ${currentlyHoveringOver === column.status ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-50'
              }`}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold capitalize text-gray-700">{column.status.replace('-', ' ')}</h2>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-semibold">
                {column.tasks.reduce((total, task) => total + (task?.points || 0), 0)} pts
              </span>
            </div>
            <div className="p-3 min-h-[500px]">
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
              {column.tasks.length === 0 && (
                <div className="text-center text-gray-400 mt-10 italic">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App