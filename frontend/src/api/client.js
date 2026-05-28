//  src/api/clientInformation.js
// this is our API client - a configured axios instance
// Instead of typing https://localhost:8000 everywhere, we just import this and use it directly

import axios from 'axios'

// create axios instance with our backend URL as the base
const api = axios.create ({
    baseURL: 'http//localhost:8000', // our FastAPI backend
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api
