// shows a read-only log of every action taken in the systems
// DBA - full traceability of all changes

import { useEffect, useState } from 'react'
import { getAuditLogs } from '../api/audit'
import { Shield, Filter } from 'lucide-react'

// ---
// ACTION BADGE
// color codes deifferent action types
// ---

function ActionBadge({action}) {
    const colors = {
        user_created: 'bg-green-900 text-green-300',
        user_updated: 'bg-blue-900 text-blue-300',
        user_deleted: 'bg-red-900 text-red-300',
        task_created: 'bg-yellow-900 text-purple-300',
        task_updated: 'bg-yellow-900 text-yellow-300',
        task_deleted: 'bg-red-900 text-red-300',
    }

    const color = colors[action] || 'bg-gray-800 text-gray-300'

    return (
        <span className = {`px-2 py-2 rounded-full text-xs font-medium ${color}`}>
            { action.replace(/_/g, ' ') }   {/* replace underscores with spaces */}
        </span>
    )
}

// ---
// MAIN AUDITLOGS PAGE
// ---

function AuditLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    // filter by action type
    const [actionFilter, setActionFilter] = useState('')
    
    // fetch all auditlogs page load
    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async (action = '') => {
        try {
            // pass action filter if set, otherwise fetch all
            const params = action ? {action} : {}
            const res = await getAuditLogs(params)
            setLogs(res.data)
        } catch(error) {
            console.error('Failed to fetch audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    // when filter changes, re-fetch with new filters
    const handleFilterChange = (e) => {
        setActionFilters(e.target.value)
        fetchLogs(e.target.value)
    }

    // format timestamp intoreadable date + time
    const formatTime = (timestamp) => {
        // append 'Z' to tell js this is UTC time
        // postgresql returns timestamps without timezone info
        // which confuses windows browsers
        // PostgreSQL returns "2026-05-30 19:29:45.540011"
        // JavaScript needs "2026-05-30T19:29:45.540011Z"
        // So replace the space with T and add Z for UTC
        const normalized = timestamp.replace(' ', 'T') + 'Z' 
        return new Date(normalized).toLocaleString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div className = "flex items-center justify-center h-64">
                <p className = "text-gray-400">Loading audit logs...</p>
            </div>
        )
    }

    return (
        <div className = "space-y-4">

            {/* header */}
            <div className = "flex justify-between items-center">
                <div className = "flex items-center gap-3">
                    <Shield size = {20} className = "text-blue-400"/>

                    <div>
                        <h2 className = "text-lg font-semibold text-white">Audit Logs</h2>
                        <p className = "text-sm text-gray-400">{ logs.length } records - newest first</p>
                    </div>
                </div>
            </div>

            {/* info banner explaining what audit logs are */}
            <div className = "bg-blue-900/20 border border-blue-800 rounded-xl p-4">
                <p className = "text-blue-300 text-sm">
                    Auidit logs are <span classname = "font-semibold">read-only</span> and automatically recorded.
                    Every create, update, and delete action is tracked here for accountability and traceability.
                </p>
            </div>

            {/* filter row */}
            <div className = "flex gap-3 items-center">
                <Filter size = {16} className = "text-gray-400" />

                <select
                    value = { actionFilter }
                    onChange = { handleFilterChange }
                    className = "bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value = "">All Actions</option>
                    <option value = "user_created">User Created</option>
                    <option value = "user_updated">User Updated</option>
                    <option value = "user_deleted">User Deleted</option>
                    <option value = "task_created">Task Created</option>
                    <option value = "task_updated">Task Updated</option>
                    <option value = "task_deleted">Task Deleted</option>
                </select>
            </div>

            {/* auditlogs table */}
            <div className = "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className = "w-full text-sm">
                    <thead>
                        <tr className = "border-b border-gray-800 text-gray-400">
                            <th className = "text-left px-6 py-3">Action</th>
                            <th className = "text-left px-6 py-3">Detail</th>
                            <th className = "text-left px-6 py-3">User ID</th>
                            <th className = "text-left px-6 py-3">Task ID</th>
                            <th className = "text-left px-6 py-3">Timestamp</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan = {5} className = "text-center py-8 text-gray-600">No logs found</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key = { log.id } className = "border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                    
                                    <td className = "px-6 py-4">
                                        <ActionBadge action = { log.action }/>
                                    </td>
                                
                                    <td className = "px-6 py-4 text-gray-400 max-w-sm">
                                        {/* truncate long detial text */}
                                        <span className = "truncate block">{ log.detail || '-' }</span>
                                    </td>

                                    <td className = "px-6 py-4 text-gray-400">
                                        { log.user_id || '-' }
                                    </td>

                                    <td className = "px-6 py-4 text-gray-400">
                                        { log.task_id || '-' }
                                    </td>

                                    <td className = "px-6 py-4 text-gray-400 whitespace-nowrap">
                                        { formatTime(log.timestamp) }
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
        </div>
    )
}

export default AuditLogs
