<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Head, Link, router } from '@inertiajs/vue3'
import { useTodos } from '../../composables/useTodos'
import { useTodoFilters } from '../../composables/useTodoFilters'
import { useTodoHelpers } from '../../composables/useTodoHelpers'
import { useAuth } from '../../composables/useAuth'
import TodoCreateModal from '../../components/TodoCreateModal.vue'
import TodoEditModal from '../../components/TodoEditModal.vue'
import TodoDeleteModal from '../../components/TodoDeleteModal.vue'

// State
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'completed' | 'overdue'>('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingTodo = ref<any>(null)
const showDeleteConfirm = ref(false)
const deletingTodoId = ref<number | null>(null)
const showUrgentDropdown = ref(false)
const isSubmitting = ref(false) // Add submitting state

const formErrors = ref<any>({})

// Composables
const { todos, loading, fetchTodos, createTodo, updateTodo, toggleComplete, deleteTodo, downloadAttachment } = useTodos()
const { urgentTodos, filteredTodos, stats } = useTodoFilters(todos, searchQuery, filterStatus)
const { formatDate, isOverdue, getDaysUntil, getAttachmentName } = useTodoHelpers()
const { user, logout, checkAuth } = useAuth()

// Notification system
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const showNotification = (message: string, type: 'success' | 'error') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

// Toggle todo completion
const handleToggleComplete = async (todo: any) => {
  const result = await toggleComplete(todo)
  if (result.success) {
    showNotification(
      todo.is_completed ? 'Todo marked as incomplete' : '✅ Todo completed!',
      'success'
    )
  } else {
    showNotification('Failed to update todo', 'error')
  }
}

// Create todo
const handleCreateTodo = async (data: { title: string; description: string; due_date: string; file: File | null }) => {
  if (isSubmitting.value) return // Prevent double submission
  
  isSubmitting.value = true
  formErrors.value = {}
  
  try {
    const result = await createTodo(data)
    
    if (result.success) {
      showCreateModal.value = false
      formErrors.value = {}
      showNotification('Todo created successfully!', 'success')
      
      // Refetch todos to avoid reactivity issues with computed properties
      await fetchTodos()
    } else {
      formErrors.value = result.errors || {}
      showNotification('Failed to create todo', 'error')
    }
  } catch (err) {
    console.error('Unexpected error in handleCreateTodo:', err)
    showNotification('An unexpected error occurred', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Open edit modal
const openEditModal = (todo: any) => {
  editingTodo.value = todo
  showEditModal.value = true
}

// Update todo
const handleUpdateTodo = async (data: { title: string; description: string; due_date: string; file: File | null }) => {
  if (!editingTodo.value || isSubmitting.value) return
  
  isSubmitting.value = true
  formErrors.value = {}
  
  try {
    const result = await updateTodo(editingTodo.value.id, data)
    if (result.success) {
      showEditModal.value = false
      editingTodo.value = null
      formErrors.value = {}
      showNotification('Todo updated successfully!', 'success')
    } else {
      formErrors.value = result.errors || {}
      showNotification('Failed to update todo', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Confirm delete
const confirmDelete = (todoId: number) => {
  deletingTodoId.value = todoId
  showDeleteConfirm.value = true
}

// Delete todo
const handleDeleteTodo = async () => {
  if (!deletingTodoId.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const result = await deleteTodo(deletingTodoId.value)
    if (result.success) {
      showDeleteConfirm.value = false
      deletingTodoId.value = null
      showNotification('Todo deleted successfully', 'success')
    } else {
      showNotification('Failed to delete todo', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Download attachment
const handleDownloadAttachment = async (todoId: number) => {
  const result = await downloadAttachment(todoId)
  if (!result.success) {
    showNotification('Failed to download attachment', 'error')
  }
}

// Logout handler
const handleLogout = async () => {
  await logout()
  showNotification('Logged out successfully', 'success')
  setTimeout(() => {
    window.location.href = '/login'
  }, 1000)
}

// Navigate to todo details
const viewTodoDetails = (todoId: number) => {
  router.visit(`/todos/${todoId}`)
}

// Check authentication on mount
onMounted(async () => {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    window.location.href = '/login'
    return
  }
  fetchTodos()
})

</script>

<template>
  <Head title="My Todos" />

  <div class="min-h-screen bg-gray-50">
    <!-- Global Loading/Submitting Overlay -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSubmitting || (loading && todos.length > 0)"
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 shadow-xl">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="text-gray-600 mt-4">{{ isSubmitting ? 'Saving...' : 'Processing...' }}</p>
        </div>
      </div>
    </Transition>

    <!-- Notification Toast -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="notification"
        class="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg"
        :class="{
          'bg-green-500 text-white': notification.type === 'success',
          'bg-red-500 text-white': notification.type === 'error'
        }"
      >
        {{ notification.message }}
      </div>
    </Transition>

    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">My To Do Application</h1>
            <p v-if="user" class="text-sm text-gray-600 mt-1">Welcome, {{ user.name }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="showCreateModal = true"
              :disabled="isSubmitting"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              New Todo
            </button>
            <button
              @click="handleLogout"
              class="px-5 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-blue-600 text-sm font-medium">Total</p>
            <p class="text-2xl font-bold text-blue-900">{{ stats.total }}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4">
            <p class="text-green-600 text-sm font-medium">Active</p>
            <p class="text-2xl font-bold text-green-900">{{ stats.active }}</p>
          </div>
          <div class="bg-purple-50 rounded-lg p-4">
            <p class="text-purple-600 text-sm font-medium">Completed</p>
            <p class="text-2xl font-bold text-purple-900">{{ stats.completed }}</p>
          </div>
          <div class="bg-red-50 rounded-lg p-4">
            <p class="text-red-600 text-sm font-medium">Overdue</p>
            <p class="text-2xl font-bold text-red-900">{{ stats.overdue }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Urgent Todos Alert -->
      <div v-if="urgentTodos.length > 0" class="mb-6">
        <div class="bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm overflow-hidden">
          <button
            @click="showUrgentDropdown = !showUrgentDropdown"
            class="w-full flex items-center justify-between p-5 hover:bg-red-100 transition cursor-pointer"
          >
            <div class="flex items-center">
              <svg class="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-lg font-semibold text-red-900">⚠️ Urgent: Due Soon ({{ urgentTodos.length }})</h3>
            </div>
            <svg
              :class="['w-5 h-5 text-red-500 transition-transform', showUrgentDropdown ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="showUrgentDropdown" class="px-5 pb-5 space-y-2">
              <div
                v-for="todo in urgentTodos"
                :key="'urgent-' + todo.id"
                class="bg-white rounded-lg p-4 border border-red-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-red-900">{{ todo.title }}</h4>
                    <p class="text-sm text-red-600 mt-1">
                      Due: {{ formatDate(todo.due_date!) }} ({{ getDaysUntil(todo.due_date!) }} days)
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="viewTodoDetails(todo.id)"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>
                    <button
                      @click="handleToggleComplete(todo)"
                      class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search todos..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Filter Buttons -->
          <div class="flex gap-2">
            <button
              @click="filterStatus = 'all'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition',
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              All
            </button>
            <button
              @click="filterStatus = 'active'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition',
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Active
            </button>
            <button
              @click="filterStatus = 'completed'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition',
                filterStatus === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Completed
            </button>
            <button
              @click="filterStatus = 'overdue'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition',
                filterStatus === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Overdue
            </button>
          </div>
        </div>
      </div>

      <!-- Todo List -->
      <div v-if="loading && todos.length === 0" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-4">Loading todos...</p>
      </div>

      <div v-else-if="filteredTodos.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No todos found</h3>
        <p class="mt-2 text-gray-600">
          {{ searchQuery ? 'Try adjusting your search' : 'Create your first todo to get started!' }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <TransitionGroup
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            :class="[
              'bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 cursor-pointer',
              todo.is_completed
                ? 'border-purple-400 opacity-75'
                : isOverdue(todo.due_date)
                ? 'border-red-500'
                : 'border-blue-400'
            ]"
            @click="viewTodoDetails(todo.id)"
          >
            <div class="flex items-start gap-4">
              <!-- Checkbox -->
              <div class="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  :checked="todo.is_completed"
                  @change.stop="handleToggleComplete(todo)"
                  class="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h3
                  :class="[
                    'text-lg font-semibold',
                    todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                  ]"
                >
                  {{ todo.title }}
                </h3>
                <p
                  v-if="todo.description"
                  :class="[
                    'mt-1 text-sm',
                    todo.is_completed ? 'line-through text-gray-400' : 'text-gray-600'
                  ]"
                >
                  {{ todo.description }}
                </p>

                <!-- Meta Info -->
                <div class="flex flex-wrap items-center gap-3 mt-3">
                  <span
                    v-if="todo.due_date"
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                      isOverdue(todo.due_date) && !todo.is_completed
                        ? 'bg-red-100 text-red-800'
                        : todo.is_completed
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    📅 {{ formatDate(todo.due_date) }}
                    <span v-if="!todo.is_completed && isOverdue(todo.due_date)" class="ml-1">(Overdue)</span>
                  </span>
                  <span
                    v-if="todo.is_completed"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    ✓ Completed
                  </span>
                  <button
                    v-if="todo.attachment"
                    @click.stop="handleDownloadAttachment(todo.id)"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition cursor-pointer"
                  >
                    📎 {{ getAttachmentName(todo.attachment) }}
                  </button>
                  <span class="text-xs text-gray-500">
                    Created {{ formatDate(todo.created_at) }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0 flex gap-2">
                <button
                  @click.stop="openEditModal(todo)"
                  :disabled="isSubmitting"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                  title="Edit"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click.stop="confirmDelete(todo.id)"
                  :disabled="isSubmitting"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  title="Delete"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Modals -->
    <TodoCreateModal
      :show="showCreateModal"
      :form-errors="formErrors"
      :is-submitting="isSubmitting"
      @close="showCreateModal = false; formErrors = {}"
      @submit="handleCreateTodo"
    />

    <TodoEditModal
      :show="showEditModal"
      :todo="editingTodo"
      :form-errors="formErrors"
      :is-submitting="isSubmitting"
      @close="showEditModal = false; editingTodo = null; formErrors = {}"
      @submit="handleUpdateTodo"
    />

    <TodoDeleteModal
      :show="showDeleteConfirm"
      :is-deleting="isSubmitting"
      @close="showDeleteConfirm = false; deletingTodoId = null"
      @confirm="handleDeleteTodo"
    />
  </div>
</template>