<script setup lang="ts">
import { ref, watch } from 'vue'

interface Todo {
  id: number
  title: string
  description: string | null
  attachment: string | null
  due_date: string | null
}

interface Props {
  show: boolean
  todo: Todo | null
  formErrors?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: { title: string; description: string; due_date: string; file: File | null }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref({
  title: '',
  description: '',
  due_date: ''
})

const attachmentFile = ref<File | null>(null)
const fileError = ref<string | null>(null)

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv']
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

const validateFile = (file: File): string | null => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must not exceed 25MB.'
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return 'File type not allowed. Only images (jpg, jpeg, png, gif, bmp, webp, svg) and documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv) are allowed.'
  }

  // Check filename characters (excluding extension)
  const filename = file.name.replace(/\.[^/.]+$/, '')
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return 'Filename contains invalid characters. Only letters, numbers, dots, hyphens, and underscores are allowed.'
  }

  return null
}

// Watch for todo changes and update form
watch(() => props.todo, (newTodo) => {
  if (newTodo) {
    form.value = {
      title: newTodo.title,
      description: newTodo.description || '',
      due_date: newTodo.due_date || ''
    }
    attachmentFile.value = null
  }
}, { immediate: true })

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const error = validateFile(file)
    
    if (error) {
      fileError.value = error
      attachmentFile.value = null
      target.value = '' // Clear the input
    } else {
      fileError.value = null
      attachmentFile.value = file
    }
  }
}

const handleSubmit = () => {
  // Don't submit if there's a file error
  if (fileError.value) {
    return
  }
  
  emit('submit', {
    title: form.value.title,
    description: form.value.description,
    due_date: form.value.due_date,
    file: attachmentFile.value
  })
  resetForm()
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    due_date: ''
  }
  attachmentFile.value = null
  fileError.value = null
}

const getAttachmentName = (path: string | null) => {
  if (!path) return ''
  return path.split('/').pop() || ''
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40"
      @click.self="handleClose"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Edit Todo</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': formErrors?.title }"
            />
            <p v-if="formErrors?.title" class="mt-1 text-sm text-red-600">{{ formErrors.title[0] }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              v-model="form.due_date"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
            <div v-if="todo?.attachment" class="mb-2 text-sm text-gray-600">
              Current: <span class="font-medium">{{ getAttachmentName(todo.attachment) }}</span>
            </div>
            <input
              type="file"
              @change="handleFileChange"
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              :class="{ 'border-red-500': fileError || formErrors?.attachment }"
            />
            <p v-if="fileError" class="mt-1 text-sm text-red-600">{{ fileError }}</p>
            <p v-else-if="formErrors?.attachment" class="mt-1 text-sm text-red-600">{{ formErrors.attachment[0] }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Max file size: 25MB. Leave empty to keep current file. Allowed: Images (jpg, jpeg, png, gif, bmp, webp, svg) and Documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv)</p>
            <p v-if="attachmentFile" class="mt-1 text-sm text-green-600">✓ {{ attachmentFile.name }} ({{ (attachmentFile.size / 1024 / 1024).toFixed(2) }}MB)</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="handleClose"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!!fileError"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
