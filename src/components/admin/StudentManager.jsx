"use client"

import React, { useState, useMemo ,useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { User, Plus, Search, Trash2, Edit2, ArrowRight } from "lucide-react"

function StudentManager() {
  const navigate = useNavigate()

  const [students, setStudents] = useState([
    {
      id: 1,
      name: "أحمد ياسر",
      email: "ahmed@example.com",
      stdcode: "ST001",
      phone: "01012345678",
      parentPhone: "01098765432",
      grade: "الصف الأول الثانوي",
      place: "المعمل",
      registrationDate: "2025-09-01",
      attendanceCount: 5,
    },
  ])

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    stdcode: "",
    phone: "",
    parentPhone: "",
    grade: "",
    place: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterPlace, setFilterPlace] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
   const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/places")
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error("❌ Error fetching places:", err));
  }, []);
  // ✅ البحث + الفلترة
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.stdcode?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchGrade = filterGrade ? s.grade === filterGrade : true
      const matchPlace = filterPlace ? s.place === filterPlace : true

      return matchSearch && matchGrade && matchPlace
    })
  }, [students, searchTerm, filterGrade, filterPlace])

  // ✅ إضافة طالب
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.stdcode || !newStudent.grade || !newStudent.place) return

    setStudents((prev) => [
      ...prev,
      {
        ...newStudent,
        id: Date.now(),
        registrationDate: new Date().toLocaleDateString("ar-EG"),
        attendanceCount: 0,
      },
    ])

    setNewStudent({
      name: "",
      email: "",
      stdcode: "",
      phone: "",
      parentPhone: "",
      grade: "",
      place: "",
    })
    setShowAddForm(false)
  }

  // ✅ حذف طالب
  const handleRemoveStudent = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  // ✅ ألوان مختلفة لكل صف
  const gradeColors = {
    "الصف الأول الثانوي": "from-blue-500 to-blue-700",
    "الصف الثاني الثانوي": "from-green-500 to-green-700",
    "الصف الثالث الثانوي": "from-purple-500 to-purple-700",
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir="rtl">
      //{/* الهيدر */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin")}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-xl flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" /> رجوع
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">📚 إدارة الطلاب</h1>
        </div>
        <Button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4 ml-2" /> {showAddForm ? "إغلاق" : "إضافة طالب"}
        </Button>
      </div>

      {/* البحث والفلترة */}
      <Card className="shadow-md border rounded-2xl">
        <CardContent className="grid md:grid-cols-3 gap-4 p-4">
          <div>
            <Label>بحث</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="ابحث بالاسم أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg"
              />
              <Search className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div>
            <Label>الصف</Label>
            <select
              className="w-full p-2 border rounded-lg"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="">الكل</option>
              <option value="الصف الأول الثانوي">الأول الثانوي</option>
              <option value="الصف الثاني الثانوي">الثاني الثانوي</option>
              <option value="الصف الثالث الثانوي">الثالث الثانوي</option>
            </select>
          </div>
          <div>
            <Label>المكان</Label>
            <select
              className="w-full p-2 border rounded"
              value={filterPlace}
              onChange={(e) => setFilterPlace(e.target.value)}
            >
              <option value="">الكل</option>
              {places.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* فورم إضافة طالب */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-blue-300 bg-blue-50 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="h-5 w-5" /> إضافة طالب جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="اسم الطالب"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="rounded-lg"
                />
                <Input
                  placeholder="كود الطالب"
                  value={newStudent.stdcode}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, stdcode: e.target.value.toUpperCase() })
                  }
                  className="rounded-lg"
                />
                <Input
                  placeholder="البريد الإلكتروني"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="rounded-lg"
                />
                <Input
                  placeholder="رقم الطالب"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="rounded-lg"
                />
                <Input
                  placeholder="رقم ولي الأمر"
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  className="rounded-lg"
                />
                <select
                  className="w-full p-2 border rounded-lg"
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                >
                  <option value="">اختر الصف</option>
                  <option value="الصف الأول الثانوي">الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الثالث الثانوي</option>
                </select>
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
              <div className="flex gap-2">
                <Button
                  onClick={handleAddStudent}
                  className="bg-green-500 text-white hover:bg-green-600 rounded-xl"
                >
                  إضافة
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* قائمة الطلاب */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition rounded-2xl">
              <div
                className={`h-2 bg-gradient-to-r ${
                  gradeColors[s.grade] || "from-gray-400 to-gray-600"
                }`}
              />
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {s.name}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {s.stdcode} • {s.grade} • {places.find((p) => p._id === s.place)?.name || "—"}
                </p>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p>📧 {s.email}</p>
                <p>📱 الطالب: {s.phone || "—"}</p>
                <p>👨‍👩‍👦 ولي الأمر: {s.parentPhone || "—"}</p>
                <p>✅ الحضور: {s.attendanceCount} مرة</p>
                <p>📅 التسجيل: {s.registrationDate}</p>
                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg">
                    <Edit2 className="w-4 h-4" /> تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveStudent(s.id)}
                    className="text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" /> حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default StudentManager
