"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import AdminDashboard from "./components/admin/AdminDashboard"
import StudentPortal from "./components/StudentPortal"
import { Toaster } from "./components/ui/toaster"

function App() {
  const [user, setUser] = useState(null)
  const [students, setStudents] = useState([])
  const [availableLocations, setAvailableLocations] = useState(["القاعة الرئيسية", "المعمل"])
  const [availableDays, setAvailableDays] = useState(["السبت", "الأحد", "الاثنين", "الثلاثاء"])

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    const savedStudents = localStorage.getItem("students")
    const savedLocations = localStorage.getItem("availableLocations")
    const savedDays = localStorage.getItem("availableDays")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents))
    }
    if (savedLocations) {
      setAvailableLocations(JSON.parse(savedLocations))
    }
    if (savedDays) {
      setAvailableDays(JSON.parse(savedDays))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students))
  }, [students])

  useEffect(() => {
    localStorage.setItem("availableLocations", JSON.stringify(availableLocations))
  }, [availableLocations])

  useEffect(() => {
    localStorage.setItem("availableDays", JSON.stringify(availableDays))
  }, [availableDays])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem("currentUser", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const addStudent = (student) => {
    const newStudent = {
      ...student,
      id: Date.now().toString(),
      attendanceCount: 0,
      attendanceHistory: [],
      weeklyAttendance: {},
    }
    setStudents((prev) => [...prev, newStudent])
  }

  const removeStudent = (id) => {
    setStudents((prev) => prev.filter((student) => student.id !== id))
  }

  const markAttendance = (studentId, location) => {
    const now = new Date()
    const currentWeek = getWeekKey(now)

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          if (student.weeklyAttendance[currentWeek]) {
            return student
          }

          const attendanceRecord = {
            date: now.toLocaleDateString("ar-EG"),
            location,
            time: now.toLocaleTimeString("ar-EG"),
          }

          return {
            ...student,
            attendanceCount: student.attendanceCount + 1,
            attendanceHistory: [...(student.attendanceHistory || []), attendanceRecord],
            weeklyAttendance: {
              ...student.weeklyAttendance,
              [currentWeek]: true,
            },
          }
        }
        return student
      }),
    )
  }

  const getWeekKey = (date) => {
    const year = date.getFullYear()
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week}`
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && user.role === "admin" ? (
                <AdminDashboard
                  user={user}
                  onLogout={handleLogout}
                  students={students}
                  onAddStudent={addStudent}
                  onRemoveStudent={removeStudent}
                  onMarkAttendance={markAttendance}
                  availableLocations={availableLocations}
                  onUpdateLocations={setAvailableLocations}
                  availableDays={availableDays}
                  onUpdateDays={setAvailableDays}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/student"
            element={
              user && user.role === "student" ? (
                <StudentPortal
                  user={user}
                  onLogout={handleLogout}
                  student={students.find((s) => s.name === user.name)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
