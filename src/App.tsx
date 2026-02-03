//TO RUN, TWO TERMINALS => npm run dev     npx json-server db.json --port 3001       

import { useEffect, useState } from 'react'
import './App.css'
import TaskCard from './components/TaskCard'
import { Status, statuses, Task } from './utils/data-tasks'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
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
    fetch('http://localhost:3001/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(data)
      })
  }, [])

  const updateTask = (task: Task) => {
    fetch(`http://localhost:3001/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })
    const updatedTasks = tasks.map((t) => {
      return t.id === task.id ? task : t
    })
    setTasks(updatedTasks)
  }

  const deleteTask = (id: string) => {
    fetch(`http://localhost:3001/tasks/${id}`, {
      method: 'DELETE'
    }).then(() => {
      const updatedTasks = tasks.filter(task => task.id !== id)
      setTasks(updatedTasks)
    })
  }

  const addNewTask = () => {
    if (newTaskTitle.trim() === '') return
    
    const taskNumber = tasks.length + 1
    const newTask: Task = {
      id: `TASK-${taskNumber}`, 
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      points: 0
    }
    
    fetch('http://localhost:3001/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    }).then(() => {
      setTasks([...tasks, newTask])
      setNewTaskTitle('')
    })
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
            className="flex-1 min-w-[280px] overflow-hidden" // Added min-w and overflow-hidden
          >
            <div className="flex justify-between text-3xl p-2 font-bold text-gray-500">
              <h2 className="capitalize truncate">{column.status}</h2> {/* Added truncate */}
              <div className="whitespace-nowrap"> {/* Prevent wrapping */}
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