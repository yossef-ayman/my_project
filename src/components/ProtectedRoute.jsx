"use client"

import React from "react"
import { Navigate } from "react-router-dom"

/**
 * @param {React.ReactNode} children - الكومبوننت أو الصفحة اللي عاوز تحميها
 * @param {Array} roles - الصلاحيات المسموح لها (مثلاً ["admin"])
 */
const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem("authToken")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  // لو مفيش توكن أو التوكن مش صالح → روح للينك login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // لو فيه roles محددة (زي admin) وتوكين المستخدم مش معاه
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace /> // أو ممكن توجه لصفحة Unauthorized
  }

  return children
}

export default ProtectedRoute