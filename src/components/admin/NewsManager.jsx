// src/components/admin/NewsManager.jsx
"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, Plus, Newspaper, Calendar } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const API_URL = "http://localhost:8080/news"

const NewsManager = ({ onBack }) => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleBack = () => {
    if (typeof onBack === "function") return onBack()
    if (window.history.length > 1) return navigate(-1)
    return navigate("/admin")
  }

  const [news, setNews] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNews, setNewNews] = useState({ title: "", content: "", priority: "medium", image: null, imagePreview: null })
  const [editingNews, setEditingNews] = useState(null)

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

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      if (isEdit) setEditingNews({ ...editingNews, image: file, imagePreview: preview })
      else setNewNews({ ...newNews, image: file, imagePreview: preview })
    }
  }

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
      if (newNews.image) formData.append("image", newNews.image)

      const res = await fetch(API_URL, { method: "POST", body: formData })
      if (!res.ok) throw new Error("فشل النشر")
      const data = await res.json()
      setNews((prev) => [data, ...prev])
      setNewNews({ title: "", content: "", priority: "medium", image: null, imagePreview: null })
      setShowAddForm(false)
      toast({ title: "تم", description: "تم نشر الخبر بنجاح ✅" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

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
      if (editingNews.image instanceof File) formData.append("image", editingNews.image)
      const res = await fetch(`${API_URL}/${editingNews._id}`, { method: "PUT", body: formData })
      if (!res.ok) throw new Error("فشل التعديل")
      const data = await res.json()
      setNews((prev) => prev.map((n) => (n._id === data.news._id ? data.news : n)))
      setEditingNews(null)
      toast({ title: "تم", description: "تم تعديل الخبر بنجاح ✅" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-500"
      case "medium": return "bg-orange-500"
      case "low": return "bg-blue-500"
      default: return "bg-gray-400"
    }
  }

  return (
    <div className="space-y-6 p-4" dir="rtl" style={{ background: "linear-gradient(to bottom, #f9f9f9, #e5e7eb)" }}>
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4 ml-1" />
            عودة
          </Button>
          <h1 className="text-xl font-bold text-gray-800">📢 إدارة الأخبار</h1>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
          <Plus className="h-4 w-4 ml-2" />
          إضافة خبر
        </Button>
      </div>

      {(showAddForm || editingNews) && (
        <Card className="animate-fadeIn border-blue-300 bg-blue-50 rounded-2xl shadow-lg p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              {editingNews ? "✏️ تعديل خبر" : <><Newspaper className="h-5 w-5" /> إضافة خبر جديد</>}
            </CardTitle>
            {!editingNews && <CardDescription>أدخل تفاصيل الخبر</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>العنوان *</Label>
            <Input value={editingNews ? editingNews.title : newNews.title} onChange={(e) => editingNews ? setEditingNews({ ...editingNews, title: e.target.value }) : setNewNews({ ...newNews, title: e.target.value })} />
            <Label>المحتوى *</Label>
            <Textarea rows={4} value={editingNews ? editingNews.content : newNews.content} onChange={(e) => editingNews ? setEditingNews({ ...editingNews, content: e.target.value }) : setNewNews({ ...newNews, content: e.target.value })} />
            <Label>الأولوية</Label>
            <select className="w-full p-2 border rounded-md" value={editingNews ? editingNews.priority : newNews.priority} onChange={(e) => editingNews ? setEditingNews({ ...editingNews, priority: e.target.value }) : setNewNews({ ...newNews, priority: e.target.value })}>
              <option value="low">عادي</option>
              <option value="medium">مهم</option>
              <option value="high">عاجل</option>
            </select>
            <Label>الصورة</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, !!editingNews)} />
            {(editingNews?.imagePreview || newNews.imagePreview) && (
              <img src={editingNews?.imagePreview || newNews.imagePreview} alt="preview" className="w-full h-auto rounded-md border mt-2 shadow-sm" />
            )}
            <div className="flex gap-2 pt-4">
              <Button onClick={editingNews ? handleUpdateNews : handleAddNews} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">{editingNews ? "حفظ التعديلات" : "نشر"}</Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingNews(null) }}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {news.map((item) => (
          <Card key={item._id} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-gray-700">{item.content}</CardDescription>
                </div>
                <Badge className={`${getPriorityColor(item.priority)} text-white px-2 py-1 rounded-md shadow-sm`}>
                  {item.priority === "low" ? "عادي" : item.priority === "medium" ? "مهم" : "عاجل"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-auto rounded-md border mb-3 shadow-sm" />}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {item.date ? new Date(item.date).toLocaleString("ar-EG") : "—"}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-blue-600 shadow-sm" onClick={() => setEditingNews(item)}>تعديل</Button>
                  <Button size="sm" variant="outline" className="text-red-600 shadow-sm" onClick={() => handleDelete(item._id)}>حذف</Button>
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
