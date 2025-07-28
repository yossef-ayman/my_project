"use client"

import { useState } from "react"
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

const StudentPortal = ({ user, onLogout, student }) => {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedExam, setSelectedExam] = useState(null)
  const [examResults, setExamResults] = useState([])
  const [qrGenerated, setQrGenerated] = useState(false)

  const exams = [
    {
      id: "1",
      title: "امتحان الرياضيات - الوحدة الأولى",
      subject: "رياضيات",
      description: "امتحان شامل على الوحدة الأولى من منهج الرياضيات",
      date: "2024-02-15",
      duration: "120",
      questions: [
        {
          id: "q1",
          question: "ما هو ناتج 2 + 2؟",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
        },
        {
          id: "q2",
          question: "ما هو الجذر التربيعي للعدد 16؟",
          options: ["2", "3", "4", "5"],
          correctAnswer: 2,
        },
      ],
      isActive: true,
    },
  ]

  const news = [
    {
      id: "1",
      title: "بداية العام الدراسي الجديد",
      content: "نتمنى لجميع الطلاب عاماً دراسياً موفقاً مليئاً بالنجاح والتفوق",
      date: "2024-01-15",
      priority: "مهم",
    },
  ]

  const awards = [
    {
      id: "1",
      studentName: user.name,
      title: "الطالب المتفوق",
      description: "حصل على أعلى الدرجات في امتحان الرياضيات",
      date: "2024-01-20",
      type: "تفوق",
    },
  ]

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
    return examResults.find((result) => result.examId === examId)
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
      case "عاجل":
        return "bg-red-500"
      case "مهم":
        return "bg-orange-500"
      default:
        return "bg-blue-500"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "تفوق":
        return "bg-yellow-500"
      case "حضور":
        return "bg-green-500"
      case "سلوك":
        return "bg-blue-500"
      case "مشاركة":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const generateQR = () => {
    setQrGenerated(true)
  }

  if (currentView === "exam" && selectedExam) {
    return (
      <ExamInterface
        exam={selectedExam}
        onBack={() => {
          setCurrentView("dashboard")
          setSelectedExam(null)
        }}
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
            onClick={onLogout}
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        <div className="space-y-6" dir="rtl">
          {/* ترحيب محسن */}
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-gradient animate-slideInUp">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gradient text-glow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-glow">
                  <User className="h-6 w-6 text-white animate-wiggle" />
                </div>
                مرحباً {user.name}
              </CardTitle>
              <CardDescription className="text-purple-600 font-semibold">
                أهلاً بك في منصة أستاذ المهندسين محمد الإبراشي - فرع المعادي
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                الامتحانات الإلكترونية
              </CardTitle>
              <CardDescription>الامتحانات المتاحة للحل</CardDescription>
            </CardHeader>
            <CardContent>
              {exams.filter((exam) => exam.isActive).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد امتحانات متاحة حالياً</p>
              ) : (
                <div className="space-y-4">
                  {exams
                    .filter((exam) => exam.isActive)
                    .map((exam) => {
                      const result = getExamResult(exam.id)
                      return (
                        <Card
                          key={exam.id}
                          className="border-l-4 border-l-blue-400 hover:shadow-md transition-all duration-300"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{exam.title}</h3>
                                <p className="text-muted-foreground mt-1">{exam.description}</p>
                                <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    {exam.subject}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {exam.duration} دقيقة
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {exam.questions.length} سؤال
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {result ? (
                                  <div className="text-center">
                                    <Badge className="bg-green-500 text-white mb-2">تم الحل</Badge>
                                    <div className="text-sm">
                                      <div className="font-bold text-green-600">
                                        {result.score}/{result.totalQuestions}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {Math.round((result.score / result.totalQuestions) * 100)}%
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => handleStartExam(exam)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Play className="h-4 w-4 ml-2" />
                                    بدء الامتحان
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* الأخبار والإعلانات */}
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                الأخبار والإعلانات
              </CardTitle>
              <CardDescription>آخر الأخبار والإعلانات المهمة</CardDescription>
            </CardHeader>
            <CardContent>
              {news.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد أخبار جديدة</p>
              ) : (
                <div className="space-y-4">
                  {news.map((item) => (
                    <Card
                      key={item.id}
                      className="border-l-4 border-l-purple-400 hover:shadow-md transition-all duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-muted-foreground mt-2">{item.content}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(item.date).toLocaleDateString("ar-EG")}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${getPriorityColor(item.priority)} text-white`}>{item.priority}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* التكريمات */}
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                تكريماتي
              </CardTitle>
              <CardDescription>التكريمات والجوائز التي حصلت عليها</CardDescription>
            </CardHeader>
            <CardContent>
              {awards.filter((award) => award.studentName === user.name).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لم تحصل على أي تكريمات بعد</p>
              ) : (
                <div className="space-y-4">
                  {awards
                    .filter((award) => award.studentName === user.name)
                    .map((award) => (
                      <Card
                        key={award.id}
                        className="border-l-4 border-l-yellow-400 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-yellow-50 to-orange-50"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${getTypeColor(award.type)} text-white`}>
                              <Trophy className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-yellow-800">{award.title}</h3>
                              <p className="text-yellow-700 mt-1">{award.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Star className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-600">
                                  {new Date(award.date).toLocaleDateString("ar-EG")}
                                </span>
                              </div>
                            </div>
                            <Badge className={`${getTypeColor(award.type)} text-white`}>{award.type}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code الشخصي */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <QrCode className="h-5 w-5" />
                QR Code الخاص بك
              </CardTitle>
              <CardDescription className="text-purple-600">استخدم هذا الرمز لتسجيل الحضور السريع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!qrGenerated ? (
                <Button onClick={generateQR} className="w-full bg-purple-600 hover:bg-purple-700">
                  إنشاء QR Code
                </Button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-purple-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-purple-600">QR Code</p>
                      <p className="text-xs text-purple-500">{student?.customId || "ST001"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Share className="h-4 w-4 ml-2" />
                      مشاركة
                    </Button>
                  </div>

                  <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                    <p>• احتفظ بهذا الرمز في هاتفك</p>
                    <p>• اعرضه للأستاذ عند تسجيل الحضور</p>
                    <p>• لا تشاركه مع الآخرين</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* قسم التواصل */}
          <Card className="animate-fadeIn border-gradient bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient">
                <Phone className="h-5 w-5 animate-pulse" />
                تواصل معنا
              </CardTitle>
              <CardDescription className="text-purple-600">للاستفسارات والدعم الفني</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-105">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">رقم الهاتف</p>
                      <a href="tel:01002470826" className="text-green-600 hover:text-green-700 font-bold">
                        01002470826
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-105">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                      <Facebook className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">صفحة الفيسبوك</p>
                      <a
                        href="https://www.facebook.com/profile.php?id=100083853121487"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        زيارة الصفحة
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-spin-slow">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-gray-700 font-semibold">نحن هنا لمساعدتك</p>
                    <p className="text-sm text-gray-600">تواصل معنا في أي وقت</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StudentPortal
