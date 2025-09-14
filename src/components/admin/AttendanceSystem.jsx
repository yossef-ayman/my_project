"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { ArrowRight, Search, QrCode, Hash, Check, MapPin, RotateCcw } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const AttendanceSystem = ({ onMarkAttendance }) => {
  const [students, setStudents] = useState([])
  const [places, setPlaces] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [quickId, setQuickId] = useState("")
  const [todayAttendance, setTodayAttendance] = useState({})
  const [isScanning, setIsScanning] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [centerName] = useState("مركز أستاذ - يوسف ايمن")
  const [notes, setNotes] = useState({})
  const { toast } = useToast()
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString("ar-EG")
  const currentTime = () =>
    new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })

  // 📌 تحميل الطلاب + السناتر من الباك إند
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resStudents = await fetch(`${process.env.REACT_APP_API_URL}/students`)
        const dataStudents = await resStudents.json()
        setStudents(dataStudents)

        const resPlaces = await fetch(`${process.env.REACT_APP_API_URL}/places`) // ✅ بدون /api
        const dataPlaces = await resPlaces.json()
        setPlaces(dataPlaces)
      } catch (err) {
        console.error("❌ خطأ في جلب البيانات", err)
        toast({
          title: "خطأ",
          description: "فشل تحميل البيانات من السيرفر",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [toast])

  // 📌 تحميل بيانات الحضور من localStorage
  useEffect(() => {
    const savedAttendance = localStorage.getItem(`attendance-${today}`)
    if (savedAttendance) {
      const parsed = JSON.parse(savedAttendance)
      setTodayAttendance(parsed)
      const savedNotes = Object.fromEntries(
        Object.entries(parsed).map(([key, val]) => [key, val.note || ""])
      )
      setNotes(savedNotes)
    }
  }, [today])

  // 📌 حفظ بيانات الحضور في localStorage
  useEffect(() => {
    localStorage.setItem(`attendance-${today}`, JSON.stringify(todayAttendance))
  }, [todayAttendance, today])

  // 📌 فلترة الطلاب
  const filteredStudents = (students || [])
    .filter(
      (student) =>
        (student?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student?.stdcode || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((student) => (selectedCenter ? student.center === selectedCenter : true))
    .filter((student) => (selectedGrade ? student.grade === selectedGrade : true))

  // ✅ تسجيل الحضور
  const markAttendance = async (studentKey) => {
    if (todayAttendance[studentKey]) {
      toast({
        title: "تم التسجيل مسبقاً",
        description: "تم تسجيل حضور هذا الطالب اليوم بالفعل",
        variant: "destructive",
      })
      return
    }

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentKey }),
      })

      const note = notes[studentKey] || ""
      const time = currentTime()

      setTodayAttendance((prev) => ({
        ...prev,
        [studentKey]: { time, note },
      }))
      onMarkAttendance?.(studentKey, "القاعة الرئيسية")

      const student = students.find((s) => s.stdcode === studentKey)
      toast({
        title: "✅ تم تسجيل الحضور",
        description: `تم تسجيل حضور ${student?.name || "طالب"} بنجاح`,
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل تسجيل الحضور في السيرفر",
        variant: "destructive",
      })
    }
  }

  // ✅ Reset الحضور
  const resetAttendance = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/attendance/reset`, { method: "POST" })
      setTodayAttendance({})
      toast({
        title: "🔄 تم تصفير الحضور",
        description: "تم تصفير الحضور لكل الطلاب",
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "تعذر الاتصال بالسيرفر",
        variant: "destructive",
      })
    }
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

    const student = students.find(
      (s) => (s?.stdcode || "").toLowerCase() === quickId.toLowerCase().trim()
    )

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

    markAttendance(student.stdcode)
    setQuickId("")
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleQuickAttendance()
  }

  const startQRScanning = () => {
    setIsScanning(true)
    setTimeout(() => {
      if (students.length === 0) {
        toast({
          title: "⚠️ لا يوجد طلاب",
          description: "لا يمكن المسح لعدم وجود طلاب مسجلين",
          variant: "destructive",
        })
        setIsScanning(false)
        return
      }
      const randomStudent = students[Math.floor(Math.random() * students.length)]
      markAttendance(randomStudent.stdcode)
      setIsScanning(false)
      toast({
        title: "تم مسح QR Code",
        description: `تم تسجيل حضور ${randomStudent?.name || "طالب"} عبر QR Code`,
      })
    }, 2000)
  }

  const getGradeText = (grade) => {
    if (grade === "first") return "الأول الثانوي"
    if (grade === "second") return "الثاني الثانوي"
    if (grade === "third") return "الثالث الثانوي"
    return "غير محدد"
  }

  // 📌 الإحصائيات
  const totalStudents = filteredStudents.length
  const presentCount = filteredStudents.filter((s) => todayAttendance[s.stdcode]).length
  const absentCount = totalStudents - presentCount
  const absencePercentage =
    totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">نظام تسجيل الحضور</h1>
        <Badge variant="secondary" className="mr-auto">{today}</Badge>
        <Button variant="destructive" size="sm" onClick={resetAttendance}>
          <RotateCcw className="h-4 w-4 ml-1" /> تصفير الحضور
        </Button>
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

      {/* فلترة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>اختيار السنتر</CardTitle></CardHeader>
          <CardContent>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option value="">كل السناتر</option>
              {places.map((place) => (
                <option key={place._id} value={place.name}>{place.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>اختيار السنة الدراسية</CardTitle></CardHeader>
          <CardContent>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">كل السنوات</option>
              <option value="first">الأول الثانوي</option>
              <option value="second">الثاني الثانوي</option>
              <option value="third">الثالث الثانوي</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {/* تسجيل سريع + QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Hash className="h-5 w-5" />
              تسجيل سريع بالرقم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="أدخل رقم الطالب"
                value={quickId}
                onChange={(e) => setQuickId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="text-lg font-bold text-center"
              />
              <Button onClick={handleQuickAttendance} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 ml-2" /> تسجيل
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
          </CardHeader>
          <CardContent>
            <Button onClick={startQRScanning} disabled={isScanning} className="w-full bg-purple-600 hover:bg-purple-700">
              {isScanning ? "جاري المسح..." : "بدء المسح"}
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
          <Input
            placeholder="ابحث بالاسم أو رقم الطالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* إحصائيات */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">📊 إحصائيات الغياب</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">إجمالي الطلاب</p>
            <p className="text-xl font-bold text-blue-700">{totalStudents}</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">حاضر ✅</p>
            <p className="text-xl font-bold text-green-600">{presentCount}</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">غائب ❌</p>
            <p className="text-xl font-bold text-red-600">{absentCount}</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">نسبة الغياب</p>
            <p className="text-xl font-bold text-purple-700">{absencePercentage}%</p>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الطلاب */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب</CardTitle>
          <CardDescription>اضغط على "تسجيل الحضور" لتسجيل الطالب</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "لا توجد نتائج" : "لا يوجد طلاب"}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const uniqueKey = student.stdcode
                const attendance = todayAttendance[uniqueKey]
                const isPresent = !!attendance
                return (
                  <Card key={uniqueKey} className={`transition-all duration-300 ${isPresent ? "border-green-200 bg-green-50" : "hover:shadow-md"}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${isPresent ? "bg-green-500" : "bg-gray-400"}`}>
                            {isPresent ? <Check className="h-6 w-6" /> : (student?.stdcode || "??").slice(-2)}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-lg">{student?.name || "طالب مجهول"}</h3>
                            <div className="flex gap-3 text-sm text-muted-foreground flex-wrap">
                              <span>رقم: {student?.stdcode || "??"}</span>
                              <span>{getGradeText(student?.grade)}</span>
                              <span>السنتر: {student?.center || "-"}</span>
                              <span>الحضور: {student?.attendanceCount || 0} مرة</span>
                            </div>

                            {/* حقل الملاحظة */}
                            <Input
                              placeholder="أضف ملاحظة..."
                              value={notes[uniqueKey] || ""}
                              onChange={(e) => setNotes((prev) => ({ ...prev, [uniqueKey]: e.target.value }))}
                              className="mt-1 text-sm"
                              disabled={isPresent}
                            />

                            {attendance && (
                              <p className="text-xs text-gray-500 mt-1">
                                تم التسجيل الساعة: {attendance.time}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          {isPresent ? (
                            <Badge className="bg-green-500 text-white">
                              <Check className="h-3 w-3 ml-1" /> حاضر
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => markAttendance(uniqueKey)}
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