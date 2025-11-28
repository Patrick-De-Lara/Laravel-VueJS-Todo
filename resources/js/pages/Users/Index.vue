<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'

interface User {
  id: number
  name: string
  email: string
  created_at: string
}

defineProps<{
  users: User[]
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <Head title="Users List" />

  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Link href="/" class="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 class="text-3xl font-bold text-gray-900">Users List</h1>
        <p class="text-gray-600 mt-2">Total users: {{ users.length }}</p>
      </div>

      <!-- Users List -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <ul class="divide-y divide-gray-200">
          <li
            v-for="user in users"
            :key="user.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ user.name }}
                </h3>
                <p class="text-gray-600 text-sm mt-1">
                  {{ user.email }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">
                  ID: {{ user.id }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatDate(user.created_at) }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Empty State -->
      <div
        v-if="users.length === 0"
        class="text-center py-12 bg-white rounded-lg shadow-md"
      >
        <p class="text-gray-500">No users found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
