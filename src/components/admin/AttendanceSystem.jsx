"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { ArrowRight, Search, QrCode, Hash, Check, Calendar, Clock, Users, MapPin } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const AttendanceSystem = ({ onBack, students, onMarkAttendance }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [quickId, setQuickId] = useState("")
  const [todayAttendance, setTodayAttendance] = useState(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [centerName] = useState("مركز أستاذ المهندسين محمد الإبراشي - فرع المعادي")
  const { toast } = useToast()
  const inputRef = useRef(null)

  const today = new Date().toLocaleDateString("ar-EG")

  // تحميل بيانات الحضور من localStorage
  useEffect(() => {
    const savedAttendance = localStorage.getItem(`attendance-${today}`)
    if (savedAttendance) {
      setTodayAttendance(new Set(JSON.parse(savedAttendance)))
    }
  }, [today])

  // حفظ بيانات الحضور في localStorage
  useEffect(() => {
    localStorage.setItem(`attendance-${today}`, JSON.stringify(Array.from(todayAttendance)))
  }, [todayAttendance, today])

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.customId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const markAttendance = (studentId) => {
    if (todayAttendance.has(studentId)) {
      toast({
        title: "تم التسجيل مسبقاً",
        description: "تم تسجيل حضور هذا الطالب اليوم بالفعل",
        variant: "destructive",
      })
      return
    }

    setTodayAttendance((prev) => new Set(prev).add(studentId))
    onMarkAttendance(studentId, "القاعة الرئيسية")

    const student = students.find((s) => s.id === studentId)
    toast({
      title: "✅ تم تسجيل الحضور",
      description: `تم تسجيل حضور ${student?.name} بنجاح`,
    })
  }

  const handleQuickAttendance = () => {
    if (!quickId.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الطالب",
        variant: "destructive",
      })
      return
    }

    const student = students.find((s) => s.customId.toLowerCase() === quickId.toLowerCase().trim())
    if (!student) {
      toast({
        title: "طالب غير موجود",
        description: `لا يوجد طالب برقم ${quickId}`,
        variant: "destructive",
      })
      setQuickId("")
      inputRef.current?.focus()
      return
    }

    markAttendance(student.id)
    setQuickId("")
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleQuickAttendance()
    }
  }

  const startQRScanning = () => {
    setIsScanning(true)
    // محاكاة مسح QR Code
    setTimeout(() => {
      const randomStudent = students[Math.floor(Math.random() * students.length)]
      markAttendance(randomStudent.id)
      setIsScanning(false)
      toast({
        title: "تم مسح QR Code",
        description: `تم تسجيل حضور ${randomStudent.name} عبر QR Code`,
      })
    }, 2000)
  }

  const getGradeText = (grade) => {
    return grade === "first" ? "الأول الثانوي" : "الثاني الثانوي"
  }

  const attendancePercentage = students.length > 0 ? Math.round((todayAttendance.size / students.length) * 100) : 0

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">نظام تسجيل الحضور</h1>
        <Badge variant="secondary" className="mr-auto">
          {today}
        </Badge>
      </div>

      {/* معلومات المركز */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <MapPin className="h-5 w-5" />
            {centerName}
          </CardTitle>
          <CardDescription className="text-blue-600">نظام تسجيل الحضور الإلكتروني</CardDescription>
        </CardHeader>
      </Card>

      {/* إحصائيات اليوم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card-1 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">إجمالي الطلاب</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card-2 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">حضر اليوم</p>
                <p className="text-2xl font-bold">{todayAttendance.size}</p>
              </div>
              <Check className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card-3 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">نسبة الحضور</p>
                <p className="text-2xl font-bold">{attendancePercentage}%</p>
              </div>
              <Calendar className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card-4 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">الوقت</p>
                <p className="text-lg font-bold">
                  {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <Clock className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تسجيل الحضور السريع */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Hash className="h-5 w-5" />
              تسجيل سريع بالرقم
            </CardTitle>
            <CardDescription className="text-green-600">أدخل رقم الطالب لتسجيل الحضور</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="أدخل رقم الطالب (مثل: ST001)"
                value={quickId}
                onChange={(e) => setQuickId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="text-lg font-bold text-center"
                autoFocus
              />
              <Button onClick={handleQuickAttendance} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 ml-2" />
                تسجيل
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <QrCode className="h-5 w-5" />
              مسح QR Code
            </CardTitle>
            <CardDescription className="text-purple-600">استخدم كاميرا الهاتف لمسح QR Code</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={startQRScanning}
              disabled={isScanning}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري المسح...
                </div>
              ) : (
                <>
                  <QrCode className="h-4 w-4 ml-2" />
                  بدء المسح
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* البحث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث عن الطلاب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو رقم الطالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* قائمة الطلاب */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب</CardTitle>
          <CardDescription>انقر على "تسجيل الحضور" لتسجيل حضور الطالب</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد طلاب مسجلين"}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const isPresent = todayAttendance.has(student.id)
                return (
                  <Card
                    key={student.id}
                    className={`transition-all duration-300 ${
                      isPresent ? "border-green-200 bg-green-50" : "hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              isPresent ? "bg-green-500" : "bg-gray-400"
                            }`}
                          >
                            {isPresent ? <Check className="h-6 w-6" /> : student.customId.slice(-2)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            <div className="flex gap-3 text-sm text-muted-foreground">
                              <span>رقم: {student.customId}</span>
                              <span>{getGradeText(student.grade)}</span>
                              <span>الحضور: {student.attendanceCount} مرة</span>
                              {student.attendanceHistory && student.attendanceHistory.length > 0 && (
                                <span>
                                  آخر حضور: {student.attendanceHistory[student.attendanceHistory.length - 1].date}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPresent ? (
                            <Badge className="bg-green-500 text-white">
                              <Check className="h-3 w-3 ml-1" />
                              حاضر
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => markAttendance(student.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              تسجيل الحضور
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
    </div>
  )
}

export default AttendanceSystem
