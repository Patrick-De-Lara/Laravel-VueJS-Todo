<script setup lang="ts">
interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
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
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Delete Todo?</h2>
        <p class="text-gray-600 mb-6">Are you sure you want to delete this todo? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button
            @click="emit('close')"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="emit('confirm')"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
