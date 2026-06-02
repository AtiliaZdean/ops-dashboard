// ai chatbox that answers questions about the database
// user types a question, system send it to the backend,
// backend fetch real data from psql n ask groq
// groq answers based on actual data

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Bot, User, Send, Loader } from 'lucide-react'

// ---
// MESSAGE BUBBLE COMPONENT
// renders a single chat message
// diff style for user vs ai messages
// ---

function MessageBubble({message}) {
    const isUser = message.role === 'user'

    return (
        <div className = { `flex gap-3 ${ isUser ? 'flex-row-reverse' : 'flex-row' }` }>
            
            {/* avatar icon */}
            <div className = { `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUser ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
                { isUser ? <User size = {16}/> : <Bot size = {16}/> }
            </div>

            {/* message bubble */}
            <div className = { `max-w-xl px-4 py-3 rounded-2xl text-sm  leading-relaxed ${
                isUser ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-600 text-gray-200 rounded-tl-none'
            }`}>
                {/* render new lines properly */}
                { message.content.split('\n').map((line, i) => (
                    <span key = {i}>
                        {line}
                        { i < message.content.split('\n').length - 1 && <br/> }
                    </span>
                )) }
            </div>

        </div>
    )
}

// ---
// SUGGESTED QUESTIONS
// helps users know what to ask
// ---

const suggestions = [
    "How many tasks are pending?",
    "Who are the current users?",
    "What is the task completion rate?",
    "Are there any overdue tasks?",
    "Which tasks are high priority?",
    "Show me a summary of all activity",
]

// ---
// MAIN AI CHAT PAGE
// ---

function AIChat() {
    const [messages, setMessages] = useState([
        // welcome message from ai on page load
        {
            role: 'ai',
            content: "Hi! I'm your operation assistant. I have access to your datatbase and can answer questions about tasks, users, and system activity. What would you like to know?"
        }
    ])
    const [input,setInput] = useState('')
    const [loading, setLoading] = useState(false)
    // ref to auto-scroll to bottom when new messages arrive
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text) => {
        //use provided text (from suggestion click) or input field
        const question = text || input.trim()
        if (!question || loading) return
        
        // add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: question }])
        setInput('')
        setLoading(true)

        try {
            // send to the backend which will call groq
            const res = await axios.post('http://localhost:8000/chat/', {
                message: question
            })

            //add ai response to chat
            setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }])
        } catch (error) {
            // show error as a chat message
            setMessages(prev => [...prev, {
                role: 'ai',
                content: 'Sorry, I encountered an error. Please try again.'
            }])
            console.error('Chat error:', error)
        } finally {
            setLoading(false)
        }
    }

    // allow sending with Enter key while shift+enter for new line
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className = "flex flex-col h-[calc(100vh-8rem)]">

            {/* header */}
            <div className = "flex items-center gap-3 mb-4">

                <div className = "w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Bot size = {20}/>
                </div>

                <div>
                    <h2 className = "text-lg font-semibold text-white">AI Assistant</h2>

                    <p className = "text-xs text-gray-400">Powered by Groq - answers based on the live database</p>
                </div>
                
            </div>

            {/* chat messages area */}
            <div className = "flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                { messages.map((msg, index) => (
                    <MessageBubble key = {index} message = {msg}/>
                )) }

                {/* loading indicator while waiting for ai */}
                { loading && (
                    <div className = "flex gap-3">

                        <div className = "w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                            <Bot size = {16}/>
                        </div>

                        <div className = "bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none">
                            <Loader size = {16} className = "text-gray-400 animate-spin"/>
                        </div>

                    </div>
                ) }

                {/* invisible div at bottom for auto scroll */}
                <div ref = { bottomRef }/>
            </div>

            {/* suggested questions - only show when no conversation yet */}
            { messages.length === 1 && (
                <div className = "mb-4">
                    <p className = "text-xs text-gray-500 mb-2">Suggested questions:</p>

                    <div className = "flex flex-wrap gap-2">
                        { suggestions.map((s, i) => (
                            <button
                                key = {i}
                                onClick = { () => sendMessage(s) }
                                className = "text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                            >
                                {s}
                            </button>
                        )) }
                    </div>
                </div>
            ) }

            {/* input area */}
            <div className = "flex gap-3 items-end">
                <textarea
                    value = {input}
                    onChange = { (e) => setInput(e.target.value) }
                    onKeyDown = { handleKeyDown }
                    placeholder = "Ask anything about your operations..."
                    rows = {1}
                    className = "flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 resize-none"
                />

                <button
                    onClick = { () => sendMessage() }
                    disabled = { loading || !input.trim() }
                    className = "w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    <Send size = {16}/>
                </button>
            </div>

        </div>
    )
}

export default AIChat
