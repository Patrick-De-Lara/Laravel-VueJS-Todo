import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Global auth state
const authState = ref<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
})

// Initialize auth state from localStorage
const initializeAuth = () => {
  const token = localStorage.getItem('auth_token')
  const userJson = localStorage.getItem('user')
  
  if (token && userJson) {
    authState.value.token = token
    authState.value.user = JSON.parse(userJson)
    authState.value.isAuthenticated = true
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

// Initialize on load
initializeAuth()

export function useAuth() {
  const user = computed(() => authState.value.user)
  const token = computed(() => authState.value.token)
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Login user
   */
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      })

      const { token: authToken, user: userData } = response.data
      
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      authState.value.token = authToken
      authState.value.user = userData
      authState.value.isAuthenticated = true
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, error: err.response?.data }
    } finally {
      loading.value = false
    }
  }

  /**
   * Register new user
   */
  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/api/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      // Store token and user
      const { token: authToken, user: userData } = response.data
      
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      authState.value.token = authToken
      authState.value.user = userData
      authState.value.isAuthenticated = true
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      return { success: false, error: err.response?.data }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      // Call logout API to revoke token
      if (authState.value.token) {
        await axios.post('/api/logout')
      }
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      authState.value.token = null
      authState.value.user = null
      authState.value.isAuthenticated = false
      
      delete axios.defaults.headers.common['Authorization']
      
      loading.value = false
    }
  }

  /**
   * Fetch current user from API
   */
  const fetchUser = async () => {
    if (!authState.value.token) return

    try {
      const response = await axios.get('/api/user')
      authState.value.user = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (err: any) {
      console.error('Failed to fetch user:', err)
      // If token is invalid, logout
      if (err.response?.status === 401) {
        await logout()
      }
    }
  }

  /**
   * Check if token is still valid
   */
  const checkAuth = async () => {
    if (!authState.value.token) {
      return false
    }

    try {
      await axios.get('/api/user')
      return true
    } catch (err: any) {
      if (err.response?.status === 401) {
        await logout()
      }
      return false
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    
    // Methods
    login,
    register,
    logout,
    fetchUser,
    checkAuth,
  }
}
