"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Clock, CheckCircle, XCircle, Award, ArrowRight } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const ExamInterface = ({ exam, onBack, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(new Array(exam.questions.length).fill(-1))
  const [timeLeft, setTimeLeft] = useState(Number.parseInt(exam.duration) * 60) // تحويل إلى ثواني
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const { toast } = useToast()

  // مؤقت الامتحان
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

  const handleSubmit = () => {
    const score = answers.reduce((total, answer, index) => {
      return answer === exam.questions[index].correctAnswer ? total + 1 : total
    }, 0)

    const examResult = {
      examId: exam.id,
      score,
      totalQuestions: exam.questions.length,
      answers,
      completedAt: new Date().toISOString(),
    }

    setResult(examResult)
    setIsSubmitted(true)
    onComplete(examResult)

    toast({
      title: "تم إرسال الامتحان",
      description: `حصلت على ${score} من ${exam.questions.length}`,
    })
  }

  const getScorePercentage = () => {
    if (!result) return 0
    return Math.round((result.score / result.totalQuestions) * 100)
  }

  const getGradeColor = () => {
    const percentage = getScorePercentage()
    if (percentage >= 85) return "text-green-600"
    if (percentage >= 70) return "text-blue-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeText = () => {
    const percentage = getScorePercentage()
    if (percentage >= 85) return "ممتاز"
    if (percentage >= 70) return "جيد جداً"
    if (percentage >= 60) return "جيد"
    return "يحتاج تحسين"
  }

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

        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-800">
              <Award className="h-6 w-6" />
              تم إكمال الامتحان بنجاح
            </CardTitle>
            <CardDescription className="text-green-600">{exam.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getGradeColor()}`}>
                {result.score}/{result.totalQuestions}
              </div>
              <div className={`text-2xl font-semibold ${getGradeColor()}`}>{getScorePercentage()}%</div>
              <Badge className={`mt-2 ${getGradeColor().replace("text-", "bg-").replace("-600", "-500")} text-white`}>
                {getGradeText()}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>التقدم</span>
                <span>{getScorePercentage()}%</span>
              </div>
              <Progress value={getScorePercentage()} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-white/70 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.score}</div>
                <p className="text-sm text-gray-600">إجابات صحيحة</p>
              </div>
              <div className="p-4 bg-white/70 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.totalQuestions - result.score}</div>
                <p className="text-sm text-gray-600">إجابات خاطئة</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              تم الإكمال في: {new Date(result.completedAt).toLocaleString("ar-EG")}
            </div>
          </CardContent>
        </Card>

        {/* مراجعة الإجابات */}
        <Card>
          <CardHeader>
            <CardTitle>مراجعة الإجابات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exam.questions.map((question, index) => {
              const userAnswer = result.answers[index]
              const isCorrect = userAnswer === question.correctAnswer

              return (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        السؤال {index + 1}: {question.question}
                      </p>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded text-sm ${
                              optionIndex === question.correctAnswer
                                ? "bg-green-100 text-green-800 font-semibold"
                                : optionIndex === userAnswer && !isCorrect
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-50"
                            }`}
                          >
                            {option}
                            {optionIndex === question.correctAnswer && " ✓ (الإجابة الصحيحة)"}
                            {optionIndex === userAnswer && optionIndex !== question.correctAnswer && " ✗ (إجابتك)"}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = exam.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-red-600">
            <Clock className="h-5 w-5" />
            <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
          <Badge variant="secondary">
            {currentQuestion + 1} من {exam.questions.length}
          </Badge>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>التقدم</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* السؤال الحالي */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">السؤال {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">{currentQ.question}</p>

          {/* صورة السؤال إن وجدت */}
          {currentQ.image && (
            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(currentQ.image) || "/placeholder.svg"}
                alt="صورة السؤال"
                className="max-w-md max-h-64 object-contain rounded-lg border"
              />
            </div>
          )}

          {/* الخيارات */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion] === index
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                  >
                    {answers[currentQuestion] === index && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* أزرار التنقل */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          السؤال السابق
        </Button>

        <div className="flex gap-2">
          {currentQuestion === exam.questions.length - 1 ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={answers.includes(-1)}>
              إرسال الامتحان
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={answers[currentQuestion] === -1}>
              السؤال التالي
            </Button>
          )}
        </div>
      </div>

      {/* ملخص الإجابات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ملخص الإجابات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {exam.questions.map((_, index) => (
              <Button
                key={index}
                variant={answers[index] !== -1 ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 ${index === currentQuestion ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            تم الإجابة على {answers.filter((a) => a !== -1).length} من {exam.questions.length} سؤال
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExamInterface
