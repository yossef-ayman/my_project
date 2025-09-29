"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import StudentDetails from "./components/admin/StudentDetails"
import AdminDashboard from "./components/AdminDashboard"
import ExamManager from "./components/admin/ExamManager"
import NewsManager from "./components/admin/NewsManager"
import CenterSettings from "./components/admin/CenterSettings"
import StudentManager from "./components/admin/StudentManager"
import AttendanceSystem from "./components/admin/AttendanceSystem"
import AwardsManager from "./components/admin/AwardsManager"
import StudentPortal from "./components/student/StudentPortal"
import Login from "./components/Login"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// 🟢 استيراد ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute"

// 🟢 استيراد التوستر
import { Toaster } from "./components/ui/toaster"
import { ToastProvider } from "./hooks/use-toast"

function App() {
  const [students, setStudents] = useState([])
  const [user, setUser] = useState(null)

  // 📌 عند أول تحميل، نقرأ التوكن واليوزر من localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    fetch(`${process.env.REACT_APP_API_URL}/students`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("❌ Error fetching students:", err))
  }, [])

  const handleAddStudent = async (student) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/students`, {
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

  const handleRemoveStudent = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/students/${id}`, {
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
          {/* افتراضي يروح للوجن */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* تسجيل الدخول */}
          <Route path="/login" element={<Login onLogin={setUser} />} />
          
          {/* لوحة إدارة الأدمن */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* بوابة الطالب */}
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

          {/* إدارة الطلاب */}
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
          <Route path="/students/:id" element={<ProtectedRoute roles={["admin"]}><StudentDetails /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute roles={["admin"]}><AttendanceSystem /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute roles={["admin"]}><NewsManager /></ProtectedRoute>} />
          <Route path="/admin/awards" element={<ProtectedRoute roles={["admin"]}><AwardsManager /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute roles={["admin"]}><ExamManager /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><CenterSettings /></ProtectedRoute>} />
        </Routes>

        {/* 🟢 التوستر */}
        <Toaster />
      </Router>

      {/* 🟢 React-Toastify */}
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