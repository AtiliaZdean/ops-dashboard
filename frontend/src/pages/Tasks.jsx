// shows all tasks in a table
// allows creating, editing, deleting n filtering tasks

import { useEffect, useState } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import { getUsers } from '../api/users'
import { Plus, Pencil, Trash2, X, Filter } from 'lucide-react'

// ---
// MODAL COMPONENT
// reusable popup for create/edit forms
// ---

function Modal({ title, onClose, children }) {
    return (
        // dark overlay behind the modal
        <div className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className = "bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
                {/* modal header */}
                <div className = "flex justify-between items-center mb-4">
                    <h3 className = "text-lg font-semibold text-white">{title}</h3>

                    <button onClick = {onClose} className = "text-gray-400 hover:text-white">
                        <X size = {20}/>
                    </button>
                </div>

                {children}
            </div>
        </div>
    )
}

// ---
// TASK FORM COMPONENT
// reused for both create and edit
// ---

function TaskForm({ initial = {}, users = [], onSubmit, onClose }) {
    //pre fill form if editing, empty if creating
    const [form, setForm] = useState({
        title: initial.title || '',
        description: initial.description || '',
        priority: initial.priority || 'medium',
        status: initial.status || 'pending',
        assigned_to: initial.assigned_to || '',
        due_date: initial.due_date ? initial.due_date.slice(0, 16) : ''
        // slice(0, 16) formats datetime for the input field e.g. "2026-05-30T10:00"
    })

    // update form state when any field changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        // clean up the form before sending
        // convert empty strings to null so backend accepts them
        const payload = {
            ...form,
            assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
            due_date: form.due_date ? form.due_date : null,
        }
        onSubmit(payload)
    }

    return (
        <div className = "space-y-4">

            {/* title */}
            <div>
                <label className = "text-sm text-gray-400 block mb-1">Task Title</label>

                <input
                    name = "title"
                    value = {form.title}
                    onChange = {handleChange}
                    className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder = "e.g. Prepare monthly report"
                />
            </div>

            {/* description */}
            <div>
                <label className = "text-sm text-gray-400 block mb-1">Description</label>

                <textarea
                    name = "description"
                    value = {form.description}
                    onChange = {handleChange}
                    rows = {3}
                    className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder = "e.g. Optional details..."
                />
            </div>

            {/* priority n status side by side */}
            <div className = "grid grid-cols-2 gap-3">

                <div>
                    <label className = "text-sm text-gray-400 block mb-1">Priority</label>

                    <select
                        name = "priority"
                        value = {form.priority}
                        onChange = {handleChange}
                        className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value = "low">Low</option>
                        <option value = "medium">Medium</option>
                        <option value = "high">High</option>
                    </select>
                </div>

                <div>
                    <label className = "text-sm text-gray-400 block mb-1">Status</label>

                    <select
                        name = "status"
                        value = {form.status}
                        onChange = {handleChange}
                        className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value = "pending">Pending</option>
                        <option value = "in_progress">In Progress</option>
                        <option value = "completed">Completed</option>
                        <option value = "overdue">Overdue</option>
                    </select>
                </div>

            </div>

            {/* assign to user */}
            <div>
                <label className = "text-sm text-gray-400 block mb-1">Assign To</label>

                <select
                    name = "assigned_to"
                    value = {form.assigned_to}
                    onChange = {handleChange}
                    className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value = "">Unassigned</option>
                    {/* populate dropdown with real users from database */}
                    { users.map(user => (
                        <option key = { user.id } value = { user.id }>{ user.name }</option>
                    ))}
                </select>
            </div>

            {/* due date */}
            <div>
                <label className = "text-sm text-gray-400 block mb-1">Due Date</label>

                <input
                    type = "datetime-local"
                    name = "due_date"
                    value = {form.due_date}
                    onChange = {handleChange}
                    className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* action buttons */}
            <div className = "flex gap-2 pt-2">
                <button
                    onClick = { handleSubmit }
                    className = "flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors"
                >Save</button>

                <button
                    onClick = { onClose }
                    className = "flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 rounded-lg transition-colors"
                >Cancel</button>
            </div>

        </div>
    )
}

// ---
// BADGE HELPERS
// returns tailwind classes based on value
// ---

function statusBadge(status) {
    const colors = {
        pending: 'bg-yellow-900 text-yellow-300',
        in_progress: 'bg-blue-900 text-blue-300',
        completed: 'bg-green-900 text-green-300',
        overdue: 'bg-red-900 text-red-300',
    }

    return colors[status] || 'bg-gray-800 text-gray-300'
}

function priorityBadge(priority) {
    const colors = {
        low: 'bg-gray-800 text-gray-300',
        medium: 'bg-yellow-900 text-yellow-300',
        high: 'bg-red-900 text-red-300',
    }

    return colors[priority] || 'bg-gray-800 text-gray-300'
}

// ---
// MAIN TASKS PAGE
// ---

function Tasks() {
    const [tasks, setTasks] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false) // control create modal
    const [editTask, setEditTask] = useState(null)  // stores tasks being edited

    // filter state - these get sent to the backend as query params
    const [filters, setFilters] = useState ({
        status: '',
        priority: '',
    })
    
    // fetch all tasks and users on page load
    useEffect(() => {
        fetchUsers()
        fetchTasks()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await getUsers()
            setUsers(res.data)
        } catch(error) {
            console.error('Failed to fetch users:', error)
        }
    }

    const fetchTasks = async (activeFilters = {}) => {
        try {
            // remove empty filter value before sending
            const params = Object.fromEntries (
                Object.entries(activeFilters).filter(([_, v]) => v !== '')
            )
            const res = await getTasks(params)
            setTasks(res.data)
        } catch(error) {
            console.error('Failed to fetch tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    // when filter changes, re-fetch with new filters
    const handleFilterChange = (e) => {
        const newFilters = { ...filters, [e.target.name]: e.target.value }
        setFilters(newFilters)
        fetchTasks(newFilters)
    }

    // create a new task
    const handleCreate = async(form) => {
        try {
            await createTask(form)
            setShowCreate(false)
            fetchTasks(filters)    // refresh the list
        } catch(error) {
            alert('Error: ' + (error.response?.data?.detail || error.message))
        }
    }

    // update an existing task
    const handleUpdate = async(form) => {
        try {
            await updateTask(editTask.id, form)
            setEditTask(null)
            fetchTasks(filters)    // refresh the list
        } catch(error) {
            alert('Error: ' + (error.response?.data?.detail || error.message))
        }
    }

    // delete a task with confirmation
    const handleDelete = async(task) => {
        if (!window.confirm(`Delete ${task.title}? This cannot be undone.`)) return
        try {
            await deleteTask(task.id)
            fetchTasks(filters)    // refresh the list
        } catch(error) {
            alert('Error: ' + (error.response?.data?.detail || error.message))
        }
    }

    // helper to find username by id
    const getUserName = (id) => {
        const user = users.find(u => u.id === id)
        return user ? user.name : '-'
    }

    if (loading) {
        return (
            <div className = "flex items-center justify-center h-64">
                <p className = "text-gray-400">Loading tasks...</p>
            </div>
        )
    }

    return (
        <div className = "space-y-4">

            {/* header */}
            <div className = "flex justify-between items-center">
                <div>
                    <h2 className = "text-lg font-semibold text-white">Tasks</h2>
                    <p className = "text-sm text-gray-400">{tasks.length} total tasks</p>
                </div>

                <button
                    onClick = { () => setShowCreate(true) }
                    className = "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size = {16}/> Add Task
                </button>
            </div>

            {/* filters row */}
            <div className = "flex gap-3 items-center">
                <Filter size = {16} className = "text-gray-400" />

                <select
                    name = "status"
                    value = { filters.status }
                    onChange = { handleFilterChange }
                    className = "bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value = "">All Statuses</option>
                    <option value = "pending">Pending</option>
                    <option value = "in_progress">In Progress</option>
                    <option value = "completed">Completed</option>
                    <option value = "overdue">Overdue</option>
                </select>

                <select
                    name = "priority"
                    value = { filters.priority }
                    onChange = { handleFilterChange }
                    className = "bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value = "">All Priorities</option>
                    <option value = "low">Low</option>
                    <option value = "medium">Medium</option>
                    <option value = "high">High</option>
                </select>
            </div>

            {/* tasks table */}
            <div className = "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className = "w-full text-sm">
                    <thead>
                        <tr className = "border-b border-gray-800 text-gray-400">
                            <th className = "text-left px-6 py-3">Title</th>
                            <th className = "text-left px-6 py-3">Status</th>
                            <th className = "text-left px-6 py-3">Priority</th>
                            <th className = "text-left px-6 py-3">Assigned To</th>
                            <th className = "text-left px-6 py-3">Due Date</th>
                            <th className = "text-left px-6 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan = {6} className = "text-center py-8 text-gray-600">No tasks found</td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key = { task.id } className = "border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                    
                                    <td className = "px-6 py-4">
                                        <p className = "text-white font-medium">{ task.title }</p>
                                        {/* show description preview if it exists */}
                                        {task.description && (
                                            <p className = "text-gray-500 text-xs mt-0.5 truncate max-w-xs">{ task.description }</p>
                                        )}
                                    </td>

                                    <td className = "px-6 py-4">
                                        <span className = {`px-2 py-1 rounded-full text-xs font-medium ${ statusBadge(task.status) }`}>
                                            { task.status.replaceAll('_', ' ')}
                                        </span>
                                    </td>

                                    <td className = "px-6 py-4">
                                        <span className = {`px-2 py-1 rounded-full text-xs font-medium ${ priorityBadge(task.priority) }`}>
                                            { task.priority }
                                        </span>
                                    </td>

                                    <td className = "px-6 py-4 text-gray-400">
                                        { task.assigned_to ? getUserName(task.assigned_to) : '-' }
                                    </td>

                                    <td className = "px-6 py-4 text-gray-400">
                                        { task.due_date ? new Date(task.due_date).toLocaleDateString('en-MY') : '-' }
                                        {/* { task.due_date ? new Date(task.due_date.replace(' ', 'T') + 'Z').toLocaleDateString('en-MY') : '-' } */}
                                    </td>

                                    <td className = "px-6 py-4">
                                        <div className = "flex gap-2">

                                            {/* edit button */}
                                            <button
                                                onClick = { () => setEditTask(task) }
                                                className = "p-1.5 rounded-lg bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Pencil size = {14} />
                                            </button>
                                            
                                            {/* delete button */}
                                            <button
                                                onClick = { () => handleDelete(task) }
                                                className = "p-1.5 rounded-lg bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Trash2 size = {14} />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* create task modal */}
            { showCreate && (
                <Modal title = "Add New Task" onClose = { () => setShowCreate(false) }>
                    <TaskForm users = {users} onSubmit = { handleCreate } onClose = { () => setShowCreate(false) }/>
                </Modal>
            ) }

            {/* edit task modal */}
            { editTask && (
                <Modal title = "Edit Task" onClose = { () => setEditTask(null) }>
                    <TaskForm initial = { editTask } users = {users} onSubmit = { handleUpdate } onClose = { () => setEditTask(null) }/>
                </Modal>
            ) }

        </div>
    )
}

export default Tasks
