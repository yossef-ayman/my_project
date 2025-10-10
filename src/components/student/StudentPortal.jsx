"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  FileText,
  Award,
  Newspaper,
  LogOut,
  Calendar,
  User,
  Play,
  Clock,
  QrCode,
  Download,
  Share,
  Archive,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react"
import ExamInterface from "./ExamInterface"
import ExamReview from "./ExamReview" // سننشئ هذا المكون

// مكون بسيط لعرض رسالة التحميل
const LoadingScreen = () => (
    <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">جاري تحميل بيانات الطالب...</p>
    </div>
);

const StudentPortal = ({ user = {} }) => {
  const [student, setStudent] = useState(() => JSON.parse(localStorage.getItem("student")) || {});

  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null); // جديد: لتخزين نتيجة المراجعة
  const [exams, setExams] = useState([]);
  const [examResult, setExamResult] = useState([]);
  const [news, setNews] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllNews, setShowAllNews] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const token = localStorage.getItem("authToken");
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  // دمج جميع طلبات البيانات في useEffect واحد لمنع التنافس
  useEffect(() => {
    if (!token || !student?._id) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          examsResponse,
          resultsResponse,
          attendanceResponse,
          newsResponse,
          awardsResponse
        ] = await Promise.all([
          fetch(`${apiBaseUrl}/exams/active`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiBaseUrl}/exam-results/my-results`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiBaseUrl}/attendance/student/${student._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiBaseUrl}/news`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiBaseUrl}/awards/${student._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // معالجة جميع الاستجابات
        const examsData = await examsResponse.json();
        const resultsData = await resultsResponse.json();
        const attendanceData = await attendanceResponse.json();
        const newsData = await newsResponse.json();
        const awardsData = await awardsResponse.json();

        // تحديث الحالات
        setExams(Array.isArray(examsData) ? examsData : []);
        setExamResult(Array.isArray(resultsData) ? resultsData : []);
        setAttendanceRecords(Array.isArray(attendanceData) ? attendanceData : []);
        setNews(Array.isArray(newsData) ? newsData : []);
        setAwards(Array.isArray(awardsData) ? awardsData : []);

      } catch (err) {
        console.error("خطأ في تحميل البيانات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token, apiBaseUrl, student?._id]);

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setCurrentView("exam");
  }

  const handleExamComplete = (newlySavedResult) => {
    // تحديث قائمة النتائج مع النتيجة الجديدة
    setExamResult((prevResults) => [newlySavedResult, ...prevResults]);
    
    // ارجع إلى لوحة التحكم
    setCurrentView("dashboard");
    setSelectedExam(null);
  };

  // التحقق مما إذا كان الطالب قد امتحن هذا الامتحان مسبقاً
  const hasTakenExam = (examId) => {
    return examResult.some((result) => result.exam?._id === examId);
  }

  const getExamResult = (examId) => {
    return examResult.find((r) => r.Exam?._id === examId);
  }

  // دالة لفتح مراجعة الامتحان
  const handleReviewExam = (result) => {
    setSelectedResult(result);
    setSelectedExam(result.exam); // نحتاج بيانات الامتحان للمراجعة
    setCurrentView("exam-review");
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "عاجل": return "bg-red-500"
      case "مهم": return "bg-orange-500"
      default: return "bg-blue-500"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "تفوق": return "bg-yellow-500"
      case "حضور": return "bg-green-500"
      case "سلوك": return "bg-blue-500"
      case "مشاركة": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const generateQR = () => setQrGenerated(true)
  
  const totalPresentCount = attendanceRecords.filter(record => record.present).length

  // عرض واجهة الامتحان
  if (currentView === "exam" && selectedExam) {
    return (
      <ExamInterface
        exam={selectedExam}
        onBack={() => { setCurrentView("dashboard"); setSelectedExam(null) }}
        onComplete={handleExamComplete}
        student={student}
      />
    )
  }

  // عرض واجهة مراجعة الامتحان
  if (currentView === "exam-review" && selectedResult && selectedExam) {
    return (
      <ExamReview
        result={selectedResult}
        exam={selectedExam}
        onBack={() => { 
          setCurrentView("dashboard"); 
          setSelectedResult(null);
          setSelectedExam(null);
        }}
      />
    )
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-700" />
            </div>
            <span className="font-semibold text-gray-800">بوابة الطالب</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              localStorage.removeItem("student");
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-gray-500 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <div className="space-y-6" dir="rtl">
          {/* Card: Welcome */}
          <Card className="rounded-2xl shadow-xl border-2 border-transparent bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-blue-800">
                    مرحباً {user?.name }
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-purple-600 mt-1">
                    أهلاً بك في منصة أستاذ الاستاذ 
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-3 gap-4 border-t border-blue-100 pt-4 mt-4 text-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-semibold">رقم الطالب</p>
                  <Badge variant="outline" className="text-lg font-bold border-blue-300 text-blue-700 mt-1">
                    {student?.stdcode || "—"} 
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-semibold">إجمالي الحضور</p>
                  <Badge className="bg-green-500 text-white text-lg font-bold mt-1">
                    {totalPresentCount} مرة
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-semibold">حالة اليوم</p>
                   <Badge
                     className={`text-sm font-bold mt-1 ${
                       attendanceRecords.some(record => {
                         const recordDate = new Date(record.date).toDateString()
                         const todayDate = new Date().toDateString()
                         return recordDate === todayDate && record.present
                       }) ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                     }`}
                   >
                     {attendanceRecords.some(record => {
                         const recordDate = new Date(record.date).toDateString()
                         const todayDate = new Date().toDateString()
                         return recordDate === todayDate && record.present
                       }) ? "تم الحضور" : "لم تحضر بعد"}
                   </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Attendance */}
          <Card className="rounded-xl shadow-lg">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <Calendar className="h-6 w-6 text-green-500" /> سجل الحضور
              </CardTitle>
              <CardDescription className="text-gray-600">
                سجل الحضور والغياب الخاص بك
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {attendanceRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-lg">لا يوجد سجل حضور حتى الآن.</p>
              ) : (
                <div className="space-y-4">
                  {attendanceRecords.map((record) => (
                    <div key={record._id} className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center shadow-sm">
                      <span className="text-gray-700 font-medium">
                        {new Date(record.date).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <Badge className={`${record.present ? "bg-green-500" : "bg-red-500"} text-white`}>
                        {record.present ? "حاضر" : "غائب"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Card: Available Exams */}
          <Card className="rounded-xl shadow-lg">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <FileText className="h-6 w-6 text-blue-500" /> الامتحانات الإلكترونية
              </CardTitle>
              <CardDescription className="text-gray-600">
                الامتحانات المتاحة للحل
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {exams.filter((exam) => exam.isActive).length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-lg">لا توجد امتحانات متاحة حالياً</p>
              ) : (
                <div className="space-y-4">
                  {exams.filter((exam) => exam.isActive).map((exam) => {
                    const hasTaken = hasTakenExam(exam._id);
                    const result = getExamResult(exam._id);
                    
                    return (
                      <div key={exam._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-200">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{exam.title}</h3>
                          <p className="text-gray-500 mt-1">{exam.subject}</p>
                          <div className="flex gap-4 text-sm text-gray-400 mt-2">
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{exam.duration || "-"} دقيقة</span>
                            <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{exam.questions?.length || 0} سؤال</span>
                          </div>
                        </div>
                        <div>
                          {hasTaken ? (
                            <Badge className="bg-green-500 text-white text-md py-2 px-4 cursor-not-allowed">
                              تم الحل
                            </Badge>
                          ) : (
                            <Button onClick={() => handleStartExam(exam)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                              <Play className="h-4 w-4" /> بدء الامتحان
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Exam History */}
          <Card className="rounded-xl shadow-lg">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <Archive className="h-6 w-6 text-indigo-500" /> سجل الامتحانات
              </CardTitle>
              <CardDescription className="text-gray-600">
                نتائج الامتحانات السابقة التي قمت بحلها
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {examResult.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-lg">لم تقم بحل أي امتحانات بعد.</p>
              ) : (
                <div className="space-y-4">
                  {examResult.map((result) => (
                    <div key={result._id} className="bg-gray-50 border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg text-gray-800">{result.exam?.title || "امتحان غير متاح"}</h3>
                        <p className="text-gray-500 text-sm mt-1">{result.exam?.subject || "مادة غير معروفة"}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(result.completedAt).toLocaleDateString("ar-EG", {
                            year: "numeric", month: "long", day: "numeric", hour: '2-digit', minute:'2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                         <div className="text-center">
                            <p className="text-sm text-gray-500">الدرجة</p>
                            <span className="font-bold text-lg text-blue-700">{result.score}/{result.totalQuestions}</span>
                         </div>
                         <Badge className={`${result.isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} text-md py-2 px-3 flex items-center gap-1.5`}>
                          {result.isPassed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {result.isPassed ? "ناجح" : "راسب"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReviewExam(result)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> مراجعة
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* باقي المكونات (الأخبار، التكريمات، QR Code) */}
          <Card className="rounded-xl shadow-lg">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800"><Newspaper className="h-6 w-6 text-purple-500" /> الأخبار والإعلانات</CardTitle>
              <CardDescription className="text-gray-600">آخر الأخبار والإعلانات المهمة</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {news.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-lg">لا توجد أخبار جديدة</p>
              ) : (
                <div className="space-y-4">
                  {(showAllNews ? news : [news[0]]).map((item) => (
                    <div key={item._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.title || "خبر"} className="w-full max-h-64 object-cover rounded-md border mb-3" />}
                      <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                      <p className="text-gray-500 mt-1">{item.content}</p>
                      <Badge className={`${getPriorityColor(item.priority)} text-white mt-3`}>{item.priority}</Badge>
                    </div>
                  ))}
                  {news.length > 1 && (
                    <div className="text-center">
                      <Button onClick={() => setShowAllNews(!showAllNews)} variant="outline" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                        {showAllNews ? "إخفاء باقي الإعلانات" : "عرض جميع الإعلانات"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800"><Award className="h-6 w-6 text-yellow-500" /> تكريماتي</CardTitle>
              <CardDescription className="text-gray-600">التكريمات والجوائز التي حصلت عليها</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {awards.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-lg">لم تحصل على أي تكريمات بعد</p>
              ) : (
                <div className="space-y-4">
                  {awards.map((award) => (
                    <div key={award._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-start shadow-sm hover:shadow-md transition-all duration-200">
                      <div>
                        <h3 className="font-semibold text-lg text-yellow-800">{award.title}</h3>
                        <p className="text-yellow-700 text-sm mt-1">{award.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
                          <Calendar className="h-4 w-4" />
                          <span>{award.date ? new Date(award.date).toLocaleDateString("ar-EG") : ""}</span>
                        </div>
                      </div>
                      <Badge className={`${getTypeColor(award.type)} text-white`}>{award.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-purple-200 bg-purple-50 shadow-lg">
            <CardHeader className="border-b border-purple-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-purple-800"><QrCode className="h-6 w-6 text-purple-600" /> QR Code الخاص بك</CardTitle>
              <CardDescription className="text-purple-600">استخدم هذا الرمز لتسجيل الحضور السريع</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!qrGenerated ? (
                <Button onClick={generateQR} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-base py-2">إنشاء QR Code</Button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 mx-auto bg-white border-4 border-purple-500 rounded-lg flex items-center justify-center shadow-md">
                    <div>
                      <QrCode className="h-20 w-20 text-purple-600 mx-auto mb-2" />
                      <p className="text-md font-semibold text-purple-600">{student?.customId || "ST001"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-gray-700 hover:bg-gray-100">تحميل <Download className="h-4 w-4 mr-2" /></Button>
                    <Button variant="outline" className="flex-1 text-gray-700 hover:bg-gray-100">مشاركة <Share className="h-4 w-4 mr-2" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          منصة أستاذ الاستاذ &copy; {new Date().getFullYear()} جميع الحقوق محفوظة.
        </div>
      </div>
    </div>
  )
}

export default StudentPortal