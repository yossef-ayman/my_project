"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"

// 🧩 الصفحات الأساسية
import Login from "./components/Login"
import Signup from "./components/Signup"

// 🧩 صفحات الأدمن
import AdminDashboard from "./components/AdminDashboard"
import StudentManager from "./components/admin/StudentManager"
import StudentDetails from "./components/admin/StudentDetails"
import AttendanceSystem from "./components/admin/AttendanceSystem"
import NewsManager from "./components/admin/NewsManager"
import AwardsManager from "./components/admin/AwardsManager"
import ExamManager from "./components/admin/ExamManager"
import CenterSettings from "./components/admin/CenterSettings"

// 🧩 صفحة الطالب
import StudentPortal from "./components/student/StudentPortal"

// 🧩 حماية الصفحات
import ProtectedRoute from "./components/ProtectedRoute"

// 🧩 التوست (الإشعارات)
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Toaster } from "./components/ui/toaster"
import { ToastProvider } from "./hooks/use-toast"

function App() {
  const [students, setStudents] = useState([])
  const [user, setUser] = useState(null)
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

  // 📌 عند أول تحميل، نحمل بيانات المستخدم والطلاب
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) setUser(JSON.parse(savedUser))

    const token = localStorage.getItem("authToken")
    if (!token) return

    fetch(`${apiBaseUrl}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudents(data)
      })
      .catch((err) => console.error("❌ Error fetching students:", err))
  }, [apiBaseUrl])

  // 🟢 إضافة طالب
  const handleAddStudent = async (student) => {
    try {
      const res = await fetch(`${apiBaseUrl}/students`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(student),
      })
      if (!res.ok) throw new Error("❌ Failed to add student")
      const newStudent = await res.json()
      setStudents((prev) => [...prev, newStudent])
    } catch (error) {
      console.error(error)
    }
  }

  // 🔴 حذف طالب
  const handleRemoveStudent = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      })
      if (!res.ok) throw new Error("❌ Failed to delete student")
      setStudents((prev) => prev.filter((s) => s._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* 🏠 الافتراضي: توجيه إلى تسجيل الدخول */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 🔐 تسجيل الدخول */}
          <Route path="/login" element={<Login onLogin={setUser} />} />

          {/* 🆕 إنشاء حساب جديد */}
          <Route path="/signup" element={<Signup />} />

          {/* 🧭 لوحة إدارة الأدمن */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* 🎓 بوابة الطالب */}
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={["student"]}>
                <StudentPortal 
                  user={user} 
                  student={students.find(s => s.email === user?.email)} 
                />
              </ProtectedRoute>
            }
          />

          {/* 👩‍🎓 إدارة الطلاب */}
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute roles={["admin"]}>
                <StudentManager
                  students={students}
                  onAddStudent={handleAddStudent}
                  onRemoveStudent={handleRemoveStudent}
                />
              </ProtectedRoute>
            }
          />

          {/* 🔍 تفاصيل الطالب */}
          <Route 
            path="/students/:id" 
            element={
              <ProtectedRoute roles={["admin"]}>
                <StudentDetails />
              </ProtectedRoute>
            } 
          />

          {/* 🗓️ باقي صفحات الأدمن */}
          <Route path="/admin/attendance" element={<ProtectedRoute roles={["admin"]}><AttendanceSystem /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute roles={["admin"]}><NewsManager /></ProtectedRoute>} />
          <Route path="/admin/awards" element={<ProtectedRoute roles={["admin"]}><AwardsManager /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute roles={["admin"]}><ExamManager /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><CenterSettings /></ProtectedRoute>} />
        </Routes>

        {/* 🔔 نظام الإشعارات */}
        <Toaster />
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="colored"
        transition="Bounce"
      />
    </ToastProvider>
  )
}

export default App
