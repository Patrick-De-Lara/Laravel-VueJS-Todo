export function useTodoHelpers() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const getDaysUntil = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getAttachmentName = (path: string | null) => {
    if (!path) return ''
    return path.split('/').pop() || ''
  }

  const getDueDateStatus = (dueDate: string | null, isCompleted: boolean) => {
    if (!dueDate) return null
    if (isCompleted) return 'completed'
    
    const days = getDaysUntil(dueDate)
    if (days < 0) return 'overdue'
    if (days <= 7) return 'urgent'
    return 'normal'
  }

  return {
    formatDate,
    formatDateTime,
    isOverdue,
    getDaysUntil,
    getAttachmentName,
    getDueDateStatus
  }
}
