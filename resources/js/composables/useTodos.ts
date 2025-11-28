import { ref } from 'vue'
import axios from 'axios'

export interface Todo {
  id: number
  title: string
  description: string | null
  attachment: string | null
  is_completed: boolean
  user_id: number
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export function useTodos() {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTodos = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/todos')
      todos.value = response.data.todos
    } catch (err: any) {
      console.error('Failed to fetch todos:', err)
      error.value = 'Failed to fetch todos'
      if (err.response?.status === 401) {
        window.location.href = '/login'
      }
    } finally {
      loading.value = false
    }
  }

  const fetchTodo = async (id: number): Promise<Todo | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`/api/todos/${id}`)
      return response.data.todo
    } catch (err: any) {
      console.error('Failed to fetch todo:', err)
      error.value = 'Failed to fetch todo'
      if (err.response?.status === 401) {
        window.location.href = '/login'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const createTodo = async (data: { title: string; description: string; due_date: string; file: File | null }) => {
    console.log('Creating todo with data:', data)
    
    try {
      let response
      
      // Use FormData only if there's a file, otherwise use JSON
      if (data.file) {
        const formData = new FormData()
        formData.append('title', data.title)
        if (data.description) formData.append('description', data.description)
        if (data.due_date) formData.append('due_date', data.due_date)
        formData.append('attachment', data.file)

        console.log('Sending request with FormData to /api/todos')
        response = await axios.post('/api/todos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000 // Add 30 second timeout
        })
      } else {
        console.log('Sending request with JSON to /api/todos')
        response = await axios.post('/api/todos', {
          title: data.title,
          description: data.description || '',
          due_date: data.due_date || ''
        }, {
          timeout: 30000 // Add 30 second timeout
        })
      }
      
      console.log('Response received:', response.data)
      
      // Don't manually add to array - let the parent refetch
      // This prevents reactivity issues with computed properties
      
      return { success: true, todo: response.data.todo }
    } catch (err: any) {
      console.error('Create failed:', err)
      console.error('Error response:', err.response)
      
      // Handle timeout specifically
      if (err.code === 'ECONNABORTED') {
        return { 
          success: false, 
          errors: { general: ['Request timeout - please try again'] }
        }
      }
      
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: ['Failed to create todo'] }
      }
    }
  }

  const updateTodo = async (id: number, data: { title: string; description: string; due_date: string; file: File | null; is_completed?: boolean }) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      if (data.due_date) formData.append('due_date', data.due_date)
      if (data.file) formData.append('attachment', data.file)
      if (data.is_completed !== undefined) formData.append('is_completed', data.is_completed ? '1' : '0')
      formData.append('_method', 'PUT')

      const response = await axios.post(`/api/todos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      const index = todos.value.findIndex(t => t.id === id)
      if (index !== -1) {
        todos.value[index] = response.data.todo
      }
      
      return { success: true, todo: response.data.todo }
    } catch (err: any) {
      console.error('Failed to update todo:', err)
      error.value = 'Failed to update todo'
      return { success: false, errors: err.response?.data?.errors }
    } finally {
      loading.value = false
    }
  }

  const toggleComplete = async (todo: Todo) => {
    try {
      const response = await axios.put(`/api/todos/${todo.id}`, {
        is_completed: !todo.is_completed
      }, {
        timeout: 10000
      })
      
      const index = todos.value.findIndex(t => t.id === todo.id)
      if (index !== -1) {
        todos.value[index] = response.data.todo
      }
      
      return { success: true, todo: response.data.todo }
    } catch (err) {
      console.error('Failed to toggle todo:', err)
      error.value = 'Failed to update todo'
      return { success: false }
    }
  }

  const deleteTodo = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/todos/${id}`, {
        timeout: 10000
      })
      todos.value = todos.value.filter(t => t.id !== id)
      return { success: true }
    } catch (err) {
      console.error('Failed to delete todo:', err)
      error.value = 'Failed to delete todo'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const downloadAttachment = async (todoId: number) => {
    try {
      const response = await axios.get(`/api/todos/${todoId}/download`, {
        responseType: 'blob',
        timeout: 30000
      })
      
      // Extract filename from Content-Disposition header
      let filename = `attachment-${todoId}`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url) // Clean up
      return { success: true }
    } catch (err) {
      console.error('Failed to download attachment:', err)
      error.value = 'Failed to download attachment'
      return { success: false }
    }
  }

  return {
    todos,
    loading,
    error,
    fetchTodos,
    fetchTodo,
    createTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    downloadAttachment
  }
}