// this is the root component of our React 
// react router lives here - it controls which page shows based on the current URL

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Tasks from './pages/Tasks'
import AuditLogs from './pages/AuditLogs'
import AIChat from './pages/AIChat'

function App() {
  return (
    <BrowserRouter>
      {/* main layout - sidebar on left, content on right */}
      <div className="flex min-h-screen bg-gray-950">

        <Sidebar/>

        {/* topbar & content */}
        <div className = "flex-1 flex flex-col">

          <Topbar title = "Overview"/>

          {/* page content */}
          <main className = "flex-1 p-6">
            <Routes>
              <Route path="/" element = {<Dashboard/>}/>
              <Route path="/users" element = {<Users/>}/>
              <Route path="/tasks" element = {<Tasks/>}/>
              <Route path="/audit" element = {<AuditLogs/>}/>
              <Route path="/chat" element = {<AIChat/>}/>
            </Routes>
          </main>

        </div>
        
      </div>
    </BrowserRouter>
  )
}

export default App