import { computed, type Ref } from 'vue'
import type { Todo } from './useTodos'

export function useTodoFilters(todos: Ref<Todo[]>, searchQuery: Ref<string>, filterStatus: Ref<'all' | 'active' | 'completed' | 'overdue'>) {
  
  const urgentTodos = computed(() => {
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return todos.value.filter(todo => {
      if (!todo.due_date || todo.is_completed) return false
      const dueDate = new Date(todo.due_date)
      return dueDate <= sevenDaysLater && dueDate >= now
    }).sort((a, b) => {
      return new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    })
  })

  const overdueTodos = computed(() => {
    const now = new Date()
    return todos.value.filter(todo => {
      if (!todo.due_date || todo.is_completed) return false
      return new Date(todo.due_date) < now
    })
  })

  const filteredTodos = computed(() => {
    let filtered = todos.value

    if (filterStatus.value === 'active') {
      filtered = filtered.filter(t => !t.is_completed)
    } else if (filterStatus.value === 'completed') {
      filtered = filtered.filter(t => t.is_completed)
    } else if (filterStatus.value === 'overdue') {
      filtered = overdueTodos.value
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      if (a.is_completed === b.is_completed) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.is_completed ? 1 : -1
    })
  })

  const stats = computed(() => ({
    total: todos.value.length,
    active: todos.value.filter(t => !t.is_completed).length,
    completed: todos.value.filter(t => t.is_completed).length,
    overdue: overdueTodos.value.length
  }))

  return {
    urgentTodos,
    overdueTodos,
    filteredTodos,
    stats
  }
}
