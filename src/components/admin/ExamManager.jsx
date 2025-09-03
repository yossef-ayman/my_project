// src/components/admin/ExamManager.jsx
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, FileText, Calendar, Clock, Plus, ImageIcon, Check } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

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
  const [editingExamId, setEditingExamId] = useState(null)

  const [newExam, setNewExam] = useState({ title: "", subject: "", description: "", date: "", duration: "" })
  const [newQuestion, setNewQuestion] = useState({ question: "", image: null, options: ["", "", "", ""], correctAnswer: 0 })

  // إضافة / تعديل امتحان
  const handleAddOrUpdateExam = () => {
    if (!newExam.title || !newExam.subject || !newExam.date) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }

    if (editingExamId) {
      setExams(prev => prev.map(ex => ex.id === editingExamId ? { ...ex, ...newExam } : ex))
      toast({ title: "تم", description: "تم تعديل الامتحان بنجاح" })
      setEditingExamId(null)
    } else {
      const exam = { id: Date.now().toString(), ...newExam, questions: [], isActive: false }
      setExams([exam, ...exams])
      toast({ title: "تم", description: `تم إضافة امتحان ${exam.title}` })
    }

    setNewExam({ title: "", subject: "", description: "", date: "", duration: "" })
    setShowAddForm(false)
  }

  // حذف امتحان
  const handleDeleteExam = (examId) => {
    setExams(prev => prev.filter(ex => ex.id !== examId))
    toast({ title: "تم", description: "تم حذف الامتحان" })
  }

  // إضافة / تعديل سؤال
  const handleAddOrUpdateQuestion = () => {
    if (!newQuestion.question || newQuestion.options.some(opt => !opt.trim())) {
      toast({ title: "خطأ", description: "يرجى ملء السؤال وجميع الخيارات", variant: "destructive" })
      return
    }
    setExams(prev => prev.map(exam => exam.id === selectedExamId
      ? editingQuestionId
        ? { ...exam, questions: exam.questions.map(q => q.id === editingQuestionId ? newQuestion : q) }
        : { ...exam, questions: [...exam.questions, { ...newQuestion, id: Date.now().toString() }] }
      : exam
    ))
    setNewQuestion({ question: "", image: null, options: ["", "", "", ""], correctAnswer: 0 })
    setEditingQuestionId(null)
    setShowQuestionForm(false)
    toast({ title: "تم", description: editingQuestionId ? "تم تعديل السؤال" : "تم إضافة السؤال" })
  }

  const handleEditQuestion = (q) => {
    setNewQuestion({ ...q, options: [...q.options] })
    setEditingQuestionId(q.id)
    setShowQuestionForm(true)
    setSelectedExamId(exams.find(ex => ex.questions.some(ques => ques.id === q.id))?.id)
  }

  const handleDeleteQuestion = (questionId) => {
    setExams(prev => prev.map(ex => ex.id === selectedExamId ? { ...ex, questions: ex.questions.filter(q => q.id !== questionId) } : ex))
    toast({ title: "تم", description: "تم حذف السؤال" })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) setNewQuestion({ ...newQuestion, image: file })
  }

  const updateOption = (i, value) => {
    const options = [...newQuestion.options]
    options[i] = value
    setNewQuestion({ ...newQuestion, options })
  }

  const toggleExamStatus = (examId) => {
    setExams(prev => prev.map(ex => ex.id === examId ? { ...ex, isActive: !ex.isActive } : ex))
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4 ml-1" /> عودة
          </Button>
          <h1 className="text-xl font-bold text-gray-800">📝 إدارة الامتحانات</h1>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <Plus className="h-4 w-4 ml-2" /> إضافة امتحان
        </Button>
      </div>

      {/* نموذج إضافة / تعديل امتحان */}
      {showAddForm && (
        <Card className="animate-fadeIn border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <FileText className="h-5 w-5" /> {editingExamId ? "تعديل امتحان" : "إضافة امتحان جديد"}
            </CardTitle>
            <CardDescription className="text-green-600">املأ البيانات لإضافة أو تعديل امتحان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>عنوان الامتحان *</Label><Input value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })} /></div>
              <div><Label>المادة *</Label><Input value={newExam.subject} onChange={e => setNewExam({ ...newExam, subject: e.target.value })} /></div>
            </div>
            <Label>وصف الامتحان</Label>
            <Textarea value={newExam.description} onChange={e => setNewExam({ ...newExam, description: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> تاريخ الامتحان *</Label><Input type="date" value={newExam.date} onChange={e => setNewExam({ ...newExam, date: e.target.value })} /></div>
              <div><Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> مدة الامتحان بالدقائق</Label><Input type="number" value={newExam.duration} onChange={e => setNewExam({ ...newExam, duration: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddOrUpdateExam} className="bg-green-600 hover:bg-green-700">{editingExamId ? "تحديث الامتحان" : "إضافة الامتحان"}</Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingExamId(null) }}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* نموذج إضافة / تعديل سؤال */}
      {showQuestionForm && selectedExamId && (
        <Card className="animate-fadeIn border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Plus className="h-5 w-5" /> {editingQuestionId ? "تعديل السؤال" : "إضافة سؤال جديد"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>نص السؤال *</Label>
            <Textarea value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} />
            <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> صورة السؤال (اختيارية)</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="cursor-pointer" />
            {newQuestion.image && <div className="flex items-center gap-2 text-sm text-blue-600"><Check className="h-4 w-4" /> {newQuestion.image.name}</div>}

            <Label>الخيارات *</Label>
            {newQuestion.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correctAnswer" checked={newQuestion.correctAnswer === i} onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: i })} />
                <Input value={opt} onChange={e => updateOption(i, e.target.value)} />
                {newQuestion.correctAnswer === i && <Badge className="bg-blue-500 text-white">الإجابة الصحيحة</Badge>}
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddOrUpdateQuestion} className="bg-blue-600 hover:bg-blue-700">{editingQuestionId ? "تحديث السؤال" : "إضافة السؤال"}</Button>
              <Button variant="outline" onClick={() => { setShowQuestionForm(false); setEditingQuestionId(null) }}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الامتحانات */}
      <div className="grid gap-4">
        {exams.map(exam => (
          <Card key={exam.id} className="animate-fadeIn border-l-4 border-l-green-400 hover:shadow-lg transition-all duration-300 bg-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{exam.title}</CardTitle>
                  <CardDescription>{exam.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{exam.subject}</Badge>
                  <Badge className={exam.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>{exam.isActive ? "نشط" : "غير نشط"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(exam.date).toLocaleDateString("ar-EG")}</div>
                {exam.duration && <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {exam.duration} دقيقة</div>}
                <div className="flex items-center gap-1"><FileText className="h-4 w-4" /> {exam.questions.length} سؤال</div>
              </div>

              {/* الأسئلة */}
              {exam.questions.map((q, idx) => (
                <Card key={q.id} className="mb-2 p-3 border border-gray-200 rounded-md">
                  <p className="font-semibold">{idx + 1}: {q.question}</p>
                  {q.image && <img src={q.image instanceof File ? URL.createObjectURL(q.image) : q.image} alt="question" className="w-full h-auto rounded-md my-2 border" />}
                  <ul className="list-disc list-inside">
                    {q.options.map((opt, i) => <li key={i} className={q.correctAnswer === i ? "font-bold text-blue-600" : ""}>{opt} {q.correctAnswer === i && "(الإجابة الصحيحة)"}</li>)}
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <Button size="xs" variant="outline" onClick={() => handleEditQuestion(q)}>✏️ تعديل</Button>
                    <Button size="xs" variant="destructive" onClick={() => { setSelectedExamId(exam.id); handleDeleteQuestion(q.id) }}>🗑️ حذف</Button>
                  </div>
                </Card>
              ))}

              {/* أزرار الامتحان */}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => { setSelectedExamId(exam.id); setShowQuestionForm(true) }}>إضافة سؤال</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditingExamId(exam.id); setNewExam({ ...exam }); setShowAddForm(true) }}>تعديل الامتحان</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteExam(exam.id)}>حذف الامتحان</Button>
                <Button size="sm" variant="outline" onClick={() => toggleExamStatus(exam.id)} className={exam.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}>{exam.isActive ? "إيقاف" : "تفعيل"}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ExamManager
