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
import { ToastContainer, toast, Bounce } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const API_URL = `${process.env.REACT_APP_API_URL}/news`

const NewsManager = ({ onBack }) => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const handleBack = () => {
    if (typeof onBack === "function") return onBack()
    if (window.history.length > 1) return navigate(-1)
    return navigate("/admin")
  }

  const [news, setNews] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNews, setNewNews] = useState({ title: "", content: "", priority: "medium", image: null, imagePreview: null })
  const [editingNews, setEditingNews] = useState(null)

  // 📌 تحميل الأخبار
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error("فشل تحميل الأخبار")
        const data = await res.json()
        setNews(data)
      } catch (err) {
        toast.error(err.message, { position: "top-right", theme: "colored", transition: Bounce })
      }
    }
    load()
  }, [token])

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      if (isEdit) setEditingNews({ ...editingNews, image: file, imagePreview: preview })
      else setNewNews({ ...newNews, image: file, imagePreview: preview })
    }
  }

  // 📌 إضافة خبر
  const handleAddNews = async () => {
    if (!newNews.title || !newNews.content) {
      toast.error("يرجى إدخال العنوان والمحتوى", { position: "top-right", theme: "colored", transition: Bounce })
      return
    }
    try {
      const formData = new FormData()
      formData.append("title", newNews.title)
      formData.append("content", newNews.content)
      formData.append("priority", newNews.priority)
      formData.append("date", new Date().toISOString())
      if (newNews.image) formData.append("image", newNews.image)

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      if (!res.ok) throw new Error("فشل النشر")
      const data = await res.json()
      setNews(prev => [data, ...prev])
      setNewNews({ title: "", content: "", priority: "medium", image: null, imagePreview: null })
      setShowAddForm(false)
      toast.success("تم نشر الخبر بنجاح ✅", { position: "top-right", theme: "colored", transition: Bounce })
    } catch (err) {
      toast.error(err.message, { position: "top-right", theme: "colored", transition: Bounce })
    }
  }

  // 📌 تعديل خبر
const handleUpdateNews = async () => {
  if (!editingNews.title || !editingNews.content) {
    toast.error("يرجى إدخال العنوان والمحتوى", { position: "top-right", theme: "colored", transition: Bounce })
    return
  }
  try {
    const formData = new FormData()
    formData.append("title", editingNews.title)
    formData.append("content", editingNews.content)
    formData.append("priority", editingNews.priority)
    formData.append("date", editingNews.date || new Date().toISOString())
    if (editingNews.image instanceof File) formData.append("image", editingNews.image)

    const res = await fetch(`${API_URL}/${editingNews._id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    if (!res.ok) throw new Error("فشل التعديل")
    const data = await res.json()

    // ✅ تعديل هذا السطر:
    setNews(prev => prev.map(n => n._id === data._id ? data : n))
    setEditingNews(null)
    toast.success("تم تعديل الخبر بنجاح ✅", { position: "top-right", theme: "colored", transition: Bounce })
  } catch (err) {
    toast.error(err.message, { position: "top-right", theme: "colored", transition: Bounce })
  }
}


  // 📌 حذف خبر
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("فشل الحذف")
      setNews(prev => prev.filter(n => n._id !== id))
      toast.success("تم حذف الخبر بنجاح 🗑️", { position: "top-right", theme: "colored", transition: Bounce })
    } catch (err) {
      toast.error(err.message, { position: "top-right", theme: "colored", transition: Bounce })
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
    <div className="space-y-6 p-4" dir="rtl">
      <ToastContainer />
      {/* الهيدر */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4 ml-1" />
            عودة
          </Button>
          <h1 className="text-xl font-bold text-gray-800">📢 إدارة الأخبار</h1>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <Plus className="h-4 w-4 ml-2" /> إضافة خبر
        </Button>
      </div>

      {/* إضافة/تعديل خبر */}
      {(showAddForm || editingNews) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingNews ? "✏️ تعديل خبر" : "➕ إضافة خبر"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>العنوان *</Label>
            <Input value={editingNews ? editingNews.title : newNews.title}
                   onChange={(e) => editingNews ? setEditingNews({ ...editingNews, title: e.target.value }) : setNewNews({ ...newNews, title: e.target.value })} />
            <Label>المحتوى *</Label>
            <Textarea value={editingNews ? editingNews.content : newNews.content}
                      onChange={(e) => editingNews ? setEditingNews({ ...editingNews, content: e.target.value }) : setNewNews({ ...newNews, content: e.target.value })} />
            <Label>الأولوية</Label>
            <select className="w-full p-2 border" value={editingNews ? editingNews.priority : newNews.priority}
                    onChange={(e) => editingNews ? setEditingNews({ ...editingNews, priority: e.target.value }) : setNewNews({ ...newNews, priority: e.target.value })}>
              <option value="low">عادي</option>
              <option value="medium">مهم</option>
              <option value="high">عاجل</option>
            </select>
            <Label>الصورة (اختيارية)</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, !!editingNews)} />
            {(editingNews?.imagePreview || newNews.imagePreview) && (
              <img src={editingNews?.imagePreview || newNews.imagePreview} alt="preview" className="w-full h-auto rounded-md border mt-2" />
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={editingNews ? handleUpdateNews : handleAddNews}
                      className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingNews ? "حفظ التعديلات" : "نشر"}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingNews(null) }}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الأخبار */}
      <div className="grid gap-4">
        {news.map(item => (
          <Card key={item._id} className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {item.imageUrl && (
                <img src={`${process.env.REACT_APP_API_URL}${item.imageUrl}`} alt={item.title} className="w-full mb-2 rounded" />
              )}
              <p>{item.content}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge className={`${getPriorityColor(item.priority)} text-white`}>
                  {item.priority === "low" ? "عادي" : item.priority === "medium" ? "مهم" : "عاجل"}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingNews(item)}>✏️ تعديل</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>🗑️ حذف</Button>
                </div>
              </div>
              <small className="text-gray-500 text-sm">
                {item.date ? new Date(item.date).toLocaleString("ar-EG") : ""}
              </small>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default NewsManager