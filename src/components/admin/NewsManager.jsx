"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, Plus, Newspaper, ImageIcon, Calendar } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const NewsManager = ({ onBack }) => {
  const [news, setNews] = useState([
    {
      id: "1",
      title: "بداية العام الدراسي الجديد",
      content: "نتمنى لجميع الطلاب عاماً دراسياً موفقاً مليئاً بالنجاح والتفوق",
      date: "2024-01-15",
      priority: "مهم",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    priority: "عادي",
    image: null,
  })

  const { toast } = useToast()

  const handleAddNews = () => {
    if (!newNews.title || !newNews.content) {
      toast({
        title: "خطأ",
        description: "يرجى ملء العنوان والمحتوى",
        variant: "destructive",
      })
      return
    }

    const newsItem = {
      id: Date.now().toString(),
      title: newNews.title,
      content: newNews.content,
      date: new Date().toISOString().split("T")[0],
      priority: newNews.priority,
      image: newNews.image || undefined,
    }

    setNews([newsItem, ...news])
    setNewNews({
      title: "",
      content: "",
      priority: "عادي",
      image: null,
    })
    setShowAddForm(false)

    toast({
      title: "تم النشر بنجاح",
      description: `تم نشر الخبر: ${newNews.title}`,
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewNews({ ...newNews, image: file })
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "عاجل":
        return "bg-red-500"
      case "مهم":
        return "bg-orange-500"
      default:
        return "bg-blue-500"
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
          <h1 className="text-2xl font-bold">إدارة الأخبار</h1>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة خبر جديد
        </Button>
      </div>

      {/* نموذج إضافة خبر */}
      {showAddForm && (
        <Card className="animate-fadeIn border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Newspaper className="h-5 w-5" />
              إضافة خبر جديد
            </CardTitle>
            <CardDescription className="text-purple-600">أضف خبراً أو إعلاناً جديداً للطلاب</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الخبر *</Label>
              <Input
                id="title"
                placeholder="أدخل عنوان الخبر..."
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">محتوى الخبر *</Label>
              <Textarea
                id="content"
                placeholder="اكتب محتوى الخبر هنا..."
                rows={4}
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">أولوية الخبر</Label>
                <select
                  id="priority"
                  className="w-full p-2 border rounded-md"
                  value={newNews.priority}
                  onChange={(e) => setNewNews({ ...newNews, priority: e.target.value })}
                >
                  <option value="عادي">عادي</option>
                  <option value="مهم">مهم</option>
                  <option value="عاجل">عاجل</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  صورة الخبر
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                {newNews.image && <p className="text-sm text-purple-600">تم اختيار الصورة: {newNews.image.name}</p>}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddNews} className="bg-purple-600 hover:bg-purple-700">
                نشر الخبر
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الأخبار */}
      <div className="grid gap-4">
        {news.map((item) => (
          <Card key={item.id} className="animate-fadeIn hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="mt-2">{item.content}</CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={`${getPriorityColor(item.priority)} text-white`}>{item.priority}</Badge>
                  {item.image && (
                    <Badge variant="outline" className="text-xs">
                      <ImageIcon className="h-3 w-3 ml-1" />
                      صورة
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(item.date).toLocaleDateString("ar-EG")}
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

export default NewsManager
