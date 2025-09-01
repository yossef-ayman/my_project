"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Users,
  BarChart3,
  UserPlus,
  ClipboardCheck,
  Award,
  Newspaper,
  FileText,
  Settings,
  LogOut,
  ArrowRightCircle,
} from "lucide-react"

const LOCALSTORAGE_KEY = "students"

const AdminDashboard = ({ user, onLogout, availableLocations }) => {
  const [students, setStudents] = useState([])
  const [news, setNews] = useState([])
  const navigate = useNavigate()

  // Load students from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_KEY)
    setStudents(saved ? JSON.parse(saved) : [])
  }, [])

  // Save students to localStorage
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(students))
  }, [students])

  // Fetch data from backend
  useEffect(() => {
    fetch("http://localhost:8080/students")
      .then((res) => res.json())
      .then((data) => setStudents(data || []))
      .catch((err) => console.error(err))

    fetch("http://localhost:8080/news")
      .then((res) => res.json())
      .then((data) => setNews(data || []))
      .catch((err) => console.error(err))
  }, [])

  // Statistics
  const firstGradeCount = students.filter((s) => s.grade?.includes("الأول")).length
  const secondGradeCount = students.filter((s) => s.grade?.includes("الثاني")).length
  const thirdGradeCount = students.filter((s) => s.grade?.includes("الثالث")).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-3">
            {/* زر العودة */}
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowRightCircle className="h-4 w-4" />
              رجوع
            </Button>

            {/* زر تسجيل الخروج */}
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
      </div>

      <div className="container mx-auto p-4 max-w-7xl space-y-6" dir="rtl">
        {/* Welcome card */}
        <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              مرحباً {user?.name || "أدمن"}
            </CardTitle>
            <CardDescription className="text-purple-600 font-semibold text-sm md:text-base">
              لوحة إدارة نظام الحضور
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-500 text-white">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-white/80 text-sm">إجمالي الطلاب</p>
                <p className="text-2xl md:text-3xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-white/80" />
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-white/80 text-sm">الصف الأول</p>
                <p className="text-2xl md:text-3xl font-bold">{firstGradeCount}</p>
              </div>
              <Badge variant="outline" className="text-white border-white">
                {firstGradeCount}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500 text-white">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-white/80 text-sm">الصف الثاني</p>
                <p className="text-2xl md:text-3xl font-bold">{secondGradeCount}</p>
              </div>
              <Badge variant="outline" className="text-white border-white">
                {secondGradeCount}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-white">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-white/80 text-sm">الصف الثالث</p>
                <p className="text-2xl md:text-3xl font-bold">{thirdGradeCount}</p>
              </div>
              <Badge variant="outline" className="text-white border-white">
                {thirdGradeCount}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tools section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/students">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 text-lg font-semibold">
                  <UserPlus className="h-6 w-6" />
                  إدارة الطلاب
                </CardTitle>
                <CardDescription className="text-blue-600 text-sm">
                  إضافة وإدارة بيانات الطلاب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{students.length}</div>
                <p className="text-sm text-blue-600">طالب مسجل</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/attendance">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 text-lg font-semibold">
                  <ClipboardCheck className="h-6 w-6" />
                  تسجيل الحضور
                </CardTitle>
                <CardDescription className="text-green-600 text-sm">
                  نظام تسجيل الحضور المتقدم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">فتح</div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/news">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800 text-lg font-semibold">
                  <Newspaper className="h-6 w-6" />
                  إدارة الأخبار
                </CardTitle>
                <CardDescription className="text-purple-600 text-sm">
                  نشر الأخبار والإعلانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{news.length}</div>
                <p className="text-sm text-purple-600">خبر منشور</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/awards">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg font-semibold">
                  <Award className="h-6 w-6" />
                  إدارة التكريمات
                </CardTitle>
                <CardDescription className="text-yellow-600 text-sm">
                  تكريم الطلاب المتميزين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">12</div>
                <p className="text-sm text-yellow-600">تكريم هذا الشهر</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/exams">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-indigo-200 bg-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-800 text-lg font-semibold">
                  <FileText className="h-6 w-6" />
                  الامتحانات الإلكترونية
                </CardTitle>
                <CardDescription className="text-indigo-600 text-sm">
                  إنشاء وإدارة الامتحانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">3</div>
                <p className="text-sm text-indigo-600">امتحان نشط</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/settings">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 text-lg font-semibold">
                  <Settings className="h-6 w-6" />
                  إعدادات النظام
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  إعدادات المركز والنظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">
                  {availableLocations?.length || 0}
                </div>
                <p className="text-sm text-gray-600">مكان متاح</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
