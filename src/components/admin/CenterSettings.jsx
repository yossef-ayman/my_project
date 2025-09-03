// src/components/admin/CenterSettings.jsx
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { ArrowRight, MapPin, Calendar, Plus, X, Clock } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const CenterSettings = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [availableDays, setAvailableDays] = useState(["السبت", "الأحد", "الإثنين"])
  const [newLocation, setNewLocation] = useState("")
  const [newTime, setNewTime] = useState("")
  const [centers, setCenters] = useState([])

  const handleBack = () => {
    if (window.history.length > 1) return navigate(-1)
    return navigate("/admin")
  }

  const addCenter = () => {
    const loc = newLocation.trim()
    const time = newTime.trim()
    if (!loc || !time) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المركز ووقت الحصة", variant: "destructive" })
      return
    }
    if (centers.some(c => c.name === loc)) {
      toast({ title: "خطأ", description: "هذا المركز موجود بالفعل", variant: "destructive" })
      return
    }

    const today = new Date()
    const newCenter = {
      name: loc,
      days: [...availableDays],
      year: today.getFullYear(),
      date: today.toLocaleDateString("ar-EG"),
      time
    }

    setCenters([newCenter, ...centers])
    setNewLocation("")
    setNewTime("")
    toast({ title: "تم الإضافة", description: `تم إضافة المركز: ${loc}` })
  }

  const removeCenter = (name) => {
    setCenters(centers.filter(c => c.name !== name))
    toast({ title: "تم الحذف", description: `تم حذف المركز: ${name}` })
  }

  const addDay = (day) => {
    if (!availableDays.includes(day)) {
      setAvailableDays([...availableDays, day])
      toast({ title: "تم الإضافة", description: `تم إضافة اليوم: ${day}` })
    }
  }

  const removeDay = (day) => {
    setAvailableDays(availableDays.filter(d => d !== day))
    toast({ title: "تم الحذف", description: `تم حذف اليوم: ${day}` })
  }

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gray-50" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات المراكز</h1>
        </div>
      </div>

      {/* إضافة مركز جديد مع الوقت */}
      <Card className="animate-fadeIn border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            إضافة مركز جديد
          </CardTitle>
          <CardDescription>يتم إضافة الأيام الحالية والسنة والتاريخ تلقائياً</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="اسم المركز الجديد"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCenter()}
            />
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCenter()}
            />
          </div>
          <Button onClick={addCenter} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
            <Plus className="h-4 w-4" /> إضافة
          </Button>
        </CardContent>
      </Card>

      {/* أيام الأسبوع المتاحة */}
      <Card className="animate-fadeIn border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            إدارة أيام التسجيل
          </CardTitle>
          <CardDescription>انقر على الأيام لإضافتها أو حذفها بسرعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((day) => (
              <Button
                key={day}
                variant={availableDays.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (availableDays.includes(day)) removeDay(day)
                  else addDay(day)
                }}
              >
                {day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* قائمة المراكز */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {centers.length === 0 && <p className="text-gray-500">لا توجد مراكز مضافة بعد</p>}
        {centers.map(center => (
          <Card key={center.name} className="rounded-2xl shadow-lg border-l-4 border-l-blue-400 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{center.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> {center.time} | السنة: {center.year} | التاريخ: {center.date}
                    </div>
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCenter(center.name)}>
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Label>الأيام المتاحة:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {center.days.map(day => (
                  <Badge key={day} variant="secondary">{day}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CenterSettings
