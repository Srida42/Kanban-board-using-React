import { useState } from 'react'
import { Task, Priority } from '../utils/data-tasks'

const lowPriorityIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9l7 7 7-7" />
</svg>
const mediumPriorityIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 14h14" />
</svg>
const highPriorityIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
</svg>

const deleteIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>

const TaskCard = ({task, updateTask, deleteTask}: {
  task: Task
  updateTask: (task: Task) => void
  deleteTask: (id: string) => void
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const points = task.points || 0
  const priority = task.priority || 'medium'
  
  // Points update logic - linear 0 to 20
  const updatePoints = (direction: 'up' | 'down') => {
    if (direction === 'up' && points < 20) {
      updateTask({...task, points: points + 1})
    } else if (direction === 'down' && points > 0) {
      updateTask({...task, points: points - 1})
    }
  }

  // Handle priority change
  const changePriority = (newPriority: Priority) => {
    updateTask({...task, priority: newPriority})
    setShowPriorityMenu(false)
  }

  // Get priority icon
  const getPriorityIcon = () => {
    if (priority === 'high') return highPriorityIcon
    if (priority === 'medium') return mediumPriorityIcon
    if (priority === 'low') return lowPriorityIcon
    return mediumPriorityIcon
  }

  // Get priority color
  const getPriorityColor = () => {
    if (priority === 'high') return 'bg-red-50 border-red-200 text-red-700'
    if (priority === 'medium') return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    if (priority === 'low') return 'bg-blue-50 border-blue-200 text-blue-700'
    return 'bg-gray-50 border-gray-200 text-gray-700'
  }

  // Get priority text
  const getPriorityText = () => {
    if (priority === 'high') return 'High'
    if (priority === 'medium') return 'Medium'
    if (priority === 'low') return 'Low'
    return 'Medium'
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("id", task.id)
      }}
      className="border-2 rounded-xl px-6 py-4 m-3 bg-white w-90 shadow-md hover:shadow-lg transition-all duration-200 relative"
    >
      {/* Task Title */}
      <div className="text-lg font-semibold mb-3">
        {isEditingTitle ? (
          <input
            autoFocus
            className="w-full border-2 rounded-lg px-3 py-2 text-lg"
            onBlur={() => setIsEditingTitle(false)}
            value={task.title}
            onChange={(e) => updateTask({...task, title: e.target.value})}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
          />
        ) : (
          <div 
            onClick={() => setIsEditingTitle(true)}
            className="cursor-pointer hover:text-blue-700 py-2 min-h-[2.5rem] flex items-center"
          >
            {task.title}
          </div>
        )}
      </div>
      
      {/* Bottom section */}
      <div className="flex justify-between items-center pt-3 text-gray-700 text-base border-t-2">
        <div className="flex items-center gap-3">
          {/* Task ID */}
          <div className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg border">
            {task.id.split('-').pop()}
          </div>
          
          {/* Priority Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getPriorityColor()} hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center gap-2">
                {getPriorityIcon()}
                <span className="font-medium">{getPriorityText()}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Priority Dropdown Menu */}
            {showPriorityMenu && (
              <div className="absolute left-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => changePriority('high')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-700 text-white transition-colors"
                  >
                    <div className="text-red-400">{highPriorityIcon}</div>
                    <span className="font-medium">High Priority</span>
                  </button>
                  <button
                    onClick={() => changePriority('medium')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-700 text-white transition-colors"
                  >
                    <div className="text-yellow-400">{mediumPriorityIcon}</div>
                    <span className="font-medium">Medium Priority</span>
                  </button>
                  <button
                    onClick={() => changePriority('low')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-700 text-white transition-colors"
                  >
                    <div className="text-blue-400">{lowPriorityIcon}</div>
                    <span className="font-medium">Low Priority</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Delete button */}
          <div 
            onClick={() => deleteTask(task.id)}
            className="cursor-pointer hover:text-red-600 ml-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Delete task"
          >
            {deleteIcon}
          </div>
        </div>
        
        {/* Points section */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => updatePoints('down')}
            className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold transition-colors"
            disabled={points === 0}
          >
            −
          </button>
          <div className="font-bold text-xl w-10 text-center">{points}</div>
          <button 
            onClick={() => updatePoints('up')}
            className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold transition-colors"
            disabled={points === 20}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Close menu when clicking outside */}
      {showPriorityMenu && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowPriorityMenu(false)}
        />
      )}
    </div>
  )
}

export default TaskCard