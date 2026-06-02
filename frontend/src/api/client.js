//  src/api/clientInformation.js
// this is our API client - a configured axios instance
// Instead of typing https://localhost:8000 everywhere, we just import this and use it directly

import axios from 'axios'

// create axios instance with our backend URL as the base
const api = axios.create ({
    // when running in Docker, frontend and backend are separate containers
    // use environment variable to switch between dev and Docker URLs
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', // our FastAPI backend
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api
