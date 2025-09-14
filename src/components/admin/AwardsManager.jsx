"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, Plus, Award, Star, Trophy, Medal } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const API_URL = `${process.env.REACT_APP_API_URL}/awards`
const STUDENTS_API = `${process.env.REACT_APP_API_URL}/students`

const AwardsManager = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const token = localStorage.getItem("authToken")

  const [awards, setAwards] = useState([])
  const [students, setStudents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAward, setEditingAward] = useState(null)
  const [newAward, setNewAward] = useState({
    student: "",
    title: "",
    description: "",
    type: "تفوق",
  })

  // 🔹 Load awards
  useEffect(() => {
    fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setAwards)
      .catch(() =>
        toast({
          title: "خطأ ⚠️",
          description: "فشل تحميل قائمة التكريمات",
          variant: "destructive",
        })
      )
  }, [token])

  // 🔹 Load students for dropdown select
  useEffect(() => {
    fetch(STUDENTS_API, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setStudents)
      .catch(() =>
        toast({
          title: "⚠️ خطأ",
          description: "فشل تحميل الطلاب",
          variant: "destructive",
        })
      )
  }, [token])

  const getTypeIcon = (type) => {
    switch (type) {
      case "تفوق": return <Trophy className="h-5 w-5" />
      case "حضور": return <Star className="h-5 w-5" />
      case "سلوك": return <Medal className="h-5 w-5" />
      case "مشاركة": return <Award className="h-5 w-5" />
      default: return <Award className="h-5 w-5" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "تفوق": return "from-yellow-400 to-yellow-600"
      case "حضور": return "from-green-400 to-green-600"
      case "سلوك": return "from-blue-400 to-blue-600"
      case "مشاركة": return "from-purple-400 to-purple-600"
      default: return "from-gray-400 to-gray-600"
    }
  }

  // 🔹 Add Award
const handleAddAward = async () => {
  if (!newAward.student || !newAward.title) {
    return toast({
      title: "⚠️ خطأ",
      description: "يرجى اختيار الطالب وكتابة عنوان التكريم",
      variant: "destructive",
    });
  }

  const body = {
    studentId: newAward.student, // هنا نبعت _id مباشرة
    title: newAward.title,
    description: newAward.description,
    type: newAward.type,
    date: new Date()
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("فشل إضافة التكريم");
    const data = await res.json();
    setAwards([data, ...awards]);
    toast({ title: "✅ تم", description: `تم إضافة تكريم` });
    setNewAward({ student: "", title: "", description: "", type: "تفوق" });
    setShowAddForm(false);
  } catch (err) {
    toast({ title: "خطأ", description: err.message, variant: "destructive" });
  }
};



  // 🔹 Save Edit
  const handleSaveEdit = async () => {
    if (!newAward.student || !newAward.title) {
      return toast({ title: "⚠️ خطأ", description: "يرجى إدخال البيانات كاملة", variant: "destructive" })
    }

    try {
      const res = await fetch(`${API_URL}/${editingAward._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAward)
      })
      if (!res.ok) throw new Error("فشل تحديث البيانات")
      const data = await res.json()
      setAwards(prev => prev.map(a => a._id === data._id ? data : a))
      toast({ title: "✅ تم", description: `تم تعديل تكريم ${data.student?.name}` })
      setEditingAward(null)
      setNewAward({ student: "", title: "", description: "", type: "تفوق" })
      setShowAddForm(false)
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // 🔹 Delete
  const handleDeleteAward = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف التكريم؟")) return
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("فشل حذف التكريم")
      setAwards(prev => prev.filter((a) => a._id !== id))
      toast({ title: "🗑️ حذف", description: "تم حذف التكريم بنجاح", variant: "destructive" })
    } catch (err) {
      toast({ title: "⚠️ خطأ", description: "تعذر الحذف", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl" style={{ background: "#f0f2f5" }}>
      <Card className="p-4 shadow-md">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowRight className="h-4 w-4" /> العودة
          </Button>
          <h1 className="text-xl font-bold">إدارة التكريمات</h1>
          <Button
            onClick={() => { setEditingAward(null); setShowAddForm(true) }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500"
          >
            <Plus className="h-4 w-4 ml-2" /> إضافة تكريم
          </Button>
        </div>
      </Card>

      {showAddForm && (
        <Card className="p-6 border-yellow-200">
          <CardHeader>
            <CardTitle>{editingAward ? "✏️ تعديل تكريم" : "➕ إضافة تكريم"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اختر الطالب *</Label>
                <select
                  value={newAward.student}
                  onChange={(e) => setNewAward({ ...newAward, student: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="">-- اختر --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.stdcode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>نوع التكريم</Label>
                <select
                  value={newAward.type}
                  onChange={(e) => setNewAward({ ...newAward, type: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="تفوق">تفوق</option>
                  <option value="حضور">حضور</option>
                  <option value="سلوك">سلوك</option>
                  <option value="مشاركة">مشاركة</option>
                </select>
              </div>
            </div>
            <div>
              <Label>العنوان *</Label>
              <Input value={newAward.title} onChange={e => setNewAward({ ...newAward, title: e.target.value })} />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea value={newAward.description} onChange={e => setNewAward({ ...newAward, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={editingAward ? handleSaveEdit : handleAddAward}>
                {editingAward ? "تحديث" : "إضافة"}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingAward(null) }}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {awards.map(a => (
          <Card key={a._id} className="p-4 border-l-4 border-yellow-400">
            <CardHeader className="flex justify-between">
              <div>
              <CardTitle>{a.student?.name}</CardTitle>
              <CardDescription>
                {a.title} - الصف: {a.student?.grade} - السنتر: {a.student?.place?.name}
              </CardDescription>



              </div>
              <Badge className={`bg-gradient-to-r ${getTypeColor(a.type)} text-white`}>
                {a.type}
              </Badge>
            </CardHeader>
            <CardContent>
              <p>{a.description}</p>
              <small className="text-gray-500">📅 {new Date(a.date).toLocaleDateString("ar-EG")}</small>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingAward(a); setShowAddForm(true); setNewAward({ student: a.student?._id, title: a.title, description: a.description, type: a.type }) }}>✏️</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteAward(a._id)}>🗑️</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AwardsManager