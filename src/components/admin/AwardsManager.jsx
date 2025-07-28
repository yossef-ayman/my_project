"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, Plus, Award, Star, Trophy, Medal } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const AwardsManager = ({ onBack }) => {
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
  const [newAward, setNewAward] = useState({
    studentName: "",
    title: "",
    description: "",
    type: "تفوق",
  })

  const { toast } = useToast()

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
    setNewAward({
      studentName: "",
      title: "",
      description: "",
      type: "تفوق",
    })
    setShowAddForm(false)

    toast({
      title: "تم إضافة التكريم",
      description: `تم تكريم ${newAward.studentName} بنجاح`,
    })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "تفوق":
        return <Trophy className="h-4 w-4" />
      case "حضور":
        return <Star className="h-4 w-4" />
      case "سلوك":
        return <Medal className="h-4 w-4" />
      case "مشاركة":
        return <Award className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "تفوق":
        return "bg-yellow-500"
      case "حضور":
        return "bg-green-500"
      case "سلوك":
        return "bg-blue-500"
      case "مشاركة":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">إدارة التكريمات</h1>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة تكريم جديد
        </Button>
      </div>

      {/* نموذج إضافة تكريم */}
      {showAddForm && (
        <Card className="animate-fadeIn border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Award className="h-5 w-5" />
              إضافة تكريم جديد
            </CardTitle>
            <CardDescription className="text-yellow-600">أضف تكريماً جديداً لأحد الطلاب المتميزين</CardDescription>
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
              <Button onClick={handleAddAward} className="bg-yellow-600 hover:bg-yellow-700">
                إضافة التكريم
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة التكريمات */}
      <div className="grid gap-4">
        {awards.map((award) => (
          <Card
            key={award.id}
            className="animate-fadeIn hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-400"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-full ${getTypeColor(award.type)} text-white`}>
                      {getTypeIcon(award.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{award.studentName}</CardTitle>
                      <CardDescription className="font-semibold text-yellow-700">{award.title}</CardDescription>
                    </div>
                  </div>
                  {award.description && <p className="text-muted-foreground mt-2">{award.description}</p>}
                </div>
                <Badge className={`${getTypeColor(award.type)} text-white`}>{award.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  تاريخ التكريم: {new Date(award.date).toLocaleDateString("ar-EG")}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AwardsManager
