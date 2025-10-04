"use client"

import { useState, useEffect, useCallback } from "react"
// تم استيراد BrowserRouter و Routes و Route لتوفير سياق التوجيه اللازم لعمل useNavigate
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { ArrowRight, Plus, Clock, FileText, Calendar, Check } from "lucide-react"

// =============================================================================
// 📌 مكونات UI داخلية (لحل مشكلة عدم القدرة على حل مسارات الاستيراد)
// Minimal inline components (Shadcn style) using Tailwind CSS
// =============================================================================

const Button = ({ children, onClick, variant = "default", size = "default", className = "", disabled = false }) => {
  let baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  if (variant === "outline") baseClasses += " border border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
  else if (variant === "destructive") baseClasses += " bg-red-500 text-white hover:bg-red-600";
  else baseClasses += " bg-blue-600 text-white hover:bg-blue-700"; // default

  if (size === "sm") baseClasses += " h-8 px-3";
  else if (size === "lg") baseClasses += " h-11 px-8";
  else baseClasses += " h-10 px-4 py-2"; // default

  return (
    <button className={`${baseClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow-lg ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Input = ({ type = "text", value, onChange, placeholder, className = "" }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, className = "" }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
  />
);

const Badge = ({ children, variant = "default", className = "" }) => {
  let baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  if (variant === "outline") baseClasses += " border-gray-300 text-gray-700";
  else baseClasses += " bg-gray-900 text-white hover:bg-gray-800"; // default

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
};

// =============================================================================
// 📌 نظام التنبيهات (Toast System)
// Implements a simple toast notification system
// =============================================================================

const useToast = (setToastState) => ({
  toast: ({ title, description, variant = "default" }) => {
    setToastState({ title, description, variant, id: Date.now() });
    setTimeout(() => {
      setToastState(null);
    }, 4000); // إخفاء بعد 4 ثوانٍ
  }
});

const ToastDisplay = ({ toast }) => {
  if (!toast) return null;

  let classes = "fixed bottom-4 left-4 p-4 rounded-lg shadow-xl z-50 transition-transform duration-300 transform";
  
  if (toast.variant === "destructive") {
    classes += " bg-red-600 text-white border-2 border-red-700";
  } else {
    classes += " bg-green-600 text-white border-2 border-green-700";
  }

  return (
    <div className={classes} key={toast.id}>
      <p className="font-bold">{toast.title}</p>
      <p className="text-sm opacity-90">{toast.description}</p>
    </div>
  );
};

// =============================================================================
// 📝 المكون الأساسي لإدارة الامتحانات (ExamManagerCore)
// تم تغيير الاسم لإضافة Router wrapper في المكون الرئيسي المصدر
// =============================================================================

const API_URL = "http://localhost:3000/api/exams" 

const _ExamManagerCore = ({ onBack }) => { // تم تغيير الاسم
  const navigate = useNavigate()
  const [toastState, setToastState] = useState(null);
  const { toast } = useToast(setToastState); 

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

  const [newExam, setNewExam] = useState({ title: "", subject: "", description: "", date: "", duration: "", passingScore: 50 })
  const [newQuestion, setNewQuestion] = useState({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 })

  // ملاحظة: في بيئة Canvas، لا يتوفر localStorage دائماً، ولكني سأفترض وجوده كما في الكود الأصلي
  const token = localStorage.getItem("authToken") || "mock-admin-token"; 

  // 📌 تحميل الامتحانات
  const loadExams = useCallback(() => {
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("فشل في تحميل الامتحانات. غير مصرح لك بالدخول أو خطأ في السيرفر.");
        return res.json();
      })
      .then(setExams)
      .catch(err => {
        toast({ title: "⚠️ خطأ في التحميل", description: err.message, variant: "destructive" })
      });
  }, [token, toast]);

  useEffect(() => {
    loadExams();
  }, [loadExams]); 

  // 📌 إضافة امتحان
  const handleAddExam = async () => {
    if (!newExam.title || !newExam.subject || !newExam.date || !newExam.duration) {
      toast({ title: "خطأ", description: "يرجى ملء كل الحقول المطلوبة (بما في ذلك المدة)", variant: "destructive" })
      return
    }
    
    // تحويل المدة ودرجة النجاح إلى أرقام
    const examData = {
        ...newExam,
        duration: Number(newExam.duration),
        passingScore: Number(newExam.passingScore)
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(examData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `فشل إضافة الامتحان: الحالة ${res.status}`);
      }

      const data = await res.json()
      setExams([data, ...exams])
      setNewExam({ title: "", subject: "", description: "", date: "", duration: "", passingScore: 50 })
      setShowAddForm(false)
      toast({ title: "✅ تم", description: `تمت إضافة الامتحان ${data.title}`, variant: "default" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // 📌 إضافة / تعديل سؤال
  const handleAddOrUpdateQuestion = async () => {
    // التحقق من أن جميع الخيارات الأربعة مملوءة
    if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) {
      toast({ title: "خطأ", description: "يرجى ملء نص السؤال وجميع الخيارات الأربعة", variant: "destructive" })
      return
    }
    if (!selectedExamId) return

    // التأكد من أن حقل الإجابة الصحيحة هو رقم
    const questionData = {
        ...newQuestion,
        correctAnswer: Number(newQuestion.correctAnswer)
    }

    try {
      let res
      if (editingQuestionId) {
        res = await fetch(`${API_URL}/${selectedExamId}/questions/${editingQuestionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(questionData),
        })
      } else {
        res = await fetch(`${API_URL}/${selectedExamId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(questionData),
        })
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `فشل حفظ السؤال: الحالة ${res.status}`);
      }

      const updatedExam = await res.json()
      setExams(prev => prev.map(exam => exam._id === updatedExam._id ? updatedExam : exam))
      setNewQuestion({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 })
      setEditingQuestionId(null)
      setShowQuestionForm(false)
      toast({ title: "✅ تم", description: editingQuestionId ? "تم تعديل السؤال" : "تمت إضافة السؤال", variant: "default" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // 📌 حذف سؤال
  const handleDeleteQuestion = async (qid, examId) => {
    try {
      const res = await fetch(`${API_URL}/${examId}/questions/${qid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `فشل حذف السؤال: الحالة ${res.status}`);
      }
      
      const updatedExam = await res.json()
      setExams(prev => prev.map(exam => exam._id === examId ? updatedExam : exam))
      toast({ title: "✅ تم", description: "تم حذف السؤال بنجاح", variant: "default" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // 📌 تعديل سؤال
  const handleEditQuestion = (q, examId) => {
    // نسخ الكائن لضمان استقلالية التعديل وتعيين القيمة لدرجة النجاح كرقم
    setNewQuestion({...q, options: q.options || ["", "", "", ""], correctAnswer: Number(q.correctAnswer) }) 
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `فشل تحديث الحالة: الحالة ${res.status}`);
      }
      const data = await res.json()
      setExams(prev => prev.map(exam => exam._id === examId ? data : exam))
      toast({ title: "✅ تم", description: `تم تبديل حالة الامتحان إلى ${data.isActive ? 'نشط' : 'متوقف'}`, variant: "default" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto font-sans" dir="rtl">
      <ToastDisplay toast={toastState} />
      
      {/* الهيدر */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack} className="bg-white">
            <ArrowRight className="h-4 w-4 ml-1" /> عودة
          </Button>
          <h1 className="text-2xl font-extrabold text-blue-700">📝 إدارة الامتحانات</h1>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg">
          <Plus className="h-4 w-4 ml-2" /> إضافة امتحان جديد
        </Button>
      </div>

      {/* نموذج امتحان جديد */}
      {showAddForm && (
        <Card className="shadow-2xl border-blue-400">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-xl text-blue-800">إنشاء امتحان جديد</CardTitle>
            <CardDescription>حدد العنوان، المادة، والمدة الزمنية.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input placeholder="عنوان الامتحان (مثال: اختبار الوحدة الأولى)" value={newExam.title}
              onChange={e => setNewExam({ ...newExam, title: e.target.value })} />
            <Input placeholder="المادة (مثال: الرياضيات)" value={newExam.subject}
              onChange={e => setNewExam({ ...newExam, subject: e.target.value })} />
            <Textarea placeholder="وصف موجز للامتحان" value={newExam.description}
              onChange={e => setNewExam({ ...newExam, description: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input type="date" value={newExam.date} onChange={e => setNewExam({ ...newExam, date: e.target.value })} />
                <Input placeholder="المدة بالدقائق (مثال: 60)" type="number"
                    value={newExam.duration} onChange={e => setNewExam({ ...newExam, duration: e.target.value })} />
                <Input placeholder="درجة النجاح (مثال: 50)" type="number"
                    value={newExam.passingScore} onChange={e => setNewExam({ ...newExam, passingScore: e.target.value })} />
            </div>
            
            <div className="flex justify-end gap-2">
                <Button onClick={handleAddExam} className="bg-green-600 hover:bg-green-700">إضافة الامتحان</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* إضافة/تعديل سؤال */}
      {showQuestionForm && selectedExamId && (
        <Card className="shadow-2xl border-purple-400">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-xl text-purple-800">{editingQuestionId ? "تعديل سؤال موجود" : "إضافة سؤال جديد"}</CardTitle>
            <CardDescription>اختر الإجابة الصحيحة بالضغط على دائرة الاختيار.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Textarea placeholder="نص السؤال" value={newQuestion.question}
              onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} />
            
            {/* حقل الصورة (يمكن إضافته لاحقًا) */}
            {/* <Input placeholder="رابط صورة (اختياري)" value={newQuestion.image}
              onChange={e => setNewQuestion({ ...newQuestion, image: e.target.value })} /> */}
            
            <div className="space-y-3">
                {newQuestion.options.map((opt, i) => (
                <div key={i} className={`flex gap-3 items-center p-2 rounded-lg border transition-colors ${
                    newQuestion.correctAnswer === i ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                    <input type="radio" checked={newQuestion.correctAnswer === i}
                    onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: i })} 
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500" style={{ accentColor: 'rebeccapurple' }}/>
                    <Input placeholder={`خيار ${i+1}`} value={opt}
                    onChange={e => {
                        const options = [...newQuestion.options]
                        options[i] = e.target.value
                        setNewQuestion({ ...newQuestion, options })
                    }} />
                </div>
                ))}
            </div>
            
            <div className="flex justify-end gap-2">
                <Button onClick={handleAddOrUpdateQuestion} className="bg-purple-600 hover:bg-purple-700">
                    {editingQuestionId ? "حفظ التعديل" : "إضافة السؤال"}
                </Button>
                <Button variant="outline" onClick={() => {
                    setShowQuestionForm(false);
                    setEditingQuestionId(null);
                    setNewQuestion({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 });
                }}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* عرض الامتحانات */}
      <div className="space-y-6">
        {exams.length === 0 && <p className="text-center text-lg text-gray-500 py-10">...جاري تحميل الامتحانات أو لا توجد امتحانات مضافة بعد</p>}

        {exams.map(exam => (
          <Card key={exam._id} className={`shadow-xl border-l-4 ${exam.isActive ? 'border-green-500' : 'border-gray-400'}`}>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex justify-between items-start">
                {exam.title}
                <Badge className={`text-xs ${exam.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"} text-white`}>
                  {exam.isActive ? "نشط حالياً" : "متوقف"}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm mt-1 flex-wrap">
                <span>المادة: **{exam.subject}**</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center"><Clock className="h-3 w-3 inline ml-1" /> {exam.duration || 'غير محدد'} دقيقة</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center"><Check className="h-3 w-3 inline ml-1" /> درجة النجاح: **{exam.passingScore || 50}**</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3">{exam.description}</p>
              <div className="flex gap-3 mb-4 flex-wrap items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  <FileText className="h-3 w-3 ml-1" /> {exam.questions?.length || 0} أسئلة
                </Badge>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Calendar className="h-3 w-3 ml-1" /> التاريخ: {exam.date ? new Date(exam.date).toLocaleDateString("ar-EG") : 'غير محدد'}
                </Badge>
                <Button onClick={() => toggleExamStatus(exam._id)} size="sm" className={exam.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>
                    {exam.isActive ? 'إيقاف الامتحان' : 'تفعيل الامتحان'}
                </Button>
              </div>

              <h3 className="text-lg font-bold border-b pb-1 mt-4 text-gray-700">قائمة الأسئلة:</h3>
              
              {(!exam.questions || exam.questions.length === 0) && <p className="text-gray-500 mt-2 text-sm italic">لم تتم إضافة أي أسئلة لهذا الامتحان بعد.</p>}

              {exam.questions && exam.questions.map((q, i) => (
                <div key={q._id} className="border p-4 rounded-lg mt-3 bg-gray-50">
                  <p className="font-bold text-gray-800 mb-2">{i+1}. {q.question}</p>
                  <ul className="space-y-1 text-sm">
                    {q.options.map((opt, j) => (
                      <li key={j} className={`p-1 rounded flex items-start ${q.correctAnswer === j ? "font-bold text-green-700 bg-green-100" : "text-gray-600"}`}>
                        <div className="flex-shrink-0 pt-1">
                          {q.correctAnswer === j ? <Check className="h-4 w-4 mr-1 text-green-700" /> : <span className="h-4 w-4 mr-1"></span>}
                        </div>
                        <span className="flex-grow">{opt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                    <Button onClick={() => handleEditQuestion(q, exam._id)} size="sm" variant="outline" className="text-blue-500 border-blue-300 hover:bg-blue-100">✏️ تعديل</Button>
                    <Button onClick={() => handleDeleteQuestion(q._id, exam._id)} size="sm" variant="destructive">🗑️ حذف</Button>
                  </div>
                </div>
              ))}
              <Button onClick={() => { setSelectedExamId(exam._id); setShowQuestionForm(true); setEditingQuestionId(null); setNewQuestion({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }); }} size="sm" className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 ml-1" /> إضافة سؤال جديد
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


// =============================================================================
// 📝 المكون المصدر (Wrapper)
// يوفر سياق التوجيه (Router) للمكون الأساسي
// =============================================================================

const ExamManager = ({ onBack }) => {
    return (
        <BrowserRouter>
            {/* Routes and Route are necessary wrappers for components using hooks like useNavigate */}
            <Routes>
                <Route path="*" element={<_ExamManagerCore onBack={onBack} />} />
            </Routes>
        </BrowserRouter>
    );
};

export default ExamManager
