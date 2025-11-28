<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Head, Link, router } from '@inertiajs/vue3'
import { useTodos } from '../../composables/useTodos'
import { useTodoHelpers } from '../../composables/useTodoHelpers'
import TodoEditModal from '../../components/TodoEditModal.vue'
import TodoDeleteModal from '../../components/TodoDeleteModal.vue'

interface Props {
  id: string
}

const props = defineProps<Props>()

const { fetchTodo, updateTodo, deleteTodo, downloadAttachment, loading } = useTodos()
const { formatDateTime, isOverdue, getDaysUntil, getAttachmentName, getDueDateStatus } = useTodoHelpers()

const todo = ref<any>(null)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const formErrors = ref<any>({})
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const dueDateStatus = computed(() => {
  if (!todo.value) return null
  return getDueDateStatus(todo.value.due_date, todo.value.is_completed)
})

const loadTodo = async () => {
  const data = await fetchTodo(parseInt(props.id))
  if (data) {
    todo.value = data
  } else {
    router.visit('/todos')
  }
}

const handleUpdate = async (data: { title: string; description: string; due_date: string; file: File | null }) => {
  const result = await updateTodo(parseInt(props.id), data)
  if (result.success) {
    todo.value = result.todo
    showEditModal.value = false
    formErrors.value = {}
    showNotification('Todo updated successfully!', 'success')
  } else {
    formErrors.value = result.errors || {}
    showNotification('Failed to update todo', 'error')
  }
}

const handleDelete = async () => {
  const result = await deleteTodo(parseInt(props.id))
  if (result.success) {
    showNotification('Todo deleted successfully', 'success')
    setTimeout(() => {
      router.visit('/todos')
    }, 1000)
  } else {
    showDeleteModal.value = false
    showNotification('Failed to delete todo', 'error')
  }
}

const handleDownload = async () => {
  const result = await downloadAttachment(parseInt(props.id))
  if (!result.success) {
    showNotification('Failed to download attachment', 'error')
  }
}

const showNotification = (message: string, type: 'success' | 'error') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

const checkAuth = () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    window.location.href = '/login'
  }
}

onMounted(() => {
  checkAuth()
  loadTodo()
})
</script>

<template>
  <Head :title="todo ? todo.title : 'Todo Details'" />

  <div class="min-h-screen bg-gray-50">
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
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/todos" class="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center mb-3">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Todos
        </Link>
        <h1 class="text-3xl font-bold text-gray-900">Todo Details</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-4">Loading todo...</p>
      </div>
    </div>

    <!-- Todo Content -->
    <div v-else-if="todo" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Status Banner -->
        <div
          :class="[
            'px-6 py-4 border-b-4',
            todo.is_completed ? 'bg-green-50 border-green-500' : 
            dueDateStatus === 'overdue' ? 'bg-red-50 border-red-500' :
            dueDateStatus === 'urgent' ? 'bg-orange-50 border-orange-500' :
            'bg-blue-50 border-blue-500'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span
                :class="[
                  'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold',
                  todo.is_completed ? 'bg-green-100 text-green-800' : 
                  dueDateStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                  dueDateStatus === 'urgent' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                ]"
              >
                {{ todo.is_completed ? '✓ Completed' : 
                   dueDateStatus === 'overdue' ? '⚠️ Overdue' :
                   dueDateStatus === 'urgent' ? '⏰ Due Soon' :
                   '📝 Active' }}
              </span>
            </div>
            <div class="flex gap-2">
              <button
                @click="showEditModal = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                @click="showDeleteModal = true"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="p-6">
          <!-- Title -->
          <h2
            :class="[
              'text-3xl font-bold mb-4',
              todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
            ]"
          >
            {{ todo.title }}
          </h2>

          <!-- Description -->
          <div v-if="todo.description" class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
            <p
              :class="[
                'text-gray-700 whitespace-pre-wrap',
                todo.is_completed ? 'line-through text-gray-500' : ''
              ]"
            >
              {{ todo.description }}
            </p>
          </div>

          <!-- Metadata Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Due Date -->
            <div v-if="todo.due_date" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Due Date</h3>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-lg font-medium text-gray-900">{{ formatDateTime(todo.due_date) }}</span>
              </div>
              <p v-if="!todo.is_completed" class="text-sm text-gray-600 mt-2">
                {{ isOverdue(todo.due_date) ? 
                   `Overdue by ${Math.abs(getDaysUntil(todo.due_date))} days` : 
                   `${getDaysUntil(todo.due_date)} days remaining` }}
              </p>
            </div>

            <!-- Completed Date -->
            <div v-if="todo.completed_at" class="bg-green-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">Completed</h3>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-lg font-medium text-green-900">{{ formatDateTime(todo.completed_at) }}</span>
              </div>
            </div>

            <!-- Created Date -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Created</h3>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="text-lg font-medium text-gray-900">{{ formatDateTime(todo.created_at) }}</span>
              </div>
            </div>

            <!-- Updated Date -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Last Updated</h3>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="text-lg font-medium text-gray-900">{{ formatDateTime(todo.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Attachment -->
          <div v-if="todo.attachment" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 class="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">Attachment</h3>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <svg class="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <div>
                  <p class="text-lg font-medium text-blue-900">{{ getAttachmentName(todo.attachment) }}</p>
                  <p class="text-sm text-blue-600">Click to download</p>
                </div>
              </div>
              <button
                @click="handleDownload"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TodoEditModal
      :show="showEditModal"
      :todo="todo"
      :form-errors="formErrors"
      @close="showEditModal = false; formErrors = {}"
      @submit="handleUpdate"
    />

    <TodoDeleteModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>
