"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Users,
  Calendar,
  Settings,
  LogOut,
  BarChart3,
  UserPlus,
  ClipboardCheck,
  Zap,
  Award,
  Newspaper,
  FileText,
  MapPin,
} from "lucide-react"
import StudentManager from "./admin/StudentManager"
import AttendanceSystem from "./admin/AttendanceSystem"
import NewsManager from "./admin/NewsManager"
import AwardsManager from "./admin/AwardsManager"
import ExamManager from "./admin/ExamManager"
import CenterSettings from "./admin/CenterSettings"

const LOCALSTORAGE_KEY = "students"

const AdminDashboard = ({
  user,
  onLogout,
  availableLocations,
  onUpdateLocations,
  availableDays,
  onUpdateDays,
}) => {
  const [currentView, setCurrentView] = useState("dashboard")

  // students state managed locally and persisted in localStorage
  const [students, setStudents] = useState([])

  // Load students from localStorage on initial load
  useEffect(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_KEY)
    if (saved) {
      setStudents(JSON.parse(saved))
    } else {
      setStudents([])
    }
  }, [])

  // Save students to localStorage whenever students changes
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(students))
  }, [students])

  // Add a new student (make sure the student has a unique id)
  const onAddStudent = (student) => {
    // يجب التأكد أن كل طالب له (id) مميز
    if (!student.id) student.id = Date.now()
    setStudents((prev) => [...prev, student])
  }
  useEffect(() => {
  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:8080/users", {
        headers: {
          Authorization: `Bearer ${user.token}`, // ده غلط
        },
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data.users || []);
      } else {
        console.error("فشل تحميل الطلاب:", data.message);
      }
    } catch (err) {
      console.error("خطأ الاتصال بالسيرفر:", err);
    }
  };

  fetchStudents();
}, []);


  // Remove a student by id
  const onRemoveStudent = (studentId) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId))
  }

  // Mark attendance for a certain student for current week
  const onMarkAttendance = (studentId, date, weekKey) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              attendanceCount: (student.attendanceCount || 0) + 1,
              weeklyAttendance: {
                ...(student.weeklyAttendance || {}),
                [weekKey]: true,
              },
            }
          : student
      )
    )
  }

  // Statistics
  const firstGradeCount = students.filter((s) => s.grade === "الصف الأول الثانوى").length
  const secondGradeCount = students.filter((s) => s.grade === "الصف الثانى الثانوى").length
  const thirdGradeCount = students.filter((s) => s.grade === "الصف الثالث الثانوى").length
  const totalAttendance = students.reduce((acc, s) => acc + (s.attendanceCount || 0), 0)
  const averageAttendance = students.length > 0 ? Math.round(totalAttendance / students.length) : 0

  const getWeekKey = (date) => {
    const year = date.getFullYear()
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week}`
  }

  const getCurrentWeekAttendance = () => {
    const now = new Date()
    const currentWeek = getWeekKey(now)
    return students.filter((student) => student.weeklyAttendance?.[currentWeek]).length
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "students":
        return (
          <StudentManager
            onBack={() => setCurrentView("dashboard")}
            students={students}
            onAddStudent={onAddStudent}
            onRemoveStudent={onRemoveStudent}
            availableLocations={availableLocations}
          />
        )
      case "attendance":
        return (
          <AttendanceSystem
            onBack={() => setCurrentView("dashboard")}
            students={students}
            onMarkAttendance={onMarkAttendance}
          />
        )
      case "news":
        return <NewsManager onBack={() => setCurrentView("dashboard")} />
      case "awards":
        return <AwardsManager onBack={() => setCurrentView("dashboard")} />
      case "exams":
        return <ExamManager onBack={() => setCurrentView("dashboard")} />
      case "settings":
        return (
          <CenterSettings
            availableLocations={availableLocations}
            availableDays={availableDays}
            onUpdateLocations={onUpdateLocations}
            onUpdateDays={onUpdateDays}
            onBack={() => setCurrentView("dashboard")}
          />
        )
      default:
        return (
          <div className="space-y-6" dir="rtl">
            {/* الترحيب */}
            <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-gradient animate-slideInUp">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gradient text-glow">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-glow">
                    <BarChart3 className="h-6 w-6 text-white animate-wiggle" />
                  </div>
                  مرحباً {user.name}
                </CardTitle>
                <CardDescription className="text-purple-600 font-semibold">
                  لوحة إدارة نظام الحضور - أستاذ المهندسين محمد الإبراشي
                </CardDescription>
              </CardHeader>
            </Card>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="gradient-card-1 text-white animate-fadeIn">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80">إجمالي الطلاب</p>
                      <p className="text-3xl font-bold">{students.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card-2 text-white animate-fadeIn">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80">حضور هذا الأسبوع</p>
                      <p className="text-3xl font-bold">{getCurrentWeekAttendance()}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card-3 text-white animate-fadeIn">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80">الصف الأول</p>
                      <p className="text-3xl font-bold">{firstGradeCount}</p>
                    </div>
                    <Badge variant="outline" className="text-white border-white">
                      {firstGradeCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card-4 text-white animate-fadeIn">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80">الصف الثاني</p>
                      <p className="text-3xl font-bold">{secondGradeCount}</p>
                    </div>
                    <Badge variant="outline" className="text-white border-white">
                      {secondGradeCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الأدوات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="interactive-card cursor-pointer hover:shadow-lg transition-all duration-300 border-blue-200 bg-blue-50"
                onClick={() => setCurrentView("students")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <UserPlus className="h-6 w-6" />
                    إدارة الطلاب
                  </CardTitle>
                  <CardDescription className="text-blue-600">إضافة وإدارة بيانات الطلاب</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{students.length}</div>
                  <p className="text-sm text-blue-600">طالب مسجل</p>
                </CardContent>
              </Card>

              <Card
                className="interactive-card cursor-pointer hover:shadow-lg transition-all duration-300 border-green-200 bg-green-50"
                onClick={() => setCurrentView("attendance")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <ClipboardCheck className="h-6 w-6" />
                    تسجيل الحضور
                  </CardTitle>
                  <CardDescription className="text-green-600">نظام تسجيل الحضور المتقدم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{getCurrentWeekAttendance()}</div>
                  <p className="text-sm text-green-600">حضر هذا الأسبوع</p>
                </CardContent>
              </Card>

              <Card
                className="interactive-card cursor-pointer hover:shadow-lg transition-all duration-300 border-purple-200 bg-purple-50"
                onClick={() => setCurrentView("news")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Newspaper className="h-6 w-6" />
                    إدارة الأخبار
                  </CardTitle>
                  <CardDescription className="text-purple-600">نشر الأخبار والإعلانات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">5</div>
                  <p className="text-sm text-purple-600">خبر منشور</p>
                </CardContent>
              </Card>

              <Card
                className="interactive-card cursor-pointer hover:shadow-lg transition-all duration-300 border-yellow-200 bg-yellow-50"
                onClick={() => setCurrentView("awards")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Award className="h-6 w-6" />
                    إدارة التكريمات
                  </CardTitle>
                  <CardDescription className="text-yellow-600">تكريم الطلاب المتميزين</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-700">12</div>
                  <p className="text-sm text-yellow-600">تكريم هذا الشهر</p>
                </CardContent>
              </Card>

              <Card
                className="interactive-card cursor-pointer hover:shadow-lg transition-all duration-300 border-indigo-200 bg-indigo-50"
                onClick={() => setCurrentView("exams")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <FileText className="h-6 w-6" />
                    الامتحانات الإلكترونية
                  </CardTitle>
                  <CardDescription className="text-indigo-600">إنشاء وإدارة الامتحانات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-700">3</div>
                  <p className="text-sm text-indigo-600">امتحان نشط</p>
                </CardContent>
              </Card>

              <Card
                className="interactive-card cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200 bg-gray-50"
                onClick={() => setCurrentView("settings")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Settings className="h-6 w-6" />
                    إعدادات النظام
                  </CardTitle>
                  <CardDescription className="text-gray-600">إعدادات المركز والنظام</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-700">{availableLocations.length}</div>
                  <p className="text-sm text-gray-600">مكان متاح</p>
                </CardContent>
              </Card>
            </div>

            {/* معلومات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Zap className="h-5 w-5" />
                    إحصائيات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>متوسط الحضور:</span>
                    <Badge className="bg-orange-500 text-white">{averageAttendance} مرة</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الحضور:</span>
                    <Badge variant="outline">{totalAttendance} مرة</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>الأماكن المتاحة:</span>
                    <Badge variant="secondary">{availableLocations.length} مكان</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-200 bg-teal-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-800">
                    <MapPin className="h-5 w-5" />
                    معلومات المركز
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>اسم المركز:</strong> أستاذ المهندسين محمد الإبراشي
                  </p>
                  <p>
                    <strong>الفرع:</strong> المعادي
                  </p>
                  <p>
                    <strong>نظام الحضور:</strong> أسبوعي
                  </p>
                  <p>
                    <strong>آخر تحديث:</strong> {new Date().toLocaleDateString("ar-EG")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* شريط علوي */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">لوحة الإدارة</span>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">{renderCurrentView()}</div>
    </div>
  )
}

export default AdminDashboard