// the top bar that shows the current page title and a few quick info items

function Topbar({title}) {
    // get current date to display
    const today = new Date().toLocaleDateString( 'en-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <header className = "h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">

            {/* page title - passed in as a prop from each page */}
            <h2 className = "text-lg font-semibold text-white">{title}</h2>

            {/* right side info */}
            <div className = "flex items-center gap-4">
                <span className = "text-sm text-gray-400">{today}</span>
                <div className = "w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                    A {/* placeholder for user avatar */}
                </div>
            </div>

        </header>
    )
}

export default Topbar
