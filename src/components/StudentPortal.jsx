"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  FileText,
  Award,
  Newspaper,
  LogOut,
  Calendar,
  Star,
  Trophy,
  User,
  Phone,
  Facebook,
  MessageCircle,
  Play,
  Clock,
  QrCode,
  Download,
  Share,
} from "lucide-react"
import ExamInterface from "./student/ExamInterface"

const StudentPortal = ({ user = {}, student = {} }) => {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedExam, setSelectedExam] = useState(null)
  const [exams, setExams] = useState([])
  const [examResults, setExamResults] = useState([])
  const [news, setNews] = useState([])
  const [awards, setAwards] = useState([])
  const [showAllNews, setShowAllNews] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)

  const token = localStorage.getItem("authToken")

  // ✅ جلب الامتحانات النشطة
  useEffect(() => {
    if (!token) return
    fetch(`${process.env.REACT_APP_API_URL}/exams/active`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setExams)
      .catch(err => console.error("خطأ تحميل الامتحانات:", err))
  }, [token])

  // ✅ جلب الأخبار
  useEffect(() => {
    if (!token) return
    fetch(`${process.env.REACT_APP_API_URL}/news`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setNews)
      .catch(err => console.error("خطأ تحميل الأخبار:", err))
  }, [token])

  // ✅ جلب التكريمات الخاصة بالطالب
  useEffect(() => {
    if (!student?._id || !token) return
    fetch(`${process.env.REACT_APP_API_URL}/awards/${student._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAwards)
      .catch(err => console.error("خطأ تحميل الجوائز:", err))
  }, [student, token])

  // ✅ تحميل نتائج الامتحانات من localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("examResults") || "[]")
      setExamResults(Array.isArray(saved) ? saved : [])
    } catch (err) {
      console.error("خطأ قراءة نتائج الامتحانات:", err)
    }
  }, [])

  const handleStartExam = (exam) => {
    setSelectedExam(exam)
    setCurrentView("exam")
  }

  const handleExamComplete = (result) => {
    setExamResults((prev) => [...prev, result])
    const savedResults = JSON.parse(localStorage.getItem("examResults") || "[]")
    localStorage.setItem("examResults", JSON.stringify([...savedResults, result]))
  }

  const getExamResult = (examId) => {
    return examResults.find((r) => r.examId === examId)
  }

  const getCurrentWeekAttendance = () => {
    if (!student) return false
    const now = new Date()
    const currentWeek = getWeekKey(now)
    return student.weeklyAttendance?.[currentWeek] || false
  }

  const getWeekKey = (date) => {
    const year = date.getFullYear()
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week}`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "عاجل": return "bg-red-500"
      case "مهم": return "bg-orange-500"
      default: return "bg-blue-500"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "تفوق": return "bg-yellow-500"
      case "حضور": return "bg-green-500"
      case "سلوك": return "bg-blue-500"
      case "مشاركة": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const generateQR = () => setQrGenerated(true)

  // ✅ عرض واجهة الامتحان
  if (currentView === "exam" && selectedExam) {
    return (
      <ExamInterface
        exam={selectedExam}
        onBack={() => { setCurrentView("dashboard"); setSelectedExam(null) }}
        onComplete={handleExamComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* شريط علوي */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">بوابة الطالب</span>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("user")
              localStorage.removeItem("examResults")
              window.location.href = "/" // العودة للـ Login page
            }}
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
          >
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        <div className="space-y-6" dir="rtl">
          {/* بطاقة الترحيب */}
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-gradient animate-slideInUp">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gradient text-glow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-glow">
                  <User className="h-6 w-6 text-white animate-wiggle" />
                </div>
                مرحباً {user?.name || "طالب"}
              </CardTitle>
              <CardDescription className="text-purple-600 font-semibold">
                أهلاً بك في منصة أستاذ الاستاذ - فرع المعادي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center interactive-card p-4 bg-white/70 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">رقم الطالب</p>
                  <Badge variant="outline" className="text-lg font-bold animate-pulse border-blue-300 text-blue-700">
                    {student?.customId || "ST001"}
                  </Badge>
                </div>
                <div className="text-center interactive-card p-4 bg-white/70 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">إجمالي الحضور</p>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold animate-bounce">
                    {student?.attendanceCount || 0} مرة
                  </Badge>
                </div>
                <div className="text-center interactive-card p-4 bg-white/70 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">حالة هذا الأسبوع</p>
                  <Badge
                    className={`text-sm font-bold animate-pulse ${
                      getCurrentWeekAttendance() ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                    }`}
                  >
                    {getCurrentWeekAttendance() ? "تم الحضور" : "لم تحضر بعد"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الامتحانات المتاحة */}
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> الامتحانات الإلكترونية</CardTitle>
              <CardDescription>الامتحانات المتاحة للحل</CardDescription>
            </CardHeader>
            <CardContent>
              {exams.filter((exam) => exam.isActive).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد امتحانات متاحة حالياً</p>
              ) : (
                <div className="space-y-4">
                  {exams.filter((exam) => exam.isActive).map((exam) => {
                    const result = getExamResult(exam._id)
                    return (
                      <Card key={exam._id} className="border-l-4 border-l-blue-400 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-lg">{exam.title}</h3>
                            <p className="text-muted-foreground mt-1">{exam.subject}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{exam.duration || "-"} دقيقة</span>
                              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{exam.questions?.length || 0} سؤال</span>
                            </div>
                          </div>
                          <div>
                            {result ? (
                              <Badge className="bg-green-500 text-white">تم الحل</Badge>
                            ) : (
                              <Button onClick={() => handleStartExam(exam)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                <Play className="h-4 w-4" /> بدء الامتحان
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* الأخبار */}
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" /> الأخبار والإعلانات</CardTitle>
              <CardDescription>آخر الأخبار والإعلانات المهمة</CardDescription>
            </CardHeader>
            <CardContent>
              {news.length === 0 ? (
                <p className="text-center py-8">لا توجد أخبار جديدة</p>
              ) : (
                <div className="space-y-4">
                  {(showAllNews ? news : [news[0]]).map((item) => (
                    <Card key={item._id} className="border-l-4 border-l-purple-400 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full max-h-64 object-contain rounded-md border mb-2" />}
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground mt-1">{item.content}</p>
                        <Badge className={`${getPriorityColor(item.priority)} text-white mt-2`}>{item.priority}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  {news.length > 1 && (
                    <div className="text-center">
                      <Button onClick={() => setShowAllNews(!showAllNews)} variant="outline" className="mt-2">
                        {showAllNews ? "إخفاء باقي الإعلانات" : "عرض جميع الإعلانات"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* التكريمات */}
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> تكريماتي</CardTitle>
              <CardDescription>التكريمات والجوائز التي حصلت عليها</CardDescription>
            </CardHeader>
            <CardContent>
              {awards.length === 0 ? (
                <p className="text-center py-8">لم تحصل على أي تكريمات بعد</p>
              ) : (
                <div className="space-y-4">
                  {awards.map((award) => (
                    <Card key={award._id} className="border-l-4 border-l-yellow-400 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-yellow-800">{award.title}</h3>
                          <p className="text-yellow-700">{award.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-600">{award.date ? new Date(award.date).toLocaleDateString("ar-EG") : ""}</span>
                          </div>
                        </div>
                        <Badge className={`${getTypeColor(award.type)} text-white`}>{award.type}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800"><QrCode className="h-5 w-5" /> QR Code الخاص بك</CardTitle>
              <CardDescription className="text-purple-600">استخدم هذا الرمز لتسجيل الحضور السريع</CardDescription>
            </CardHeader>
            <CardContent>
              {!qrGenerated ? (
                <Button onClick={generateQR} className="w-full bg-purple-600 hover:bg-purple-700">إنشاء QR Code</Button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-purple-200 rounded-lg flex items-center justify-center">
                    <div>
                      <QrCode className="h-16 w-16 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-purple-600">{student?.customId || "ST001"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">تحميل <Download className="h-4 w-4 ml-2" /></Button>
                    <Button variant="outline" className="flex-1">مشاركة <Share className="h-4 w-4 ml-2" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default StudentPortal
