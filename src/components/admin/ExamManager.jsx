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

  // 1. تحديث الحالة الابتدائية لإضافة درجة النجاح
  const [newExam, setNewExam] = useState({ title: "", subject: "", description: "", date: "", duration: "", passingScore: "" })
  const [newQuestion, setNewQuestion] = useState({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 })

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
    // التأكد من أن درجة النجاح ليست فارغة
    if (!newExam.title || !newExam.subject || !newExam.date || !newExam.passingScore) {
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
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "فشل إضافة الامتحان")
      }

      const data = await res.json()
      setExams([data, ...exams])
      // إعادة تعيين الحالة لتشمل درجة النجاح
      setNewExam({ title: "", subject: "", description: "", date: "", duration: "", passingScore: "" })
      setShowAddForm(false)
      toast({ title: "✅ تم", description: `تمت إضافة الامتحان ${data.title}` })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // ... (بقية الدوال تبقى كما هي بدون تغيير)
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
            
            {/* 2. إضافة حقل درجة النجاح في الواجهة */}
            <div>
              <Label htmlFor="passingScore">درجة النجاح</Label>
              <Input
                id="passingScore"
                placeholder="مثال: 5"
                type="number"
                value={newExam.passingScore}
                onChange={e => setNewExam({ ...newExam, passingScore: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                يجب أن تكون درجة النجاح نصف عدد الأسئلة أو أقل (سيتم التحقق من ذلك عند إضافة الأسئلة).
              </p>
            </div>
            
            <Button onClick={handleAddExam}>إضافة</Button>
          </CardContent>
        </Card>
      )}

      {/* ... (بقية الواجهة تبقى كما هي بدون تغيير) */}
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
              <div key={i} className="flex gap-2 items-center">
                <input type="radio" id={`opt-${i}`} name="correctAnswer" checked={newQuestion.correctAnswer === i}
                  onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: i })} />
                <Label htmlFor={`opt-${i}`} className="flex-grow">
                  <Input placeholder={`خيار ${i + 1}`} value={opt}
                    onChange={e => {
                      const options = [...newQuestion.options]
                      options[i] = e.target.value
                      setNewQuestion({ ...newQuestion, options })
                    }} />
                </Label>
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
            <div className="flex flex-wrap gap-2 items-center">
              <Badge>{new Date(exam.date).toLocaleDateString("ar-EG")}</Badge>
              <Badge variant="secondary">{exam.duration || 'N/A'} دقيقة</Badge>
              <Badge variant="secondary">{exam.questions.length} سؤال</Badge>
              <Badge variant="outline">النجاح: {exam.passingScore}</Badge>
              <Badge className={exam.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                {exam.isActive ? "نشط" : "متوقف"}
              </Badge>
              <Button onClick={() => toggleExamStatus(exam._id)} size="sm" variant="outline">تبديل الحالة</Button>
            </div>

            <div className="mt-4 space-y-2">
              {exam.questions.map((q, i) => (
                <div key={q._id} className="border p-3 rounded-md bg-gray-50">
                  <p className="font-semibold">{i + 1}. {q.question}</p>
                  <ul className="list-disc pr-5 mt-1 text-sm">
                    {q.options.map((opt, j) => (
                      <li key={j} className={q.correctAnswer === j ? "font-bold text-blue-600" : "text-gray-700"}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleEditQuestion(q, exam._id)} size="sm" variant="outline">✏️ تعديل</Button>
                    <Button onClick={() => handleDeleteQuestion(q._id, exam._id)} size="sm" variant="destructive">🗑️ حذف</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => { setSelectedExamId(exam._id); setShowQuestionForm(true); setEditingQuestionId(null); setNewQuestion({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }); }} size="sm" className="mt-4">
              <Plus className="h-4 w-4 ml-1"/>
              إضافة سؤال جديد
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ExamManager