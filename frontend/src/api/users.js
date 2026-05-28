 // all API calls related to users
 // each function maps to one backend route

 import api from './client'

 // GET /users - fetch all users
 export const getUsers = () => api.get('/users')

 // GET/users/:id - fetch one user
 export const getUser = (id) => api.get('/users/${id}')

 // POST /users - create a new user
 export const createUser = (data) => api.post('/users/', data)

 // PUT /users/:id - update a user
 export const updateUser = (id, data) => api.put('/users/${id}', data)

 // DELETE /users/:id - delete a user
 export const deleteUser = (id) => api.delete('/users/${id}')
