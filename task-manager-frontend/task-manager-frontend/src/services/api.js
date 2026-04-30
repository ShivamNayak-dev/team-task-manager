import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// AUTH
export const signup = (data) => api.post('/api/auth/signup', data)
export const login = (data) => api.post('/api/auth/login', data)

// PROJECTS
export const getProjects = () => api.get('/api/projects')
export const getProject = (id) => api.get(`/api/projects/${id}`)
export const createProject = (data) => api.post('/api/projects', data)
export const updateProject = (id, data) => api.put(`/api/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/api/projects/${id}`)
export const addMember = (projectId, data) => api.post(`/api/projects/${projectId}/members`, data)
export const removeMember = (projectId, userId) => api.delete(`/api/projects/${projectId}/members/${userId}`)

// TASKS
export const getTasks = () => api.get('/api/tasks/my')
export const getTasksByProject = (projectId) => api.get(`/api/tasks/project/${projectId}`)
export const createTask = (data) => api.post('/api/tasks', data)
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data)
export const updateTaskStatus = (id, status) => api.patch(`/api/tasks/${id}/status?status=${status}`)
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`)

// DASHBOARD
export const getDashboard = () => api.get('/api/dashboard')

export default api
