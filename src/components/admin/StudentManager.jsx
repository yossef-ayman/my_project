"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { User, Plus, ArrowRight, AlertCircle } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { useEffect } from "react";
const StudentManager = ({ students = [], onAddStudent, onRemoveStudent }) => {
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    parentPhone: "",
    stdcode: "",
    place: "",
    grade: "",
  })
  const { toast } = useToast()
  const [places, setPlaces] = useState([]);
  
  useEffect(() => {
    fetch("http://localhost:8080/places")
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error("❌ Error fetching places:", err));
  }, []);
  const generateStudentId = () => {
    const lastId =
      students.length > 0 ? Math.max(...students.map((s) => parseInt(s.stdcode?.replace("ST", "")) || 0)) : 0
    const newId = `ST${String(lastId + 1).padStart(3, "0")}`
    setNewStudent({ ...newStudent, stdcode: newId })
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8)
    setNewStudent({ ...newStudent, password })
  }

  const handleAddStudent = () => {
    const { name, email, password, parentPhone, stdcode, grade, place } = newStudent
    if (!name || !email || !password || !parentPhone || !stdcode || !grade || !place) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }

    onAddStudent({
      stdcode,
      name,
      phone: newStudent.phone,
      parentPhone,
      place,
      grade,
      registrationDate: new Date().toLocaleDateString("ar-EG"),
      attendanceCount: 0,
    })

    toast({ title: "تم", description: `تمت إضافة الطالب ${name} بنجاح` })
    setNewStudent({ name: "", email: "", password: "", phone: "", parentPhone: "", stdcode: "", place: "", grade: "" })
    setShowAddForm(false)
  }

  const handleDeleteStudent = (id) => {
    onRemoveStudent(id)
    toast({ title: "تم", description: "تم حذف الطالب بنجاح" })
  }

  return (
    <div className="space-y-6 p-4" dir="rtl">
      {/* الهيدر */}
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate("/admin")} variant="ghost" className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4" /> العودة
        </Button>
        <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-transform">
          <Plus className="w-4 h-4 ml-2" /> إضافة طالب جديد
        </Button>
      </div>

      {/* تنبيه الحضور */}
      <Card className="border-yellow-300 bg-yellow-50 shadow-sm">
        <CardContent className="p-4 flex gap-2 items-center">
          <AlertCircle className="text-yellow-600" />
          <span className="text-yellow-800 font-semibold">كل طالب يمكنه الحضور مرة واحدة أسبوعياً</span>
        </CardContent>
      </Card>

      {/* فورم إضافة طالب */}
      {showAddForm && (
        <Card className="border-blue-300 bg-blue-50 shadow-md animate-fadeIn">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" /> إضافة طالب جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>اسم الطالب</Label>
                <Input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
              </div>
              <div>
                <Label>كود الطالب</Label>
                <div className="flex gap-2">
                  <Input value={newStudent.stdcode} onChange={(e) => setNewStudent({ ...newStudent, stdcode: e.target.value.toUpperCase() })} />
                  <Button type="button" onClick={generateStudentId} className="bg-blue-600 text-white hover:bg-blue-700">توليد</Button>
                </div>
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
              </div>
              <div>
                <Label>كلمة المرور</Label>
                <div className="flex gap-2">
                  <Input value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} />
                  <Button type="button" onClick={generatePassword} className="bg-purple-600 text-white hover:bg-purple-700">توليد</Button>
                </div>
              </div>
              <div>
                <Label>رقم ولي الأمر</Label>
                <Input value={newStudent.parentPhone} onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })} />
              </div>
              <div>
                <Label>رقم الطالب</Label>
                <Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
              </div>
              <div>
                <Label>الصف الدراسي</Label>
                <select className="w-full p-2 border rounded" value={newStudent.grade} onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}>
                  <option value="">اختر الصف</option>
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                </select>
              </div>
               <div>
      <Label>المكان</Label>
      <select
        className="w-full p-2 border rounded"
        value={newStudent.place}
        onChange={(e) => setNewStudent({ ...newStudent, place: e.target.value })}
      >
        <option value="">اختر المكان</option>
        {places.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddStudent} className="bg-green-500 text-white hover:bg-green-600">إضافة</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الطلاب */}
      <div className="grid gap-4">
        {students.map((s) => (
          <Card key={s.stdcode} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
              <CardDescription>{s.stdcode} • {s.place.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p>الهاتف: {s.parentPhone}</p>
                <p>الحضور: {s.attendanceCount} مرة</p>
                <p>تاريخ التسجيل: {s.registrationDate}</p>
              </div>
              <Button onClick={() => handleDeleteStudent(s.stdcode)} variant="outline" className="text-red-600 hover:bg-red-50">حذف</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudentManager
