// src/App.jsx
"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AdminDashboard from "./components/AdminDashboard"
import ExamManager from "./components/admin/ExamManager"
import NewsManager from "./components/admin/NewsManager"
import CenterSettings from "./components/admin/CenterSettings"
import StudentManager from "./components/admin/StudentManager"
import AttendanceSystem from "./components/admin/AttendanceSystem"
import AwardsManager from "./components/admin/AwardsManager"
import Login from "./components/Login"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManager />} />
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
 