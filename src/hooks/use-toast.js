"use client"

import { createContext, useState, useCallback } from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

const ToastContext = createContext({})

let toastId = 0

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = toastId++
    const newToast = {
      id,
      title,
      description,
      variant,
      open: true,
    }

    setToasts((prev) => [...prev.slice(0, TOAST_LIMIT - 1), newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_REMOVE_DELAY)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 100)
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}
