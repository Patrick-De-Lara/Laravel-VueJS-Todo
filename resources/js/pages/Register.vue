<script setup lang="ts">
import { ref } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import { useAuth } from '../composables/useAuth'

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = ref<{ 
  name?: string[]
  email?: string[]
  password?: string[]
}>({})
const errorMessage = ref('')
const { register, loading } = useAuth()

const handleRegister = async () => {
  errors.value = {}
  errorMessage.value = ''

  const result = await register(
    form.value.name,
    form.value.email,
    form.value.password,
    form.value.password_confirmation
  )

  if (result.success) {
    // Redirect to todos page
    window.location.href = '/todos'
  } else {
    // Handle errors
    if (result.error?.errors) {
      errors.value = result.error.errors
    } else if (result.error?.message) {
      errorMessage.value = result.error.message
    } else {
      errorMessage.value = 'An error occurred. Please try again.'
    }
  }
}
</script>

<template>
  <Head title="Register" />

  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p class="text-gray-600">Sign up to get started</p>
        </div>

        <!-- Error Message -->
        <div 
          v-if="errorMessage" 
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {{ errorMessage }}
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              :class="{ 'border-red-500': errors.name }"
              placeholder="John Doe"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">
              {{ errors.name[0] }}
            </p>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              :class="{ 'border-red-500': errors.email }"
              placeholder="you@example.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email[0] }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              :class="{ 'border-red-500': errors.password }"
              placeholder="At least 8 characters"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password[0] }}
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Re-enter your password"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm">
            Already have an account?
            <Link 
              href="/login" 
              class="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <!-- Back to Home Link -->
      <div class="text-center mt-4">
        <Link 
          href="/" 
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  </div>
</template>
