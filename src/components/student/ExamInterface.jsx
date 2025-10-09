"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, List, Eye } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const ExamInterface = ({ exam, onBack, onComplete, student, isReviewMode = false, existingResult = null }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(isReviewMode && existingResult ? existingResult.answers : new Array(exam.questions.length).fill(-1))
  const [timeLeft, setTimeLeft] = useState(isReviewMode ? 0 : Number.parseInt(exam.duration) * 60)
  const [isSubmitted, setIsSubmitted] = useState(isReviewMode)
  const [result, setResult] = useState(isReviewMode ? existingResult : null)
  const [isReviewing, setIsReviewing] = useState(isReviewMode)
  const { toast } = useToast()

  const answeredCount = useMemo(() => answers.filter(a => a !== -1).length, [answers])
  const totalQuestions = exam.questions.length
  const progressValue = (answeredCount / totalQuestions) * 100

  // ⏱️ مؤقت الامتحان (فقط في وضع الامتحان العادي)
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && !isReviewMode) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted && !isReviewMode) {
      handleSubmit()
      toast({
        title: "انتهى الوقت",
        description: "تم إرسال الامتحان تلقائياً.",
        variant: "destructive",
      })
    }
  }, [timeLeft, isSubmitted, isReviewMode])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (answerIndex) => {
    if (isSubmitted || isReviewMode) return
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

  // ---------------------------------------------
  // 1. تسجيل النتيجة (handleSubmit)
  // ---------------------------------------------
  const handleSubmit = async () => {
    if (isSubmitted || isReviewMode) return
    setIsSubmitted(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token || !student?._id) {
        throw new Error("المستخدم غير مسجل بشكل صحيح.");
      }

      // 1. إعداد حمولة بيانات آمنة تحتوي على الإجابات فقط
      const payload = {
        exam: exam._id,
        student: student._id,
        answers: answers.map(ans => (ans === -1 ? null : ans)) // إرسال الإجابات فقط
      }

      // 2. إرسال الإجابات إلى السيرفر
      const res = await fetch(`${process.env.REACT_APP_API_URL}/exam-results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`فشل تسجيل النتيجة في السيرفر (${res.status}): ${errorText}`)
      }

      // 3. استقبال النتيجة الكاملة والمصححة من السيرفر
      const savedResult = await res.json()
      setResult(savedResult)
      setIsSubmitted(true)
      
      // 4. عرض رسالة بناءً على النتيجة التي أرسلها السيرفر
      toast({
        title: savedResult.isPassed ? "🎉 تهانينا! نجحت." : "⚠️ محاولة غير موفقة",
        description: `حصلت على ${savedResult.score} من ${savedResult.totalQuestions}.`,
        variant: savedResult.isPassed ? "default" : "destructive",
      })

      // 5. استدعاء onComplete لإعلام المكون الأب
      if (onComplete) {
        onComplete(savedResult)
      }

    } catch (err) {
      console.error("handleSubmit error:", err)
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      })
      setIsSubmitted(false)
    }
  }

  // ---------------------------------------------
  // 2. مراجعة الإجابات
  // ---------------------------------------------
  const currentQ = exam.questions[currentQuestion]

  // إذا كنا في وضع المراجعة أو عرض النتيجة مع المراجعة
  if ((isSubmitted && result && isReviewing) || (isReviewMode && isReviewing)) {
    const currentReviewQ = result ? result.detailedQuestions[currentQuestion] : existingResult.detailedQuestions[currentQuestion]
    const isQCorrect = currentReviewQ.isCorrect
    const correctIndex = currentReviewQ.correctIndex
    const selectedIndex = currentReviewQ.selectedIndex

    return (
      <div className="space-y-6 max-w-3xl mx-auto" dir="rtl">
        <Button variant="ghost" size="sm" onClick={() => setIsReviewing(false)}>
          <ChevronRight className="h-4 w-4 ml-1" /> العودة للنتيجة
        </Button>

        <Card
          className={`shadow-2xl ${
            isQCorrect
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <CardHeader className="border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              {isQCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              مراجعة السؤال {currentQuestion + 1} (
              {isQCorrect ? "صحيح" : "خطأ"})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg font-bold mb-4 text-gray-800">
              {currentReviewQ.questionText}
            </p>
            <div className="flex flex-col gap-3">
              {currentReviewQ.options.map((opt, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border-2 shadow-sm transition-all duration-200 ${
                    i === correctIndex
                      ? "bg-green-100 border-green-600 text-green-800 font-bold"
                      : i === selectedIndex && i !== correctIndex
                      ? "bg-red-100 border-red-600 text-red-800 font-bold"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  {i === correctIndex && (
                    <span className="ml-2 text-sm text-green-600 font-extrabold">
                      (الإجابة الصحيحة)
                    </span>
                  )}
                  {i === selectedIndex && i !== correctIndex && (
                    <span className="ml-2 text-sm text-red-600 font-extrabold">
                      (اختيارك الخاطئ)
                    </span>
                  )}
                  {opt}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronRight className="h-4 w-4 ml-1" /> السؤال السابق
            </Button>
            {currentQuestion === (result ? result.detailedQuestions.length - 1 : existingResult.detailedQuestions.length - 1) ? (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={onBack}>
                إنهاء المراجعة
              </Button>
            ) : (
              <Button onClick={handleNext}>
                السؤال التالي <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  // ---------------------------------------------
  // 3. عرض النتيجة بعد التسليم
  // ---------------------------------------------
  if (isSubmitted && result && !isReviewing) {
    const percentage = Math.round(
      (result.score / result.totalQuestions) * 100
    )
    const passed = result.isPassed
    const passingScore = Number(exam.passingScore) || exam.questions.length / 2

    return (
      <div className="space-y-6 max-w-md mx-auto" dir="rtl">
        <Card
          className={`shadow-2xl ${
            passed ? "border-green-500 bg-white" : "border-red-500 bg-white"
          }`}
        >
          <CardHeader className={`border-b ${passed ? "bg-green-50" : "bg-red-50"}`}>
            <CardTitle
              className={`text-2xl font-bold ${
                passed ? "text-green-800" : "text-red-800"
              }`}
            >
              {passed ? "🎉 مبروك! نجاح باهر" : "⚠️ محاولة غير موفقة"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              نتيجة الامتحان: {exam.title}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-gray-500">درجتك النهائية</p>
              <div
                className={`text-6xl font-extrabold my-2 ${
                  passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {percentage}%
              </div>
              <p className="text-xl font-semibold text-gray-700">
                {result.score} من {result.totalQuestions}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                درجة النجاح المطلوبة: {passingScore} نقطة
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t pt-4">
            <Button
              onClick={() => {
                setIsReviewing(true)
                setCurrentQuestion(0)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" /> مراجعة الإجابات الصحيحة والخاطئة
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full">
              العودة للوحة التحكم
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // -------------------------------------------------------------
  // 4. عرض الامتحان (الواجهة الجديدة)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      {/* شريط الحالة والمؤقت */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex justify-between items-center sticky top-4 z-10">
        <div className="flex items-center gap-3">
          <Clock className="text-red-600 h-6 w-6" />
          <span className="text-xl font-bold text-red-600">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">
            تم الإجابة على {answeredCount} من {totalQuestions}
          </span>
        </div>
        <Button
          onClick={() => {
            if (
              window.confirm("هل أنت متأكد من إرسال الامتحان؟ لن تتمكن من التعديل بعد الإرسال.")
            ) {
              handleSubmit()
            }
          }}
          disabled={answeredCount !== totalQuestions}
          className="bg-green-600 hover:bg-green-700 text-white transition-all"
        >
          إرسال وإنهاء الامتحان
        </Button>
        <Button variant="ghost" size="sm" onClick={onBack}>
          العودة للوحة التحكم
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* عمود جانب: التنقل بين الأسئلة والتقدم */}
        <div className="md:col-span-1 space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <List className="h-5 w-5 text-blue-500" /> قائمة الأسئلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {exam.questions.map((q, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={answers[i] !== -1 ? "default" : "outline"}
                    className={`${
                      currentQuestion === i ? "ring-2 ring-blue-500 ring-offset-2 border-blue-500" : ""
                    } ${
                      answers[i] !== -1
                        ? "bg-green-500 hover:bg-green-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentQuestion(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <div className="h-px w-full bg-gray-200 my-4"></div>

              <div className="text-sm text-gray-500 font-medium">
                <p className="mb-1">نسبة التقدم:</p>
                <Progress value={progressValue} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* عمود رئيسي: السؤال والخيارات */}
        <div className="md:col-span-3 space-y-4">
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-xl font-bold text-blue-800">
                السؤال رقم {currentQuestion + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold mb-6 text-gray-800">{currentQ.question}</p>
              <div className="flex flex-col gap-3">
                {currentQ.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-150 shadow-sm ${
                      answers[currentQuestion] === i
                        ? "bg-blue-600 border-blue-600 text-white font-medium shadow-blue-200/50"
                        : "hover:bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                    onClick={() => handleAnswerSelect(i)}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ChevronRight className="h-4 w-4 ml-1" /> السابق
              </Button>
              {currentQuestion === exam.questions.length - 1 ? (
                <Button
                  className="bg-green-600"
                  onClick={() => {
                    if (
                      window.confirm(
                        "هل أنت متأكد من إرسال الامتحان؟ لن تتمكن من التعديل بعد الإرسال."
                      )
                    ) {
                      handleSubmit()
                    }
                  }}
                  disabled={answeredCount !== totalQuestions}
                >
                  إرسال الامتحان
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  التالي <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ExamInterface