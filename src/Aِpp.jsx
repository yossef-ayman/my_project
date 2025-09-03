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
import Login from "./components/Login"

function App() {
  // 🟢 الحالة العامة للطلاب
  const [students, setStudents] = useState([])

  // 🟢 جلب الطلاب من الباك عند فتح الصفحة
  useEffect(() => {
    fetch("http://localhost:8080/students") // عدل الرابط لو سيرفرك مختلف
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("❌ Error fetching students:", err))
  }, [])

  // 🟢 إضافة طالب
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

  // 🟢 حذف طالب
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/students"
          element={
            <StudentManager
              students={students}
              onAddStudent={handleAddStudent}
              onRemoveStudent={handleRemoveStudent}
            />
          }
        />
        <Route path="/admin/attendance" element={<AttendanceSystem />} />
        <Route path="/admin/news" element={<NewsManager />} />
        <Route path="/admin/awards" element={<AwardsManager />} />
        <Route path="/admin/exams" element={<ExamManager />} />
        <Route path="/admin/settings" element={<CenterSettings />} />
      </Routes>
    </Router>
  )
}

export default App
