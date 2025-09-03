"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { ArrowRight, MapPin, Calendar, Plus, X } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const API_URL = "http://localhost:8080/places"

const CenterSettings = ({ onBack }) => {
  const navigate = useNavigate()
  const handleBack = () => {
    if (typeof onBack === "function") return onBack()
    if (window.history.length > 1) return navigate(-1)
    return navigate("/admin")
  }

  const { toast } = useToast()
  const [places, setPlaces] = useState([])
  const [newName, setNewName] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newFrom, setNewFrom] = useState("")
  const [newTo, setNewTo] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [newDays, setNewDays] = useState([])

  // تحميل الأماكن
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch(() => toast({ title: "خطأ", description: "فشل تحميل الأماكن", variant: "destructive" }))
  }, [])

  // إضافة مكان
  const addPlace = async () => {
    if (!newName || !newLocation || !newFrom || !newTo || !newGrade || newDays.length === 0) {
      toast({ title: "خطأ", description: "يرجى إدخال كل البيانات", variant: "destructive" })
      return
    }

    const newPlace = { name: newName, location: newLocation, from: newFrom, to: newTo, grade: newGrade, days: newDays }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlace),
      })
      const data = await res.json()
      setPlaces([...places, data])
      setNewName("")
      setNewLocation("")
      setNewFrom("")
      setNewTo("")
      setNewGrade("")
      setNewDays([])
      toast({ title: "تم الإضافة", description: `تمت إضافة المكان: ${data.name}` })
    } catch (err) {
      toast({ title: "خطأ", description: "تعذر إضافة المكان", variant: "destructive" })
    }
  }

  // حذف مكان
  const removePlace = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" })
      setPlaces(places.filter((p) => p._id !== id))
      toast({ title: "تم الحذف", description: "تم حذف المكان بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "تعذر حذف المكان", variant: "destructive" })
    }
  }

  // التعامل مع اختيار أيام متعددة
  const handleDaysChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (opt) => opt.value)
    setNewDays(options)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">إعدادات المركز</h1>
      </div>

      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            إدارة الأماكن
          </CardTitle>
          <CardDescription>إضافة وحذف أماكن الحضور</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="اسم المكان" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="الموقع" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
            <Input type="time" placeholder="من" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} />
            <Input type="time" placeholder="إلى" value={newTo} onChange={(e) => setNewTo(e.target.value)} />

            {/* اختيار الصف */}
            <select
              className="w-full p-2 border rounded"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
            >
              <option value="">اختر الصف</option>
              <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
              <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
              <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
            </select>

            {/* اختيار الأيام (متعدد) */}
            <select
              multiple
              className="w-full p-2 border rounded h-24"
              value={newDays}
              onChange={handleDaysChange}
            >
              <option value="السبت">السبت</option>
              <option value="الأحد">الأحد</option>
              <option value="الاثنين">الاثنين</option>
              <option value="الثلاثاء">الثلاثاء</option>
              <option value="الأربعاء">الأربعاء</option>
              <option value="الخميس">الخميس</option>
              <option value="الجمعة">الجمعة</option>
            </select>
          </div>
          <Button onClick={addPlace} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" /> إضافة
          </Button>

          {/* عرض الأماكن */}
          <div className="space-y-2 mt-4">
            <Label>الأماكن المسجلة:</Label>
            {places.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد أماكن مضافة بعد</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {places.map((place) => (
                  <Card key={place._id} className="p-3 border border-gray-200 shadow-sm">
                    <CardTitle className="flex justify-between items-center text-lg">
                      {place.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removePlace(place._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <CardContent className="text-sm space-y-1">
                      <p>📍 {place.location}</p>
                      <p>⏰ {place.from} → {place.to}</p>
                      <p>🎓 {place.grade}</p>
                      <p>📅 {place.days?.join(", ")}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CenterSettings
