// src/components/admin/ExamManager.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, FileText, Calendar, Clock, Plus, ImageIcon, Check } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const API_URL = `${process.env.REACT_APP_API_URL}/exams`

const ExamManager = ({ onBack }) => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleBack = () => {
    if (typeof onBack === "function") return onBack()
    if (window.history.length > 1) return navigate(-1)
    return navigate("/admin")
  }

  const [exams, setExams] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState(null)
  const [editingQuestionId, setEditingQuestionId] = useState(null)

  const [newExam, setNewExam] = useState({ title: "", subject: "", description: "", date: "", duration: "" })
  const [newQuestion, setNewQuestion] = useState({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 })

  // 📌 تحميل الامتحانات
const token = localStorage.getItem("authToken");

useEffect(() => {
  fetch(`${process.env.REACT_APP_API_URL}/exams`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("غير مصرح لك بالدخول");
      return res.json();
    })
    .then(setExams)
    .catch(err => {
      toast({ title: "⚠️ خطأ", description: err.message, variant: "destructive" })
    });
}, [token]);

  // 📌 إضافة امتحان
  const handleAddExam = async () => {
    if (!newExam.title || !newExam.subject || !newExam.date) {
      toast({ title: "خطأ", description: "يرجى ملء كل الحقول المطلوبة", variant: "destructive" })
      return
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newExam),
      })
      const data = await res.json()
      setExams([data, ...exams])
      setNewExam({ title: "", subject: "", description: "", date: "", duration: "" })
      setShowAddForm(false)
      toast({ title: "✅ تم", description: `تمت إضافة الامتحان ${data.title}` })
    } catch (err) {
      toast({ title: "خطأ", description: "تعذر إضافة الامتحان", variant: "destructive" })
    }
  }

  // 📌 إضافة / تعديل سؤال
  const handleAddOrUpdateQuestion = async () => {
    if (!newQuestion.question || newQuestion.options.some(opt => !opt.trim())) {
      toast({ title: "خطأ", description: "يرجى ملء كل الخيارات", variant: "destructive" })
      return
    }
    if (!selectedExamId) return

    try {
      let res
      if (editingQuestionId) {
        res = await fetch(`${API_URL}/${selectedExamId}/questions/${editingQuestionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(newQuestion),
        })
      } else {
        res = await fetch(`${API_URL}/${selectedExamId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(newQuestion),
        })
      }
      const updatedExam = await res.json()
      setExams(prev => prev.map(exam => exam._id === updatedExam._id ? updatedExam : exam))
      setNewQuestion({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 })
      setEditingQuestionId(null)
      setShowQuestionForm(false)
      toast({ title: "✅ تم", description: editingQuestionId ? "تم تعديل السؤال" : "تمت إضافة السؤال" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل حفظ السؤال", variant: "destructive" })
    }
  }

  // 📌 حذف سؤال
  const handleDeleteQuestion = async (qid, examId) => {
    try {
      const res = await fetch(`${API_URL}/${examId}/questions/${qid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const updatedExam = await res.json()
      setExams(prev => prev.map(exam => exam._id === examId ? updatedExam : exam))
      toast({ title: "تم", description: "تم حذف السؤال بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "تعذر حذف السؤال", variant: "destructive" })
    }
  }

  // 📌 تعديل سؤال
  const handleEditQuestion = (q, examId) => {
    setNewQuestion(q)
    setEditingQuestionId(q._id)
    setSelectedExamId(examId)
    setShowQuestionForm(true)
  }

  // 📌 تفعيل / إلغاء امتحان
  const toggleExamStatus = async (examId) => {
    try {
      const res = await fetch(`${API_URL}/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toggleStatus: true })
      })
      const data = await res.json()
      setExams(prev => prev.map(exam => exam._id === examId ? data : exam))
    } catch (err) {
      toast({ title: "خطأ", description: "تعذر تحديث حالة الامتحان", variant: "destructive" })
    }
  }

  return (
    <div className="p-4 space-y-6" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4 ml-1" /> عودة
          </Button>
          <h1 className="text-xl font-bold">📝 إدارة الامتحانات</h1>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <Plus className="h-4 w-4 ml-2" /> إضافة امتحان
        </Button>
      </div>

      {/* نموذج امتحان جديد */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة امتحان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="العنوان" value={newExam.title}
              onChange={e => setNewExam({ ...newExam, title: e.target.value })} />
            <Input placeholder="المادة" value={newExam.subject}
              onChange={e => setNewExam({ ...newExam, subject: e.target.value })} />
            <Textarea placeholder="الوصف" value={newExam.description}
              onChange={e => setNewExam({ ...newExam, description: e.target.value })} />
            <Input type="date" value={newExam.date} onChange={e => setNewExam({ ...newExam, date: e.target.value })} />
            <Input placeholder="المدة بالدقائق" type="number"
              value={newExam.duration} onChange={e => setNewExam({ ...newExam, duration: e.target.value })} />
            <Button onClick={handleAddExam}>إضافة</Button>
          </CardContent>
        </Card>
      )}

      {/* إضافة/تعديل سؤال */}
      {showQuestionForm && selectedExamId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingQuestionId ? "تعديل سؤال" : "إضافة سؤال"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="السؤال" value={newQuestion.question}
              onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} />
            {newQuestion.options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input type="radio" checked={newQuestion.correctAnswer === i}
                  onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: i })} />
                <Input placeholder={`خيار ${i+1}`} value={opt}
                  onChange={e => {
                    const options = [...newQuestion.options]
                    options[i] = e.target.value
                    setNewQuestion({ ...newQuestion, options })
                  }} />
              </div>
            ))}
            <Button onClick={handleAddOrUpdateQuestion}>{editingQuestionId ? "تعديل" : "إضافة"}</Button>
          </CardContent>
        </Card>
      )}

      {/* عرض الامتحانات */}
      {exams.map(exam => (
        <Card key={exam._id}>
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
            <CardDescription>{exam.subject}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge>{new Date(exam.date).toLocaleDateString("ar-EG")}</Badge>
              <Badge>{exam.questions.length} سؤال</Badge>
              <Badge className={exam.isActive ? "bg-green-500" : "bg-gray-400"}>
                {exam.isActive ? "نشط" : "متوقف"}
              </Badge>
              <Button onClick={() => toggleExamStatus(exam._id)} size="sm">تبديل الحالة</Button>
            </div>

            {exam.questions.map((q, i) => (
              <div key={q._id} className="border p-2 rounded mt-2">
                <p>{i+1}. {q.question}</p>
                <ul>
                  {q.options.map((opt, j) => (
                    <li key={j} className={q.correctAnswer === j ? "font-bold text-blue-600" : ""}>
                      {opt}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-1">
                  <Button onClick={() => handleEditQuestion(q, exam._id)} size="xs">✏️</Button>
                  <Button onClick={() => handleDeleteQuestion(q._id, exam._id)} size="xs" variant="destructive">🗑️</Button>
                </div>
              </div>
            ))}
            <Button onClick={() => { setSelectedExamId(exam._id); setShowQuestionForm(true) }} size="sm" className="mt-2">إضافة سؤال</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ExamManager