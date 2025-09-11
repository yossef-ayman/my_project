"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { ArrowRight, MapPin, Plus, X } from "lucide-react"
import { Badge } from "../ui/badge"
import { ToastContainer, toast, Bounce } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const API_URL = "http://localhost:8080/places"

const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]

const CenterSettings = ({ onBack }) => {
  const navigate = useNavigate()
  const handleBack = () => {
    if (typeof onBack === "function") return onBack()
    if (window.history.length > 1) return navigate(-1)
    return navigate("/admin")
  }

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
      .catch(() =>
        toast.error("فشل تحميل الأماكن", { position: "top-right", theme: "colored", transition: Bounce })
      )
  }, [])

  // إضافة مكان
  const addPlace = async () => {
    if (!newName || !newLocation || !newFrom || !newTo || !newGrade || newDays.length === 0) {
      toast.error("يرجى إدخال كل البيانات", { position: "top-right", theme: "colored", transition: Bounce })
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
      toast.success(`تمت إضافة المكان: ${data.name}`, { position: "top-right", theme: "colored", transition: Bounce })
    } catch (err) {
      toast.error("تعذر إضافة المكان", { position: "top-right", theme: "colored", transition: Bounce })
    }
  }

  // حذف مكان
  const removePlace = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" })
      setPlaces(places.filter((p) => p._id !== id))
      toast.success("تم حذف المكان بنجاح 🗑️", { position: "top-right", theme: "colored", transition: Bounce })
    } catch (err) {
      toast.error("تعذر حذف المكان", { position: "top-right", theme: "colored", transition: Bounce })
    }
  }

  // التعامل مع اختيار/إلغاء الأيام (توجّل)
  const toggleDay = (day) => {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <ToastContainer />
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
          {/* إدخال بيانات المكان */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="اسم المكان" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="الموقع" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
            <Input type="time" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} />
            <Input type="time" value={newTo} onChange={(e) => setNewTo(e.target.value)} />

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
          </div>

          {/* اختيار الأيام (toggle badges) */}
          <div className="space-y-2 mt-3">
            <Label>الأيام المتاحة:</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <Badge
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`cursor-pointer px-3 py-1 rounded-full ${
                    newDays.includes(day)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={addPlace} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
            <Plus className="h-4 w-4" /> إضافة
          </Button>

          {/* جدول عرض الأماكن */}
          <div className="space-y-2 mt-4">
            <Label>الأماكن المسجلة:</Label>
            {places.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد أماكن مضافة بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 text-sm text-center">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">المكان</th>
                      <th className="border p-2">الموقع</th>
                      <th className="border p-2">الصف</th>
                      <th className="border p-2">الوقت</th>
                      <th className="border p-2">الأيام</th>
                      <th className="border p-2">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {places.map((place) => (
                      <tr key={place._id} className="hover:bg-gray-50">
                        <td className="border p-2">{place.name}</td>
                        <td className="border p-2">{place.location}</td>
                        <td className="border p-2">{place.grade}</td>
                        <td className="border p-2">{place.from} → {place.to}</td>
                        <td className="border p-2">
                          {place.days?.map((d) => (
                            <Badge key={d} className="mx-1 bg-blue-100 text-blue-700">{d}</Badge>
                          ))}
                        </td>
                        <td className="border p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => removePlace(place._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CenterSettings
