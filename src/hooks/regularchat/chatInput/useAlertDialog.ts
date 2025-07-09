// src/app/hooks/chatInput/useAlertDialog.ts
import { useState, useCallback } from 'react'

export const useAlertDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const showAlertDialog = useCallback((title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return {
    isModalOpen,
    modalTitle,
    modalMessage,
    showAlertDialog,
    closeModal
  }
}