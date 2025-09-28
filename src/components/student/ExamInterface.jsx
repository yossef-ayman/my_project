"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Clock } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const ExamInterface = ({ exam, onBack, onComplete, student }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(new Array(exam.questions.length).fill(-1))
  const [timeLeft, setTimeLeft] = useState(Number.parseInt(exam.duration) * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const { toast } = useToast()

  // ⏱️ مؤقت الامتحان
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit()
    }
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken")
    const studentId = student?._id
    if (!token || !studentId) return

    const score = answers.reduce((total, answer, index) => {
      return answer === exam.questions[index].correctAnswer ? total + 1 : total
    }, 0)

    const examResult = {
      examId: exam._id,
      studentId,
      score,
      totalQuestions: exam.questions.length,
      answers,
      completedAt: new Date().toISOString(),
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/exam-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ examId: exam._id, studentId, answers, completedAt: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error("فشل تسجيل النتيجة في السيرفر")
      const saved = await res.json()

      setResult(saved)
      setIsSubmitted(true)
      onComplete(saved)

      toast({ title: "✅ تم إرسال الامتحان", description: `حصلت على ${score} من ${exam.questions.length}` })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  const currentQ = exam.questions[currentQuestion]

  // ================= عرض النتيجة بعد التسليم =================
  if (isSubmitted && result) {
    return (
      <div className="space-y-6" dir="rtl">
        <Button variant="ghost" size="sm" onClick={onBack}>العودة</Button>
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>تم إكمال الامتحان بنجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-2xl font-bold">
              {result.score}/{result.totalQuestions} - {Math.round((result.score / result.totalQuestions) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ================= عرض الامتحان قبل التسليم =================
  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Bar: أرقام الأسئلة + المؤقت */}
      <div className="flex justify-between items-center bg-white p-3 rounded shadow overflow-x-auto">
        <div className="flex gap-2">
          {exam.questions.map((q, i) => (
            <Button key={i}
              size="sm"
              className={`${currentQuestion===i ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setCurrentQuestion(i)}
            >
              {i+1}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="text-red-600" /> {formatTime(timeLeft)}
          <Badge>{currentQuestion+1} من {exam.questions.length}</Badge>
        </div>
      </div>

      {/* السؤال والخيارات */}
      <Card>
        <CardHeader><CardTitle>السؤال {currentQuestion+1}</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <p className="flex-1">{currentQ.question}</p>
          <div className="flex-1 flex flex-col gap-2">
            {currentQ.options.map((opt, i) => (
              <div key={i}
                className={`p-2 border rounded cursor-pointer ${answers[currentQuestion]===i ? "bg-blue-100 border-blue-600" : "hover:bg-blue-50"}`}
                onClick={() => handleAnswerSelect(i)}
              >
                {opt}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* أزرار التنقل */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion===0}>السابق</Button>
        {currentQuestion === exam.questions.length-1 ? (
          <Button className="bg-green-600" onClick={handleSubmit}>إرسال الامتحان</Button>
        ) : (
          <Button onClick={handleNext} disabled={answers[currentQuestion]===-1}>التالي</Button>
        )}
      </div>
    </div>
  )
}

export default ExamInterface
