 // all API calls related to tasks
 // each function maps to one backend route

 import api from './client'

 // GET /tasks - fetch all tasks, optional filters
 export const getTasks = (params) => api.get('/tasks/', { params })

 // GET/tasks/stats - fetch dashboard stats
 export const getTaskStats = () => api.get('/tasks/stats')

 // GET/tasks/:id - fetch one task
 export const getTask = (id) => api.get('/tasks/${id}')

 // POST /tasks - create a new task
 export const createTask = (data) => api.post('/tasks/', data)

 // PUT /tasks/:id - update a task
 export const updateTask = (id, data) => api.put('/tasks/${id}', data)

 // DELETE /tasks/:id - delete a task
 export const deleteTask = (id) => api.delete('/tasks/${id}')
