"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react"

const ExamReview = ({ result, exam, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const handleNext = () => {
    if (currentQuestion < result.detailedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const currentReviewQ = result.detailedQuestions[currentQuestion]
  const isQCorrect = currentReviewQ.isCorrect
  const correctIndex = currentReviewQ.correctIndex
  const selectedIndex = currentReviewQ.selectedIndex

  return (
    <div className="space-y-6 max-w-3xl mx-auto" dir="rtl">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ChevronRight className="h-4 w-4 ml-1" /> العودة لسجل الامتحانات
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
            مراجعة السؤال {currentQuestion + 1} من {result.totalQuestions} (
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
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {currentQuestion + 1} / {result.totalQuestions}
            </Badge>
          </div>
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

export default ExamReview