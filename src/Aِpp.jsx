// src/App.jsx
"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import AdminDashboard from "./components/AdminDashboard"
import ExamManager from "./components/admin/ExamManager"
import NewsManager from "./components/admin/NewsManager"
import CenterSettings from "./components/admin/CenterSettings"
import StudentManager from "./components/admin/StudentManager"
import AttendanceSystem from "./components/admin/AttendanceSystem"
import AwardsManager from "./components/admin/AwardsManager"
import StudentPortal from "./components/StudentPortal"
import Login from "./components/Login"

function App() {
  const [students, setStudents] = useState([])
  const [user, setUser] = useState(null) // 🟢 المستخدم الحالي

  useEffect(() => {
    fetch("http://localhost:8080/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("❌ Error fetching students:", err))
  }, [])

  const handleAddStudent = async (student) => {
    try {
      const res = await fetch("http://localhost:8080/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`http://localhost:8080/students/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("❌ Failed to delete student")
      setStudents((prev) => prev.filter((s) => s.stdcode !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Router>
      <Routes>
        {/* 🟢 login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />

        {/* 🟢 admin routes */}
        <Route
          path="/admin"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 🟢 student route */}
        <Route
          path="/student"
          element={
            user && user.role === "student" ? (
              <StudentPortal user={user} students={students} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 🟢 admin sub-pages */}
        <Route
          path="/admin/students"
          element={
            user && user.role === "admin" ? (
              <StudentManager
                students={students}
                onAddStudent={handleAddStudent}
                onRemoveStudent={handleRemoveStudent}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/admin/attendance" element={user && user.role === "admin" ? <AttendanceSystem /> : <Navigate to="/login" replace />} />
        <Route path="/admin/news" element={user && user.role === "admin" ? <NewsManager /> : <Navigate to="/login" replace />} />
        <Route path="/admin/awards" element={user && user.role === "admin" ? <AwardsManager /> : <Navigate to="/login" replace />} />
        <Route path="/admin/exams" element={user && user.role === "admin" ? <ExamManager /> : <Navigate to="/login" replace />} />
        <Route path="/admin/settings" element={user && user.role === "admin" ? <CenterSettings /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
