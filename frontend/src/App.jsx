// this is the root component of our React 
// react router lives here - it controls which page shows based on the current URL

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

function App() {
  return (
    <BrowserRouter>
      {/* main layout - sidebar on left, content on right */}
      <div className="flex min-h-screen bg-gray-950">

        <Sidebar/>

        {/* topbar & content */}
        <div className = "flex-1 flex flex-col">

          <Topbar title = "Dashboard"/>

          {/* page content */}
          <main className = "flex-1 p-6">
            <Routes>
              <Route path="/" element={<div className="text-white">Dashboard coming soon!</div>} />
            </Routes>
          </main>

        </div>
        
      </div>
    </BrowserRouter>
  )
}

export default App