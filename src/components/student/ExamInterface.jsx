"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Clock, CheckCircle, XCircle, Award, ArrowRight } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const ExamInterface = ({ exam, onBack, onComplete, student }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(new Array(exam.questions.length).fill(-1))
  const [timeLeft, setTimeLeft] = useState(Number.parseInt(exam.duration) * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const { toast } = useToast()
  const token = localStorage.getItem("authToken")

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

  // 🚀 Submit امتحان
  const handleSubmit = async () => {
    const score = answers.reduce((total, answer, index) => {
      return answer === exam.questions[index].correctAnswer ? total + 1 : total
    }, 0)

    const examResult = {
      examId: exam._id,
      studentId: student?._id,
      score,
      totalQuestions: exam.questions.length,
      answers,
      completedAt: new Date().toISOString(),
    }

    try {
      // 🟢 حفظ النتيجة في الباك إند
      const res = await fetch(`${process.env.REACT_APP_API_URL}/exam-results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(examResult)
      })

      if (!res.ok) throw new Error("⚠️ فشل تسجيل النتيجة في السيرفر")
      const saved = await res.json()

      setResult(saved)
      setIsSubmitted(true)
      onComplete(saved)

      toast({
        title: "✅ تم إرسال الامتحان",
        description: `حصلت على ${score} من ${exam.questions.length}`
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  const getScorePercentage = () => result ? Math.round((result.score / result.totalQuestions) * 100) : 0

  const getGradeColor = () => {
    const p = getScorePercentage()
    if (p >= 85) return "text-green-600"
    if (p >= 70) return "text-blue-600"
    if (p >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeText = () => {
    const p = getScorePercentage()
    if (p >= 85) return "ممتاز"
    if (p >= 70) return "جيد جداً"
    if (p >= 60) return "جيد"
    return "يحتاج تحسين"
  }

  // ================= عرض النتيجة بعد التسليم =================
  if (isSubmitted && result) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">نتيجة الامتحان</h1>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-800">
              <Award className="h-6 w-6" />
              تم إكمال الامتحان بنجاح
            </CardTitle>
            <CardDescription>{exam.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getGradeColor()}`}>
                {result.score}/{result.totalQuestions}
              </div>
              <div className={`text-2xl font-semibold ${getGradeColor()}`}>{getScorePercentage()}%</div>
              <Badge className={`mt-2 bg-blue-600 text-white`}>
                {getGradeText()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* مراجعة الإجابات */}
        <Card>
          <CardHeader><CardTitle>مراجعة الإجابات</CardTitle></CardHeader>
          <CardContent>
            {exam.questions.map((q, index) => {
              const userAnswer = result.answers[index]
              const isCorrect = userAnswer === q.correctAnswer
              return (
                <div key={q._id || index} className="p-2 border rounded mb-2">
                  <p className="font-semibold">س {index+1}: {q.question}</p>
                  {q.options.map((opt, i) => (
                    <div key={i} className={`px-2 py-1 rounded ${
                      i === q.correctAnswer ? "bg-green-100 text-green-800" :
                      i === userAnswer && !isCorrect ? "bg-red-100 text-red-800" : "bg-gray-50"
                    }`}>
                      {opt}
                    </div>
                  ))}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ================= عرض الامتحان قبل التسليم =================
  const currentQ = exam.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowRight className="h-4 w-4" /> العودة
        </Button>
        <div className="flex items-center gap-3">
          <Clock className="text-red-600" /> {formatTime(timeLeft)}
          <Badge>{currentQuestion+1} من {exam.questions.length}</Badge>
        </div>
      </div>

      <Progress value={progress} />

      <Card>
        <CardHeader><CardTitle>السؤال {currentQuestion+1}</CardTitle></CardHeader>
        <CardContent>
          <p>{currentQ.question}</p>
          <div className="space-y-2">
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