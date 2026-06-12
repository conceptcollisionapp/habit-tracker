import React, { useEffect } from 'react'
import { useHabits } from '../hooks/useHabits'

export default function DeleteCategoryModal() {
  const { showDeleteModal, setShowDeleteModal, categoryToDelete, deleteCategory, setCategoryToDelete } = useHabits()

  const close = () => {
    setShowDeleteModal(false)
    setCategoryToDelete(null)
  }

  useEffect(() => {
    if (!showDeleteModal) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [showDeleteModal])

  if (!showDeleteModal || !categoryToDelete) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center" onClick={close}>
      <div className="bg-zinc-900 p-6 rounded w-80" onClick={e => e.stopPropagation()}>
        <p className="mb-4">Delete "{categoryToDelete.name}"? Habits will move to Uncategorized.</p>
        <div className="flex gap-2">
          <button onClick={close} className="flex-1 py-2 bg-zinc-700 rounded">Cancel</button>
          <button onClick={() => deleteCategory(categoryToDelete.id)} className="flex-1 py-2 bg-red-600 rounded">Delete</button>
        </div>
      </div>
    </div>
  )
}
