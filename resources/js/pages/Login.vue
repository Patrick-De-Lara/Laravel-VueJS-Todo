<script setup lang="ts">
import { ref } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import { useAuth } from '../composables/useAuth'

const form = ref({
  email: '',
  password: '',
})

const errors = ref<{ email?: string; password?: string }>({})
const errorMessage = ref('')
const { login, loading } = useAuth()

const handleLogin = async () => {
  errors.value = {}
  errorMessage.value = ''

  const result = await login(form.value.email, form.value.password)

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
  <Head title="Login" />

  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <!-- Error Message -->
        <div 
          v-if="errorMessage" 
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Enter your password"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password[0] }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm">
            Don't have an account?
            <Link 
              href="/register" 
              class="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500 text-center font-medium mb-2">Demo Account</p>
          <p class="text-xs text-gray-600 text-center">
            Email: test@example.com<br>
            Password: password
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
