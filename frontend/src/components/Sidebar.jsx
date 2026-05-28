// the left side navigation menu
// shows on the every page - links to all sections of the dashboard

import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, // dashboard icon
    CheckSquare, // tasks icon
    Users, // users icon
    ScrollText, // audit log icon
    Bot // AI chatbot icon
} from 'lucide-react'

// navigation items - each maps to a page
const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/audit', icon: ScrollText, label: 'Audit Logs' },
    { to: '/chat', icon: Bot, label: 'AI Chat' },
]

function Sidebar() {
    return (
        <aside className = "w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
        
            {/*Logo / app name*/}
            <div className = "p-6 border-b border-gray-800">
                <h1 className = "text-xl font-bold text-white">Ops Dashboard</h1>
                <p className = "text-xs text-gray-500 mt-1">Internal Management</p>
            </div>

            {/*navigation links*/}
            <nav className = "flex-1 p-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key = {to}
                        to = {to}
                        end = { to === '/'} // "end prevents "/" from matching all routes
                        className = { ({ isActive }) =>
                            // tailwind classes change based on wether link is active
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${ isActive
                                ? 'bg-blue-600 text-white'  // active state
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'    // inactive
                            }`
                        }
                    >
                        <Icon size = {18}/>
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/*bottom section*/}
            <div className = "p-4 border-t border-gray-800">
                <p className = "text-xs text-gray-600 text-center">v1.0.0</p>
            </div>
        </aside>
    )
}

export default Sidebar
