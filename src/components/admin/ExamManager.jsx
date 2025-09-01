"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { ArrowRight, FileText, Calendar, Clock, Plus, ImageIcon, Check } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const ExamManager = ({ onBack }) => {
  const [exams, setExams] = useState([
    {
      id: "1",
      title: "امتحان الرياضيات - الوحدة الأولى",
      subject: "رياضيات",
      description: "امتحان شامل على الوحدة الأولى من منهج الرياضيات",
      date: "2024-02-15",
      duration: "120",
      questions: [],
      isActive: true,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState(null)

  const [newExam, setNewExam] = useState({
    title: "",
    subject: "",
    description: "",
    date: "",
    duration: "",
  })

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    image: null,
    options: ["", "", "", ""],
    correctAnswer: 0,
  })

  const { toast } = useToast()

  const handleAddExam = () => {
    if (!newExam.title || !newExam.subject || !newExam.date) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    const exam = {
      id: Date.now().toString(),
      title: newExam.title,
      subject: newExam.subject,
      description: newExam.description,
      date: newExam.date,
      duration: newExam.duration,
      questions: [],
      isActive: false,
    }

    setExams([exam, ...exams])
    setNewExam({
      title: "",
      subject: "",
      description: "",
      date: "",
      duration: "",
    })
    setShowAddForm(false)

    toast({
      title: "تم الإضافة بنجاح",
      description: `تم إضافة امتحان ${exam.title} بنجاح`,
    })
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question || newQuestion.options.some((opt) => !opt.trim())) {
      toast({
        title: "خطأ",
        description: "يرجى ملء السؤال وجميع الخيارات",
        variant: "destructive",
      })
      return
    }

    if (!selectedExamId) return

    const question = {
      id: Date.now().toString(),
      question: newQuestion.question,
      image: newQuestion.image || undefined,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
    }

    setExams((prev) =>
      prev.map((exam) =>
        exam.id === selectedExamId ? { ...exam, questions: [...exam.questions, question] } : exam
      )
    )

    setNewQuestion({
      question: "",
      image: null,
      options: ["", "", "", ""],
      correctAnswer: 0,
    })

    toast({
      title: "تم إضافة السؤال",
      description: "تم إضافة السؤال بنجاح",
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewQuestion({ ...newQuestion, image: file })
    }
  }

  const toggleExamStatus = (examId) => {
    setExams((prev) =>
      prev.map((exam) => (exam.id === examId ? { ...exam, isActive: !exam.isActive } : exam))
    )
  }

  const updateOption = (index, value) => {
    const newOptions = [...newQuestion.options]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* عنوان الصفحة وأزرار */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">إدارة الامتحانات الإلكترونية</h1>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة امتحان جديد
        </Button>
      </div>

      {/* نموذج إضافة امتحان */}
      {showAddForm && (
        <Card className="animate-fadeIn border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <FileText className="h-5 w-5" />
              إضافة امتحان جديد
            </CardTitle>
            <CardDescription className="text-green-600">
              املأ البيانات التالية لإضافة امتحان جديد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الامتحان *</Label>
                <Input
                  id="title"
                  placeholder="مثال: امتحان الرياضيات - الوحدة الأولى"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">المادة *</Label>
                <Input
                  id="subject"
                  placeholder="مثال: رياضيات، فيزياء، كيمياء"
                  value={newExam.subject}
                  onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف الامتحان</Label>
              <Textarea
                id="description"
                placeholder="وصف مختصر عن محتوى الامتحان..."
                value={newExam.description}
                onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاريخ الامتحان *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newExam.date}
                  onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  مدة الامتحان (بالدقائق)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="120"
                  value={newExam.duration}
                  onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddExam} className="bg-green-600 hover:bg-green-700">
                إضافة الامتحان
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* نموذج إضافة سؤال */}
      {showQuestionForm && selectedExamId && (
        <Card className="animate-fadeIn border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Plus className="h-5 w-5" />
              إضافة سؤال جديد
            </CardTitle>
            <CardDescription className="text-blue-600">
              أضف سؤالاً جديداً للامتحان
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">نص السؤال *</Label>
              <Textarea
                id="question"
                placeholder="اكتب السؤال هنا..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionImage" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                صورة السؤال (اختيارية)
              </Label>
              <Input
                id="questionImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              {newQuestion.image && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  تم اختيار الصورة: {newQuestion.image.name}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>الخيارات *</Label>
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newQuestion.correctAnswer === index}
                    onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                    className="text-blue-600"
                  />
                  <Input
                    placeholder={`الخيار ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={newQuestion.correctAnswer === index ? "border-blue-500 bg-blue-50" : ""}
                  />
                  {newQuestion.correctAnswer === index && (
                    <Badge className="bg-blue-500 text-white">الإجابة الصحيحة</Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddQuestion} className="bg-blue-600 hover:bg-blue-700">
                إضافة السؤال
              </Button>
              <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الامتحانات */}
      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card
            key={exam.id}
            className="animate-fadeIn hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-400"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <CardDescription className="mt-1">{exam.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{exam.subject}</Badge>
                  <Badge className={exam.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                    {exam.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(exam.date).toLocaleDateString("ar-EG")}
                </div>
                {exam.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {exam.duration} دقيقة
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {exam.questions.length} سؤال
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedExamId(exam.id)
                    setShowQuestionForm(true)
                  }}
                >
                  إضافة سؤال
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleExamStatus(exam.id)}
                  className={exam.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                >
                  {exam.isActive ? "إيقاف" : "تفعيل"}
                </Button>
                <Button size="sm" variant="outline">
                  تعديل
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ExamManager
