"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AdminDashboard from "./AdminDashboard"
import AttendanceSystem from "./admin/AttendanceSystem"
import StudentManager from "./admin/StudentManager"
import NewsManager from "./admin/NewsManager"
import AwardsManager from "./admin/AwardsManager"
import ExamManager from "./admin/ExamManager"
import CenterSettings from "./admin/CenterSettings"
import Login from "./ui/Login"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
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
