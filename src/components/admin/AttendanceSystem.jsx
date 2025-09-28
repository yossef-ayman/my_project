"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { ArrowRight, Search, QrCode, Hash, Check, MapPin, RotateCcw } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

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
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString("ar-EG")
  const currentTime = () =>
    new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })

  const token = localStorage.getItem("authToken")

  // 📌 تحميل الطلاب + السناتر
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resStudents = await fetch(`${process.env.REACT_APP_API_URL}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dataStudents = await resStudents.json()
        setStudents(dataStudents)

        const resPlaces = await fetch(`${process.env.REACT_APP_API_URL}/places`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dataPlaces = await resPlaces.json()
        setPlaces(dataPlaces)
      } catch (err) {
        console.error("❌ خطأ في جلب البيانات", err)
        toast.error("فشل تحميل البيانات من السيرفر")
      }
    }
    fetchData()
  }, [token])

  // 📌 تحميل حضور اليوم
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/attendance/today`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (res.ok && Array.isArray(data.attendance)) {
          const mapped = {}
          data.attendance.forEach((att) => {
            mapped[att.student] = {
              time: new Date(att.date).toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              note: att.note || "",
            }
          })
          setTodayAttendance(mapped)
          const savedNotes = Object.fromEntries(
            Object.entries(mapped).map(([key, val]) => [key, val.note || ""])
          )
          setNotes(savedNotes)
        }
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات الحضور:", err)
        toast.error("فشل تحميل بيانات الحضور")
      }
    }
    fetchAttendance()
  }, [token])

  useEffect(() => {
    localStorage.setItem(`attendance-${today}`, JSON.stringify(todayAttendance))
  }, [todayAttendance, today])

  const normalizeGrade = (grade) => {
    if (!grade) return ""
    const g = grade.toString().toLowerCase()
    if (["first", "1", "الصف الأول الثانوي", "اول"].includes(g)) return "الصف الأول الثانوي"
    if (["second", "2", "الصف الثاني الثانوي", "ثاني"].includes(g)) return "الصف الثاني الثانوي"
    if (["third", "3", "الصف الثالث الثانوي", "ثالث"].includes(g)) return "الصف الثالث الثانوي"
    return ""
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.stdcode?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchGrade = selectedGrade ? normalizeGrade(s.grade) === selectedGrade : true
      const matchPlace = selectedCenter ? s.place === selectedCenter : true
      return matchSearch && matchGrade && matchPlace
    })
  }, [students, searchTerm, selectedGrade, selectedCenter])

  const markAttendance = async (studentId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          note: notes[studentId] || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`)

      setTodayAttendance((prev) => ({
        ...prev,
        [studentId]: { time: new Date().toLocaleTimeString("ar-EG"), note: notes[studentId] || "" },
      }))
      toast.success(`تم تسجيل حضور الطالب`)
    } catch (err) {
      console.error(err)
      toast.error(err.message || "تعذر تسجيل الحضور")
    }
  }

  const resetAttendance = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/attendance/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      setTodayAttendance({})
      toast.info("تم تصفير الحضور لكل الطلاب")
    } catch (err) {
      toast.error("تعذر الاتصال بالسيرفر")
    }
  }

  const handleQuickAttendance = () => {
    if (!quickId.trim()) return toast.error("يرجى إدخال رقم الطالب")
    const student = students.find(
      (s) => (s?.stdcode || "").toLowerCase() === quickId.toLowerCase().trim()
    )
    if (!student) {
      toast.error(`لا يوجد طالب برقم ${quickId}`)
      setQuickId("")
      inputRef.current?.focus()
      return
    }
    markAttendance(student._id)
    setQuickId("")
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => { if (e.key === "Enter") handleQuickAttendance() }

  const startQRScanning = () => {
    setIsScanning(true)
    setTimeout(() => {
      if (students.length === 0) return toast.error("لا يمكن المسح لعدم وجود طلاب")
      const randomStudent = students[Math.floor(Math.random() * students.length)]
      markAttendance(randomStudent._id)
      setIsScanning(false)
      toast.success(`تم تسجيل حضور ${randomStudent?.name || "طالب"} عبر QR Code`)
    }, 2000)
  }

  const getGradeText = (grade) => {
    if (grade === "first") return "الأول الثانوي"
    if (grade === "second") return "الثاني الثانوي"
    if (grade === "third") return "الثالث الثانوي"
    return "غير محدد"
  }

  const totalStudents = filteredStudents.length
  const presentCount = filteredStudents.filter((s) => todayAttendance[s._id]).length
  const absentCount = totalStudents - presentCount
  const absencePercentage =
    totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      <ToastContainer position="top-right" autoClose={3000} />
      
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

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>اختيار السنتر</CardTitle></CardHeader>
          <CardContent>
            <select className="w-full p-2 border rounded-lg" value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}>
              <option value="">🔹 كل السناتر</option>
              {places.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>اختيار السنة الدراسية</CardTitle></CardHeader>
          <CardContent>
            <select className="w-full p-2 border rounded-lg" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
              <option value="">🔹 كل السنوات</option>
              <option value="الصف الأول الثانوي">الأول الثانوي</option>
              <option value="الصف الثاني الثانوي">الثاني الثانوي</option>
              <option value="الصف الثالث الثانوي">الثالث الثانوي</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {/* البحث */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> البحث</CardTitle></CardHeader>
        <CardContent>
          <Input placeholder="ابحث بالاسم أو بالكود..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </CardContent>
      </Card>

      {/* تسجيل سريع + QR */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-green-800"><Hash className="h-5 w-5" /> تسجيل سريع بالرقم</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input ref={inputRef} type="text" placeholder="أدخل رقم الطالب" value={quickId} onChange={(e) => setQuickId(e.target.value.toUpperCase())} onKeyPress={handleKeyPress} />
            <Button onClick={handleQuickAttendance} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 ml-2" /> تسجيل</Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-purple-800"><QrCode className="h-5 w-5" /> مسح QR Code</CardTitle></CardHeader>
          <CardContent>
            <Button onClick={startQRScanning} disabled={isScanning} className="w-full bg-purple-600 hover:bg-purple-700">
              {isScanning ? "جاري المسح..." : "بدء المسح"}
            </Button>
          </CardContent>
        </Card>
      </div>

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
                const uniqueKey = student._id
                const attendance = todayAttendance[uniqueKey]
                const isPresent = !!attendance
                const placeName = places.find(p => p._id === student.place)?.name || "-"
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
                              <span>السنتر: {placeName}</span>
                              <span>الحضور: {student?.attendanceCount || 0} مرة</span>
                            </div>
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
