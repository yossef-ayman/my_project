"use client"

import React, { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { User, Plus, Search, Trash2, Edit2, ArrowRight } from "lucide-react"
import { toast, ToastContainer, Bounce } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function StudentManager() {
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
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
  const [places, setPlaces] = useState([])
  const [editingStudent, setEditingStudent] = useState(null)

  // جلب الأماكن
  useEffect(() => {
    fetch("http://localhost:8080/places")
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch(() => toast.error("❌ خطأ أثناء تحميل الأماكن", { transition: Bounce }))
  }, [])

  // جلب الطلاب
  useEffect(() => {
    fetch("http://localhost:8080/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() => toast.error("❌ خطأ أثناء تحميل الطلاب", { transition: Bounce }))
  }, [])

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
    if (!newStudent.name || !newStudent.stdcode || !newStudent.grade || !newStudent.place) {
      toast.error("⚠️ برجاء إدخال جميع البيانات المطلوبة", { transition: Bounce })
      return
    }

    fetch("http://localhost:8080/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newStudent,
        registrationDate: new Date().toLocaleDateString("ar-EG"),
        attendanceCount: 0,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error, { transition: Bounce })
          return
        }
        setStudents((prev) => [...prev, data])
        setNewStudent({
          name: "",
          email: "",
          password: "",
          stdcode: "",
          phone: "",
          parentPhone: "",
          grade: "",
          place: "",
        })
        setShowAddForm(false)
        toast.success("✅ تم إضافة الطالب بنجاح", { transition: Bounce })
      })
      .catch(() => toast.error("❌ فشل في إضافة الطالب", { transition: Bounce }))
  }

  // ✅ تحديث بيانات الطالب
  const handleUpdateStudent = () => {
    if (!newStudent.name || !newStudent.stdcode || !newStudent.grade || !newStudent.place) {
      toast.error("⚠️ برجاء إدخال جميع البيانات المطلوبة", { transition: Bounce })
      return
    }

    fetch(`http://localhost:8080/students/${editingStudent._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    })
      .then((res) => res.json())
      .then((updated) => {
        if (updated.error) {
          toast.error(updated.error, { transition: Bounce })
          return
        }
        setStudents((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
        setEditingStudent(null)
        setNewStudent({
          name: "",
          email: "",
          password: "",
          stdcode: "",
          phone: "",
          parentPhone: "",
          grade: "",
          place: "",
        })
        setShowAddForm(false)
        toast.success("✅ تم تحديث بيانات الطالب", { transition: Bounce })
      })
      .catch(() => toast.error("❌ فشل في تحديث بيانات الطالب", { transition: Bounce }))
  }

  // ✅ حذف طالب
  const handleRemoveStudent = (_id) => {
    if (!window.confirm("هل أنت متأكد من حذف الطالب؟")) return

    fetch(`http://localhost:8080/students/${_id}`, {
      method: "DELETE",
    })
      .then(() => {
        setStudents((prev) => prev.filter((s) => s._id !== _id))
        toast.success("🗑️ تم حذف الطالب", { transition: Bounce })
      })
      .catch(() => toast.error("❌ فشل في حذف الطالب", { transition: Bounce }))
  }

  // ✅ ألوان مختلفة لكل صف
  const gradeColors = {
    "الصف الأول الثانوي": "from-blue-500 to-blue-700",
    "الصف الثاني الثانوي": "from-green-500 to-green-700",
    "الصف الثالث الثانوي": "from-purple-500 to-purple-700",
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir="rtl">
      {/* ✅ ToastContainer */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        transition={Bounce}
      />

      {/* الهيدر */}
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

      {/* فورم إضافة / تعديل طالب */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-blue-300 bg-blue-50 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="h-5 w-5" /> {editingStudent ? "تعديل طالب" : "إضافة طالب جديد"}
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
                  placeholder="كلمة السر"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
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
                  onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
                  className={
                    editingStudent
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
                      : "bg-green-500 text-white hover:bg-green-600 rounded-xl"
                  }
                >
                  {editingStudent ? "تحديث" : "إضافة"}
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
            key={s._id}
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
                  <Button
                    size="sm"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg"
                    onClick={() => {
                      setEditingStudent(s)
                      setNewStudent(s)
                      setShowAddForm(true)
                    }}
                  >
                    <Edit2 className="w-4 h-4" /> تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveStudent(s._id)}
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
