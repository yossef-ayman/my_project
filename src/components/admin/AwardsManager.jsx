"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, Plus, Award, Star, Trophy, Medal } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const AwardsManager = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [awards, setAwards] = useState([
    {
      id: "1",
      studentName: "أحمد محمد علي",
      title: "الطالب المتفوق",
      description: "حصل على أعلى الدرجات في امتحان الرياضيات",
      date: "2024-01-20",
      type: "تفوق",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAward, setEditingAward] = useState(null)
  const [newAward, setNewAward] = useState({
    studentName: "",
    title: "",
    description: "",
    type: "تفوق",
  })

  // أيقونات حسب النوع
  const getTypeIcon = (type) => {
    switch (type) {
      case "تفوق":
        return <Trophy className="h-5 w-5" />
      case "حضور":
        return <Star className="h-5 w-5" />
      case "سلوك":
        return <Medal className="h-5 w-5" />
      case "مشاركة":
        return <Award className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  // ألوان حسب النوع
  const getTypeColor = (type) => {
    switch (type) {
      case "تفوق":
        return "from-yellow-400 to-yellow-600"
      case "حضور":
        return "from-green-400 to-green-600"
      case "سلوك":
        return "from-blue-400 to-blue-600"
      case "مشاركة":
        return "from-purple-400 to-purple-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  // إضافة تكريم جديد
  const handleAddAward = () => {
    if (!newAward.studentName || !newAward.title) {
      toast({
        title: "خطأ",
        description: "يرجى ملء اسم الطالب وعنوان التكريم",
        variant: "destructive",
      })
      return
    }

    const award = {
      id: Date.now().toString(),
      studentName: newAward.studentName,
      title: newAward.title,
      description: newAward.description,
      date: new Date().toISOString().split("T")[0],
      type: newAward.type,
    }

    setAwards([award, ...awards])
    toast({
      title: "تم إضافة التكريم",
      description: `تم تكريم ${newAward.studentName} بنجاح`,
    })

    setNewAward({ studentName: "", title: "", description: "", type: "تفوق" })
    setShowAddForm(false)
  }

  // حذف تكريم
  const handleDeleteAward = (id) => {
    setAwards(awards.filter((award) => award.id !== id))
    toast({ title: "تم الحذف", description: "تم حذف التكريم بنجاح", variant: "destructive" })
  }

  // فتح نموذج التعديل
  const handleEditAward = (award) => {
    setEditingAward(award)
    setNewAward({
      studentName: award.studentName,
      title: award.title,
      description: award.description,
      type: award.type,
    })
    setShowAddForm(true)
  }

  // حفظ التعديل
  const handleSaveEdit = () => {
    if (!newAward.studentName || !newAward.title) {
      toast({
        title: "خطأ",
        description: "يرجى ملء اسم الطالب وعنوان التكريم",
        variant: "destructive",
      })
      return
    }

    setAwards(
      awards.map((award) =>
        award.id === editingAward.id
          ? { ...award, ...newAward }
          : award
      )
    )

    toast({
      title: "تم تعديل التكريم",
      description: `تم تحديث بيانات ${newAward.studentName} بنجاح`,
    })

    setNewAward({ studentName: "", title: "", description: "", type: "تفوق" })
    setEditingAward(null)
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#f0f2f5" }} dir="rtl">
      {/* فريم الهيدر */}
      <Card className="p-4 shadow-md rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowRight className="h-4 w-4" />
              العودة
            </Button>
            <h1 className="text-3xl font-extrabold text-gray-900">إدارة التكريمات</h1>
          </div>
          <Button
            onClick={() => { setEditingAward(null); setShowAddForm(true); }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة تكريم جديد
          </Button>
        </div>
      </Card>

      {/* فريم نموذج إضافة / تعديل التكريم */}
      {showAddForm && (
        <Card className="animate-fadeIn border border-yellow-200 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Award className="h-5 w-5" />
              {editingAward ? "تعديل التكريم" : "إضافة تكريم جديد"}
            </CardTitle>
            <CardDescription className="text-yellow-600">
              {editingAward ? "قم بتعديل بيانات التكريم" : "أضف تكريماً جديداً لأحد الطلاب المتميزين"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">اسم الطالب *</Label>
                <Input
                  id="studentName"
                  placeholder="أدخل اسم الطالب..."
                  value={newAward.studentName}
                  onChange={(e) => setNewAward({ ...newAward, studentName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">نوع التكريم</Label>
                <select
                  id="type"
                  className="w-full p-2 border rounded-md"
                  value={newAward.type}
                  onChange={(e) => setNewAward({ ...newAward, type: e.target.value })}
                >
                  <option value="تفوق">تفوق أكاديمي</option>
                  <option value="حضور">انتظام في الحضور</option>
                  <option value="سلوك">حسن السلوك</option>
                  <option value="مشاركة">المشاركة الفعالة</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">عنوان التكريم *</Label>
              <Input
                id="title"
                placeholder="مثال: الطالب المتفوق، الطالب المثالي..."
                value={newAward.title}
                onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف التكريم</Label>
              <Textarea
                id="description"
                placeholder="اكتب وصفاً للإنجاز أو السبب في التكريم..."
                rows={3}
                value={newAward.description}
                onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingAward ? handleSaveEdit : handleAddAward}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {editingAward ? "حفظ التعديل" : "إضافة التكريم"}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingAward(null); }}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* فريم قائمة التكريمات */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {awards.map((award) => (
          <Card
            key={award.id}
            className={`animate-fadeIn rounded-2xl shadow-lg hover:shadow-2xl transform transition-transform duration-300 border-l-4 border-l-yellow-400`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${getTypeColor(award.type)} text-white shadow-md`}>
                      {getTypeIcon(award.type)}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{award.studentName}</CardTitle>
                      <CardDescription className="font-semibold text-yellow-700">{award.title}</CardDescription>
                    </div>
                  </div>
                  {award.description && <p className="text-gray-600 mt-2">{award.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`bg-gradient-to-r ${getTypeColor(award.type)} text-white font-bold shadow-md`}>
                    {award.type}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditAward(award)}>
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => handleDeleteAward(award.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                تاريخ التكريم: {new Date(award.date).toLocaleDateString("ar-EG")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AwardsManager
