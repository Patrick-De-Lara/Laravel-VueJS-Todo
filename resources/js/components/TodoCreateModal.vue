<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
  formErrors?: any
  isSubmitting?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: { title: string; description: string; due_date: string; file: File | null }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const title = ref('')
const description = ref('')
const due_date = ref('')
const attachmentFile = ref<File | null>(null)

// Reset form when modal is opened
watch(() => props.show, (newValue) => {
  if (newValue) {
    title.value = ''
    description.value = ''
    due_date.value = ''
    attachmentFile.value = null
  }
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    attachmentFile.value = target.files[0]
  }
}

const handleSubmit = () => {
  if (props.isSubmitting) return // Prevent double submission
  
  emit('submit', {
    title: title.value,
    description: description.value,
    due_date: due_date.value,
    file: attachmentFile.value
  })
}

const handleClose = () => {
  if (props.isSubmitting) return // Prevent closing while submitting
  
  // Reset form
  title.value = ''
  description.value = ''
  due_date.value = ''
  attachmentFile.value = null
  emit('close')
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
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <!-- Loading overlay for modal -->
        <div
          v-if="isSubmitting"
          class="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center z-10"
        >
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="text-gray-600 mt-2 text-sm">Creating...</p>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">Create New Todo</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              v-model="title"
              type="text"
              required
              :disabled="isSubmitting"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              :class="{ 'border-red-500': formErrors?.title }"
            />
            <p v-if="formErrors?.title" class="mt-1 text-sm text-red-600">{{ formErrors.title[0] }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="description"
              rows="3"
              :disabled="isSubmitting"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              v-model="due_date"
              type="date"
              :disabled="isSubmitting"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
            <input
              type="file"
              @change="handleFileChange"
              :disabled="isSubmitting"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
              :class="{ 'border-red-500': formErrors?.attachment }"
            />
            <p v-if="formErrors?.attachment" class="mt-1 text-sm text-red-600">{{ formErrors.attachment[0] }}</p>
            <p v-else-if="formErrors?.general" class="mt-1 text-sm text-red-600">{{ formErrors.general[0] }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Max file size: 25MB</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="handleClose"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>