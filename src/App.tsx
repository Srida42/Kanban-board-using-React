import { useEffect, useState } from 'react'
import './App.css'
import TaskCard from './components/TaskCard'
import { Status, statuses, Task } from './utils/data-tasks'

const API_BASE_URL = 'http://localhost:5000'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [currentlyHoveringOver, setCurrentlyHoveringOver] = useState<Status | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Map MongoDB _id to id for frontend compatibility
      const mappedTasks = data.map((task: any) => ({
        ...task,
        id: task._id || task.id
      }))
      setTasks(mappedTasks)
    } catch (err: any) {
      setError(`Failed to fetch tasks: ${err.message}`)
      console.error('Error fetching tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (task: Task) => {
    try {
      // Send only the necessary fields to backend
      const taskToUpdate = {
        title: task.title,
        status: task.status,
        priority: task.priority,
        points: task.points || 0
      }
      
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskToUpdate)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const updatedTaskFromServer = await response.json()
      
      // Update local state with server response
      const updatedTasks = tasks.map((t) => {
        if (t.id === task.id) {
          return { ...updatedTaskFromServer, id: updatedTaskFromServer._id || updatedTaskFromServer.id }
        }
        return t
      })
      setTasks(updatedTasks)
    } catch (err) {
      console.error('Error updating task:', err)
      // Re-fetch tasks to ensure consistency
      fetchTasks()
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const updatedTasks = tasks.filter(task => task.id !== id)
      setTasks(updatedTasks)
    } catch (err) {
      console.error('Error deleting task:', err)
      fetchTasks()
    }
  }

  const addNewTask = async () => {
    if (newTaskTitle.trim() === '') return
    
    try {
      const newTask = {
        title: newTaskTitle,
        status: 'todo' as Status,
        priority: 'medium' as Priority,
        points: 0
      }
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const createdTask = await response.json()
      
      // Add the new task to local state with proper ID mapping
      setTasks([...tasks, { ...createdTask, id: createdTask._id || createdTask.id }])
      setNewTaskTitle('')
    } catch (err) {
      console.error('Error creating task:', err)
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
      updateTask({...task, status})
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2 text-red-600">Connection Error</h2>
          <p className="mb-4">{error}</p>
          <p className="mb-2">Please ensure:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Backend server is running on port 5000</li>
            <li>MongoDB is running locally</li>
            <li>No CORS restrictions are blocking the request</li>
          </ul>
          <button
            onClick={fetchTasks}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
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
      
      <div className="flex divide-x">
        {columns.map((column) => (
          <div
            key={column.status}
            onDrop={(e) => handleDrop(e, column.status)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => handleDragEnter(column.status)}
            onDragLeave={handleDragLeave}
            className="flex-1 min-w-[280px] overflow-hidden"
          >
            <div className="flex justify-between text-3xl p-2 font-bold text-gray-500">
              <h2 className="capitalize truncate">{column.status}</h2>
              <div className="whitespace-nowrap">
                {column.tasks.reduce((total, task) => total + (task?.points || 0), 0)}
              </div>
            </div>
            <div className={`min-h-[500px] p-2 overflow-x-auto ${currentlyHoveringOver === column.status ? 'bg-gray-100' : ''}`}>
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App