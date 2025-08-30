"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, Plus, Newspaper, Calendar } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const API_URL = "http://localhost:8080/news"

const NewsManager = ({ onBack }) => {
  const [news, setNews] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    priority: "medium",
    image: null,
  })
  const [editingNews, setEditingNews] = useState(null)
  const { toast } = useToast()

  // تحميل الأخبار
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error("فشل تحميل الأخبار")
        const data = await res.json()
        setNews(data)
      } catch (err) {
        toast({ title: "خطأ", description: err.message, variant: "destructive" })
      }
    }
    load()
  }, [toast])
  useEffect(() => {
  if (editingNews) {
    window.scrollTo({ top: 0, behavior: "smooth" }) // يطلع فوق بسلاسة
  }
}, [editingNews])

  // رفع صورة
  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      if (isEdit) {
        setEditingNews({ ...editingNews, image: file })
      } else {
        setNewNews({ ...newNews, image: file })
      }
    }
  }

  // نشر خبر جديد
  const handleAddNews = async () => {
    if (!newNews.title || !newNews.content) {
      toast({ title: "خطأ", description: "يرجى إدخال العنوان والمحتوى", variant: "destructive" })
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", newNews.title)
      formData.append("content", newNews.content)
      formData.append("priority", newNews.priority)
      formData.append("date", new Date().toISOString())
      if (newNews.image) {
        formData.append("image", newNews.image)
      }

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("فشل النشر")
      const data = await res.json()

      setNews((prev) => [data, ...prev])
      setNewNews({ title: "", content: "", priority: "medium", image: null })
      setShowAddForm(false)

      toast({ title: "تم", description: "تم نشر الخبر بنجاح ✅" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // تحديث خبر
  const handleUpdateNews = async () => {
    if (!editingNews.title || !editingNews.content) {
      toast({ title: "خطأ", description: "يرجى إدخال العنوان والمحتوى", variant: "destructive" })
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", editingNews.title)
      formData.append("content", editingNews.content)
      formData.append("priority", editingNews.priority)
      formData.append("date", editingNews.date || new Date().toISOString())

      if (editingNews.image instanceof File) {
        formData.append("image", editingNews.image)
      }

      const res = await fetch(`${API_URL}/${editingNews._id}`, {
        method: "PUT",
        body: formData,
      })

      if (!res.ok) throw new Error("فشل التعديل")
      const data = await res.json()

      setNews((prev) => prev.map((n) => (n._id === data.news._id ? data.news : n)))
      setEditingNews(null)

      toast({ title: "تم", description: "تم تعديل الخبر بنجاح ✅" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // حذف خبر
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("فشل الحذف")

      setNews((prev) => prev.filter((n) => n._id !== id))
      toast({ title: "تم", description: "تم حذف الخبر بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // ألوان الأولوية
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-orange-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* الهيدر */}
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

      {/* فورم تعديل خبر */}
      {editingNews && (
        <Card className="animate-fadeIn border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              ✏️ تعديل خبر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>العنوان *</Label>
            <Input
              value={editingNews.title}
              onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
            />

            <Label>المحتوى *</Label>
            <Textarea
              rows={4}
              value={editingNews.content}
              onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
            />

            <Label>الأولوية</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={editingNews.priority}
              onChange={(e) => setEditingNews({ ...editingNews, priority: e.target.value })}
            >
              <option value="low">عادي</option>
              <option value="medium">مهم</option>
              <option value="high">عاجل</option>
            </select>

            <Label>الصورة</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateNews} className="bg-blue-600 hover:bg-blue-700">
                حفظ التعديلات
              </Button>
              <Button variant="outline" onClick={() => setEditingNews(null)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* فورم إضافة خبر */}
      {showAddForm && (
        <Card className="animate-fadeIn border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Newspaper className="h-5 w-5" />
              إضافة خبر جديد
            </CardTitle>
            <CardDescription className="text-purple-600">أدخل التفاصيل التالية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>العنوان *</Label>
            <Input
              value={newNews.title}
              onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
            />

            <Label>المحتوى *</Label>
            <Textarea
              rows={4}
              value={newNews.content}
              onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
            />

            <Label>الأولوية</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={newNews.priority}
              onChange={(e) => setNewNews({ ...newNews, priority: e.target.value })}
            >
              <option value="low">عادي</option>
              <option value="medium">مهم</option>
              <option value="high">عاجل</option>
            </select>

            <Label>الصورة</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {newNews.image && <p className="text-sm text-purple-600">تم اختيار: {newNews.image.name}</p>}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddNews} className="bg-purple-600 hover:bg-purple-700">
                نشر
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
          <Card key={item._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.content}</CardDescription>
                </div>
                <Badge className={`${getPriorityColor(item.priority)} text-white`}>
                  {item.priority === "low"
                    ? "عادي"
                    : item.priority === "medium"
                    ? "مهم"
                    : "عاجل"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {item.imageUrl && (
                <div className="mb-3">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto rounded-md border"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {item.date
                    ? new Date(item.date).toLocaleDateString("ar-EG")
                    : "—"}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600"
                    onClick={() => setEditingNews(item)}
                  >
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleDelete(item._id)}
                  >
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