# Full Stack Laravel-VueJs To-Do App

Welcome to the Full Stack Laravel-VueJs To-Do App. App uses the stack of Laravel for the backend and Vue.js for the frontend to create a simple and efficient to-do application.

# Setup Instructions
## Prerequisites
Before you begin, ensure you have met the following requirements:
- You have installed PHP (version 8.2 or higher).
- You have installed Composer.
- You have installed Node.js and npm.
- You have installed a database server (MySQL, PostgreSQL, etc.).
- You have installed Laravel CLI globally (optional but recommended).
## Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Patrick-De-Lara/Laravel-VueJS-Todo
    cd Laravel-VueJS-Todo
    ```
2. Install backend dependencies:
   ```bash
   composer install
   ```
3. Install frontend dependencies:
   ```bash
    npm install
    ```
4. Set up the environment file:
    ```bash
    cp .env.example .env
    ``` 
5. Configure your database settings in the `.env` file.
6. Generate an application key:
   ```bash
   php artisan key:generate
   ```
7. Run database migrations with seeders:
   ```bash
    php artisan migrate:fresh --seed
    ```
8. Start the development server:
    ```bash
    php artisan serve
    ``` 
9. In a separate terminal, start the Vite development server:
    ```bash
    npm run dev
    ```

> **Note**: For production, build the frontend assets using:
   ```bash
   npm run build
   ```
   This will compile the Vue.js components and assets into the `public/build` directory.

# Usage
Once the development servers are running, you can access the application by navigating to `http://localhost:8000` in your web browser. You will be directed to route `/Login` to log in or register. After logging in, you can start adding, editing, and deleting to-do items.

# Approach
When starting to develop and installing the frameworks. I first research and decide if Im gonna use Inertia.js to integrate Vue.js with Laravel or use Vue.js as a separate frontend application and make API calls to the Laravel backend. I decided to use Inertia.js for this project as it allows for a more seamless integration between the frontend and backend, for focusing full stack developing Laravel with Vue.js without the need for a separate API layer. You can also say this is practice for me to learn more about Inertia.js and how it works with Laravel and Vue.js. Other than separate API calls to the backend from the frontend.

## Laravel Backend
The Laravel backend handles user authentication, database interactions, and serves the Vue.js frontend. It uses Laravel's **Sanctum** for authentication and token management. All authentication logic's are in the controllers folder `Api`. 

**`AuthController.php`** - Handles user registration, login, and logout functionalities with validation and token creation after successful login or registration.

### Routes:
- **`POST /api/register`** - Registers a new user.
- **`POST /api/login`** - Logs in an existing user.
- **`POST /api/logout`** - Logs out the authenticated user (protected by auth:sanctum).
- **`GET /api/user`** - Returns the authenticated user's information (protected by auth:sanctum).

### Middleware:
- **`auth:sanctum`** - Protects routes to ensure only authenticated users can access them.
**`TodoController.php`** - Manages CRUD operations for to-do items, ensuring that each operation is performed by the authenticated user only. It also includes validation for to-do item data and sanitation on File uploads.

### Routes:
- **`GET /api/todos`** - Fetches all to-do items for the authenticated user.
- **`POST /api/todos`** - Creates a new to-do item (supports file uploads up to 25MB).
- **`GET /api/todos/{id}`** - Fetches a specific to-do item.
- **`PUT/PATCH /api/todos/{id}`** - Updates a specific to-do item.
- **`DELETE /api/todos/{id}`** - Deletes a specific to-do item.
- **`GET /api/todos/{id}/download`** - Downloads the attachment associated with a specific to-do item.

### Middleware:
- **`auth:sanctum`** - Ensures that only authenticated users can perform CRUD operations on to-do items.

## Vue.js Frontend
The Vue.js frontend is built using Vue 3 and is integrated into the Laravel application using Inertia.js. It provides a responsive and interactive user interface for managing to-do items.

### Pages:
- **`Login.vue`** - A page for user login, handling form submissions and displaying validation errors.
- **`Register.vue`** - A page for new user registration with form validation.
- **`Todos/Index.vue`** - The main page for managing to-do items, including listing, searching, filtering, creating, editing, and deleting to-dos. Features include urgent todo alerts, status filters, and statistics dashboard.
- **`Todos/Show.vue`** - A detailed view page for a specific to-do item with full metadata display, edit, delete, and attachment download capabilities.

### Composables:
- **`useAuth.ts`** - A composable for handling authentication logic, including login, registration, logout, and token management.
- **`useTodos.ts`** - A composable for managing to-do items, including fetching, creating, updating, deleting, and downloading attachments.
- **`useTodoFilters.ts`** - A composable for filtering to-do items by search query, status (all/active/completed/overdue), and calculating urgent todos.
- **`useTodoHelpers.ts`** - A composable for utility functions related to to-do items, such as formatting dates, checking overdue status, calculating days until due, and extracting attachment names.

### Components:
- **`TodoCreateModal.vue`** - A modal component for creating new to-do items with support for file attachments.
- **`TodoEditModal.vue`** - A modal component for editing existing to-do items.
- **`TodoDeleteModal.vue`** - A confirmation modal component for deleting to-do items.

# Key Features
- **Authentication**: Secure user registration, login, and logout using Laravel Sanctum tokens
- **CRUD Operations**: Full create, read, update, and delete functionality for to-do items
- **File Attachments**: Upload and download attachments (images and documents up to 25MB)
- **Filtering & Search**: Filter by status (all/active/completed/overdue) and search by title/description
- **Urgent Alerts**: Collapsible dropdown showing todos due within 7 days
- **Statistics Dashboard**: Real-time counts of total, active, completed, and overdue todos
- **Responsive UI**: Modern, mobile-friendly interface with smooth transitions
- **Type Safety**: Full TypeScript support for better development experience
- **Code Quality**: ESLint and Prettier configured for consistent code style

# Conclusion
This is my approach to the Full Stack Laravel-VueJS To-Do App project. The application provides a solid foundation for managing to-do items with user authentication, file attachments, and a responsive frontend built with modern web technologies.