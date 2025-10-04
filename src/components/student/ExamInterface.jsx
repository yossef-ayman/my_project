"use client"

import { useState, useEffect, useMemo } from "react"
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, List } from "lucide-react"

// =================================================================
// ⚠️ مكونات وهمية لضمان عمل الكود في بيئة المعاينة
// =================================================================

const Card = ({ children, className }) => (
  <div className={`rounded-xl border bg-white ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }) => (
  <h3 className={`text-xl font-bold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const CardFooter = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// محاكاة لـ useToast
const useToast = () => ({
  toast: ({ title, description, variant }) => {
    console.log(`[Toast ${variant.toUpperCase()}]: ${title} - ${description}`);
  }
});

const Button = ({ children, onClick, disabled, variant = 'default', size = 'default', className }) => {
    let baseStyle = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center whitespace-nowrap';
    let variantStyle = 'bg-blue-600 text-white hover:bg-blue-700';
    if (variant === 'outline') variantStyle = 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100';
    if (variant === 'destructive') variantStyle = 'bg-red-600 text-white hover:bg-red-700';
    if (variant === 'ghost') variantStyle = 'bg-transparent text-gray-700 hover:bg-gray-100';
    
    let sizeStyle = 'h-10 text-sm';
    if (size === 'sm') sizeStyle = 'h-8 text-xs px-3';

    if (disabled) variantStyle = 'bg-gray-300 text-gray-500 cursor-not-allowed';

    return (
        <button 
            onClick={onClick} 
            disabled={disabled} 
            className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
        >
            {children}
        </button>
    );
};

const Progress = ({ value, className }) => (
    <div className={`h-2 w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
        <div 
            style={{ width: `${value}%` }} 
            className="h-full bg-blue-500 transition-all duration-500"
        />
    </div>
);

// =================================================================
// المكون الرئيسي: ExamInterface
// =================================================================

const ExamInterface = ({ exam, onBack, onComplete, student }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(new Array(exam.questions.length).fill(-1))
  const [timeLeft, setTimeLeft] = useState(Number.parseInt(exam.duration) * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false) // شريط التأكيد المخصص
  
  const { toast } = useToast()

  const answeredCount = useMemo(() => answers.filter(a => a !== -1).length, [answers])
  const totalQuestions = exam.questions.length
  const progressValue = (answeredCount / totalQuestions) * 100

  // ⏱️ مؤقت الامتحان
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit()
      toast({
        title: "انتهى الوقت",
        description: "تم إرسال الامتحان تلقائياً.",
        variant: "destructive",
      })
    }
  }, [timeLeft, isSubmitted, totalQuestions, toast])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (answerIndex) => {
    if (isSubmitted) return
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
    if (isSubmitted) return
    setIsSubmitted(true)
    setShowConfirm(false)

    // 1. حساب الدرجة التفصيلي للمراجعة محليا (مؤقت للاستخدام في الـ UI بعد الإرسال)
    let score = 0
    const detailedQuestions = exam.questions.map((q, index) => {
        // 💡 التعديل هنا: استخدام parseInt لضمان تحويل الإجابة الصحيحة إلى رقم صحيح
        const correctIndex = parseInt(q.correctAnswer, 10); 
        const selectedIndex = answers[index];
        
        // التحقق: هل تم اختيار إجابة وهل تتطابق مع الإجابة الصحيحة؟
        const isCorrect = selectedIndex !== -1 && selectedIndex === correctIndex;
        
        if (isCorrect) score += 1
        
        return {
            questionText: q.question,
            options: q.options,
            selectedAnswer: selectedIndex,
            correctAnswer: correctIndex, 
            isCorrect: isCorrect,
        }
    })

    const passingScore = exam.passingScore || (exam.questions.length / 2)
    const isPassed = score >= passingScore

    // البيانات التي يجب إرسالها إلى الـ Backend
    const dataToSend = {
      exam: exam._id, // معرّف الامتحان
      student: student?._id, // معرّف الطالب
      answers: answers, // إجابات الطالب
      completedAt: new Date().toISOString(),
    };

    const MAX_RETRIES = 3;
    const API_URL = "/api/exam-results"; 
    
    // نموذج لنتيجة متوقعة من السيرفر ليتم استخدامها في الـ UI
    const examResultLocal = {
      examId: exam._id,
      studentId: student?._id,
      score, // الآن يجب أن يكون هذا الرقم صحيحاً
      totalQuestions: exam.questions.length,
      isPassed,
      detailedQuestions,
      completedAt: dataToSend.completedAt,
    }

    try {
      let response = null;
      let confirmedResult = null;
      
      // تنفيذ المحاولة المتكررة مع التراجع الأُسّي
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          console.log(`Sending results to API (Attempt ${attempt + 1})...`, dataToSend);

          // 🛑 محاكاة لعملية الإرسال الناجحة للسيرفر 
          // (ستحتاج لـ fetch حقيقي عند النشر)
          if (attempt === 0) { 
              await new Promise(resolve => setTimeout(resolve, 500)); 
              confirmedResult = examResultLocal; 
              response = { ok: true, status: 201 }; 
              break; 
          }
          // 🛑 نهاية المحاكاة 🛑

        } catch (error) {
          console.error(`API attempt ${attempt + 1} failed:`, error);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          } else {
            throw new Error("Failed to submit exam results after multiple retries.");
          }
        }
      }

      if (!response || !response.ok) {
        throw new Error("Failed to submit exam results.");
      }

      setResult(confirmedResult) 
      onComplete(confirmedResult)

      toast({
        title: confirmedResult.isPassed ? "🎉 تهانينا! نجحت." : "⚠️ تحتاج للمزيد من الدراسة.",
        description: `حصلت على ${confirmedResult.score} من ${confirmedResult.totalQuestions}.`,
        variant: confirmedResult.isPassed ? "default" : "destructive",
      })
    } catch (err) {
      toast({ title: "خطأ في الإرسال", description: err.message, variant: "destructive" })
      setIsSubmitted(false)
    }
  }

  const currentQ = exam.questions[currentQuestion]

  // -------------------------------------------------------------
  // 3. عرض مراجعة الإجابات (بعد الإرسال)
  // -------------------------------------------------------------
  if (isSubmitted && result && isReviewing) {
    const currentReviewQ = result.detailedQuestions[currentQuestion]
    const isQCorrect = currentReviewQ.isCorrect
    const correctIndex = currentReviewQ.correctAnswer
    const selectedIndex = currentReviewQ.selectedAnswer

    return (
      <div className="space-y-6 max-w-3xl mx-auto" dir="rtl">
        <Button variant="ghost" size="sm" onClick={() => setIsReviewing(false)}>
          <ChevronRight className="h-4 w-4 ml-1" /> العودة للنتيجة
        </Button>

        <Card
          className={`shadow-2xl ${
            isQCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
          }`}
        >
          <CardHeader className="border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              {isQCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              مراجعة السؤال {currentQuestion + 1} ({isQCorrect ? "صحيح" : "خطأ"})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg font-bold mb-4 text-gray-800">{currentReviewQ.questionText}</p>
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
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              <ChevronRight className="h-4 w-4 ml-1" /> السؤال السابق
            </Button>
            {currentQuestion === result.detailedQuestions.length - 1 ? (
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

  // -------------------------------------------------------------
  // 2. عرض النتيجة بعد التسليم
  // -------------------------------------------------------------
  if (isSubmitted && result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100)
    const passed = result.isPassed
    const passingScore = exam.passingScore || exam.questions.length / 2

    return (
      <div className="space-y-6 max-w-md mx-auto" dir="rtl">
        <Card
          className={`shadow-2xl ${passed ? "border-green-500 bg-white" : "border-red-500 bg-white"}`}
        >
          <CardHeader className={`border-b ${passed ? "bg-green-50" : "bg-red-50"}`}>
            <CardTitle className={`text-2xl font-bold ${passed ? "text-green-800" : "text-red-800"}`}>
              {passed ? "🎉 مبروك! نجاح باهر" : "⚠️ محاولة غير موفقة"}
            </CardTitle>
            <p className="text-sm text-gray-600">نتيجة الامتحان: {exam.title}</p>
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
            {/* عرض زر المراجعة للجميع الآن لتوضيح آلية العمل */}
            <Button
              onClick={() => {
                setIsReviewing(true)
                setCurrentQuestion(0)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              مراجعة الإجابات
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
  // 1. عرض الامتحان (الواجهة الرئيسية)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-4xl mx-auto min-h-screen pb-10" dir="rtl">
      {/* شريط الحالة والمؤقت */}
      <div className="bg-white p-4 rounded-xl shadow-xl border border-blue-200 flex flex-col sm:flex-row justify-between items-center sticky top-4 z-20 gap-3">
        
        {/* معلومات الامتحان (العنوان) */}
        <div className="flex-1 min-w-0 text-center sm:text-right">
          <p className="text-xs font-medium text-gray-500 truncate">امتحان</p>
          <h2 className="text-lg font-bold text-blue-800 truncate" title={exam.title}>
            {exam.title}
          </h2>
        </div>

        {/* معلومات التقدم والوقت */}
        <div className="flex items-center gap-6">
          {/* التقدم */}
          <div className="text-center sm:border-r sm:pr-6 border-gray-200">
            <p className="text-sm font-semibold text-gray-600 whitespace-nowrap">
              {answeredCount} / {totalQuestions} سؤال
            </p>
            <p className="text-xs text-gray-500">تمت الإجابة</p>
          </div>
          
          {/* المؤقت */}
          <div className="flex items-center gap-2">
            <Clock className="text-red-600 h-5 w-5" />
            <span className="text-xl font-bold text-red-600">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2 mt-3 sm:mt-0">
          <Button
            onClick={() => setShowConfirm(true)} // استخدام شريط التأكيد المخصص
            disabled={answeredCount !== totalQuestions}
            className="bg-green-600 hover:bg-green-700 text-white transition-all"
          >
            إرسال وإنهاء
          </Button>
          <Button variant="outline" size="sm" onClick={onBack}>
            العودة
          </Button>
        </div>
      </div>
      
      {/* شريط تأكيد الإرسال (بديل لـ window.confirm) */}
      {showConfirm && (
        <Card className="p-4 bg-yellow-50 border-yellow-300 shadow-md flex flex-col sm:flex-row justify-between items-center transition-all duration-300 z-30 sticky top-[6.5rem]">
          <p className="text-sm font-medium text-yellow-800 text-center sm:text-right mb-2 sm:mb-0">
            هل أنت متأكد من إرسال الامتحان؟ لن تتمكن من التعديل بعد الإرسال.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleSubmit}>
              أرسل الآن
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>
              إلغاء
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
        {/* عمود جانبي: التنقل بين الأسئلة والتقدم */}
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
                      currentQuestion === i 
                        ? "ring-2 ring-blue-500 ring-offset-2 border-4 border-blue-500" 
                        : ""
                    } ${
                      answers[i] !== -1
                        ? "bg-green-500 hover:bg-green-600 text-white"
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
          <Card className="shadow-lg border-2 border-blue-100 min-h-[400px]">
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
                        ? "bg-blue-600 border-blue-600 text-white font-medium shadow-blue-200/50 scale-[1.01]"
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
                  onClick={() => setShowConfirm(true)}
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
