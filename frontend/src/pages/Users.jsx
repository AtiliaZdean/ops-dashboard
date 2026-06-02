// shows all users in a table
// allows creating, editing n deleting users

import { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../api/users'
import { UserPlus, Pencil, Trash2, X, Check } from 'lucide-react'

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
// USER FORM COMPONENT
// reused for both create and edit
// ---

function UserForm({ initial = {}, onSubmit, onClose }) {
    //pre fill form if editing, empty if creating
    const [form, setForm] = useState({
        name: initial.name || '',
        email: initial.email || '',
        role: initial.role || 'worker'
    })

    // update form state when any field changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    return (
        <div className = "space-y-4">

            {/* name field */}
            <div>
                <label className = "text-sm text-gray-400 block mb-1">Full Name</label>

                <input
                    name = "name"
                    value = {form.name}
                    onChange = {handleChange}
                    className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder = "e.g. Alice Johnson"
                />
            </div>

            {/* email field */}
            <div>
                <label className = "text-sm text-gray-400 block mb-1">Email</label>

                <input
                    name = "email"
                    value = {form.email}
                    onChange = {handleChange}
                    className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder = "e.g. alice@company.com"
                />
            </div>

            {/* role dropdown */}
            <div>
                <label className = "text-sm text-gray-400 block mb-1">Role</label>

                <select
                    name = "role"
                    value = {form.role}
                    onChange = {handleChange}
                    className = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value = "manager">Manager</option>
                    <option value = "worker">Worker</option>
                    <option value = "admin">Admin</option>
                </select>
            </div>

            {/* action buttons */}
            <div className = "flex gap-2 pt-2">
                <button
                    onClick = { () => onSubmit(form) }
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
// MAIN USERS PAGE
// ---

function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false) // control create modal
    const [editUser, setEditUser] = useState(null)  // stores users being edited

    // fetch all users on page load
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await getUsers()
            setUsers(res.data)
        } catch(error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    // create a new user
    const handleCreate = async(form) => {
        try {
            await createUser(form)
            setShowCreate(false)
            fetchUsers()    // refresh the list
        } catch(error) {
            alert('Error: ' + (error.response?.data?.detail || error.message))
        }
    }

    // update an existing user
    const handleUpdate = async(form) => {
        try {
            await updateUser(editUser.id, form)
            setEditUser(null)
            fetchUsers()    // refresh the list
        } catch(error) {
            alert('Error: ' + (error.response?.data?.detail || error.message))
        }
    }

    // delete a user with confirmation
    const handleDelete = async(user) => {
        if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return
        try {
            await deleteUser(user.id)
            fetchUsers()    // refresh the list
        } catch(error) {
            alert('Error: ' + (error.response?.data?.detail || error.message))
        }
    }

    // role badge color
    const roleBadge = (role) => {
        const colors = {
            manager: 'bg-purple-900 text-purple-300',
            worker: 'bg-blue-900 text-blue-300',
            admin: 'bg-red-900 text-red-300'
        }

        return colors[role] || 'bg-gray-800 text-gray-300'
    }

    if (loading) {
        return (
            <div className = "flex items-center justify-center h-64">
                <p className = "text-gray-400">Loading users...</p>
            </div>
        )
    }

    return (
        <div className = "space-y-4">

            {/* header row with title n create button */}
            <div className = "flex justify-between items-center">
                <div>
                    <h2 className = "text-lg font-semibold text-white">Users</h2>
                    <p className = "text-sm text-gray-400">{users.length} total users</p>
                </div>

                <button
                    onClick = { () => setShowCreate(true) }
                    className = "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    <UserPlus size = {16}/> Add User
                </button>
            </div>

            {/* users table */}
            <div className = "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className = "w-full text-sm">
                    <thead>
                        <tr className = "border-b border-gray-800 text-gray-400">
                            <th className = "text-left px-6 py-3">Name</th>
                            <th className = "text-left px-6 py-3">Email</th>
                            <th className = "text-left px-6 py-3">Role</th>
                            <th className = "text-left px-6 py-3">Created</th>
                            <th className = "text-left px-6 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan = {5} className = "text-center py-8 text-gray-600">No users found</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key = { user.id } className = "border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                    
                                    <td className = "px-6 py-4 text-white font-medium">{ user.name }</td>

                                    <td className = "px-6 py-4 text-gray-400">{ user.email }</td>

                                    <td className = "px-6 py-4">
                                        <span className = { `px-2 py-1 rounded-full text-xs font-medium ${ roleBadge(user.role) }` }>
                                        { user.role }
                                        </span>
                                    </td>

                                    <td className = "px-6 py-4 text-gray-400">
                                        {/* format the date nicely */}
                                        { new Date(user.created_at).toLocaleDateString('en-MY') }
                                        {/* { new Date(user.created_at.replace(' ', 'T') + 'Z').toLocaleDateString('en-MY') } */}
                                    </td>

                                    <td className = "px-6 py-4">
                                        <div className = "flex gap-2">

                                            {/* edit button */}
                                            <button
                                                onClick = { () => setEditUser(user) }
                                                className = "p-1.5 rounded-lg bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Pencil size = {14} />
                                            </button>
                                            
                                            {/* delete button */}
                                            <button
                                                onClick = { () => handleDelete(user) }
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

            {/* create user modal */}
            { showCreate && (
                <Modal title = "Add New User" onClose = { () => setShowCreate(false) }>
                    <UserForm onSubmit = { handleCreate } onClose = { () => setShowCreate(false) }/>
                </Modal>
            ) }

            {/* edit user modal */}
            { editUser && (
                <Modal title = "Edit User" onClose = { () => setEditUser(null) }>
                    <UserForm initial = { editUser } onSubmit = { handleUpdate } onClose = { () => setEditUser(null) }/>
                </Modal>
            ) }

        </div>
    )
}

export default Users
