// the main overview page
// show stats cards and charts at a glance

import { useEffect, useState } from 'react'
import { getTaskStats } from '../api/tasks'
import { getAuditSummary } from '../api/audit'
import { getUsers } from '../api/users'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
    CheckSquare,
    Clock,
    AlertTriangle,
    Users,
    TrendingUp
} from 'lucide-react'

// ---
// STAT CARD COMPONENT
// reusable card for showing a single number
// ---

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className = "bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
            {/* icon circle with dynamic color */}
            <div className = { `w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size = {22} className = "text-white"/>
            </div>
            <div>
                <p className = "text-sm text-gray-400">{label}</p>
                <p className = "text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    )
}

// ---
// MAIN DASHBOARD COMPONENT
// ---

function Dashboard() {
    // state to store our fetched data
    const [stats, setStats] = useState(null)
    const [auditSummary, setAuditSummary] = useState([])
    const [userCount, setUserCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // useEffect run when the component first load
    // we use it to fetch data from our backend
    useEffect (() => {
        const fetchData = async() => {
            try {
                // Fetch all data in parallel for speed
                const [statsRes, auditRes, usersRes] = await Promise.all ([
                    getTaskStats(),
                    getAuditSummary(),
                    getUsers()
                ])

                setStats(statsRes.data)
                // console.log('stats:', statsRes.data)
                // console.log('users:', usersRes.data)
                // console.log('audit:', auditRes.data)
                setUserCount(usersRes.data.length)

                // convert audit summary ovject into array for recharts
                // e.g { task_created: 5 } becomes [{ action: "task_created", count: 5 }]
                const auditArray = Object.entries(auditRes.data).map(([action, count]) => ({
                    action: action.replace('_', ' '),
                    count
                }))
                setAuditSummary(auditArray)

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
                alert('Error: ' + error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])  // empty array means run once on mount

    // show loading state while fetching
    if(loading) {
        return (
            <div className = "flex items-center justify-center h-64">
                <p className = "text-gray-400">Loading dashboard...</p>
            </div>
        )
    }

    // colors for the bar charts bar
    const barColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    return (
        <div className = "space-y-6">

            {/* STAT CARDS ROW */}
            <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <StatCard
                    label = "Total Tasks"
                    value = {stats?.total ?? 0}
                    icon = {CheckSquare}
                    color = "bg-blue-600"
                />

                <StatCard
                    label = "Completion Rate"
                    value = {`${ stats?.completion_rate ?? 0 }%`}
                    icon = {TrendingUp}
                    color = "bg-green-600"
                />

                <StatCard
                    label = "Pending Tasks"
                    value = {stats?.pending ?? 0}
                    icon = {Clock}
                    color = "bg-yellow-600"
                />

                <StatCard
                    label = "Total Users"
                    value = {userCount}
                    icon = {Users}
                    color = "bg-purple-600"
                />

            </div>

            {/* SECOND ROW */}
            <div className = "grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* task status breakdown */}
                <div className = "bg-gray-900 border border-gray-800 rounded-xl p-5">

                    <h3 className = "text-sm font-semibold text-gray-400 mb-4">Task Status Breakdown</h3>

                    <div className = "space-y-3">
                        {/* each status with a progress bar */}
                        {[
                            {label: 'Pending', value: stats?.pending, color: 'bg-yellow-500'},
                            {label: 'In Progress', value: stats?.in_progress, color: 'bg-blue-500'},
                            {label: 'Completed', value: stats?.completed, color: 'bg-green-500'},
                            {label: 'Overdue', value: stats?.overdue, color: 'bg-red-500'},
                        ].map(({ label, value, color }) => (
                            <div key = {label}>

                                <div className = "flex justify-between text-sm mb-1">
                                    <span className = "text-gray-400">{label}</span>
                                    <span className = "text-white font-medium">{value}</span>
                                </div>

                                <div className = "w-full bg-gray-800 rounded-full h-2">
                                    <div
                                        className = {`${color} h-2 rounded-full transition-all`}
                                        // width is percentage of total tasks
                                        style = {{ width: `${stats?.total ? (value / stats.total) * 100 : 0}%`}}
                                    />
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* audit activity chart */}
                <div className = "bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h3 className = "text-sm font-semibold text-gray-400 mb-4">System Activity</h3>

                    {auditSummary.length === 0 ? (
                        <p className = "text-gray-600 text-sm">No activity yet</p>
                    ) : (
                        <ResponsiveContainer width = "100%" height = {180}>
                            <BarChart data = { auditSummary }>

                                <XAxis
                                    dataKey = "action"
                                    tick = {{ fill: '#9ca3af', fontSize: 11 }}
                                    axisLine = {false}
                                />

                                <YAxis
                                    tick = {{ fill: '#9ca3af', fontSize: 11 }}
                                    axisLine = {false}
                                />

                                <Tooltip
                                    contentStyle = {{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    labelStyle = {{ color: '#fff' }}
                                />

                                <Bar dataKey = "count" radius = {[4, 4, 0, 0]}>
                                    {auditSummary.map((_, index) => (
                                        <Cell key = {index} fill = { barColors[index % barColors.length] }/>
                                    ))}
                                </Bar>

                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* OVERDUE ALERT */}
            {stats?.overdue > 0 && (
                <div className= "bg-red-900/30 border border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle size = {20} className = "text-red-400"/>
                    <p className = "text-red-300 text-sm">
                        You have <span className = "font-bold">{ stats.overdue }</span> overdue task{ stats.overdue > 1 ? 's' : '' } that need attention.
                    </p>
                </div>
            )}

        </div>
    )
}

export default Dashboard
