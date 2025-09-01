// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import StudentPortal from "./components/StudentPortal";
import AdminDashboard from "./components/AdminDashboard";

import AttendanceSystem from "./components/admin/AttendanceSystem";
import AwardsManager from "./components/admin/AwardsManager";
import CenterSettings from "./components/admin/CenterSettings";
import ExamManager from "./components/admin/ExamManager";
import NewsManager from "./components/admin/NewsManager";
import StudentManager from "./components/admin/StudentManager";

import ExamInterface from "./components/student/ExamInterface";

function App() {
  return (
    <Router>
      <Routes>
        {/* صفحات عامة */}
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* صفحات الأدمن */}
        <Route path="/admin/attendance" element={<AttendanceSystem />} />
        <Route path="/admin/awards" element={<AwardsManager />} />
        <Route path="/admin/settings" element={<CenterSettings />} />
        <Route path="/admin/exams" element={<ExamManager />} />
        <Route path="/admin/news" element={<NewsManager />} />
        <Route path="/admin/students" element={<StudentManager />} />

        {/* صفحات الطالب */}
        <Route path="/student/exam" element={<ExamInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
