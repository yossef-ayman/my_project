// src/components/StudentDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// نستخدم FaArrowLeft ليكون سهم يشير للخارج (لليسار)
import { FaUserGraduate, FaIdCard, FaEnvelope, FaMobileAlt, FaPhoneVolume, FaCalendarAlt, FaScroll, FaBookOpen, FaArrowLeft } from 'react-icons/fa'; 

// 🛠️ مكون بسيط لعرض صف في البطاقة (بدون تغيير)
const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-2 space-x-reverse text-gray-700">
    <Icon className="text-blue-500 w-5 h-5 flex-shrink-0" />
    <span className="font-medium">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

// ----------------------------------------------------

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... (كود جلب البيانات كما هو)
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // 👮‍♂️ التحقق من الصلاحيات
    if (!token || user.role !== "admin") {
      window.location.href = "/";
      return;
    }

    async function fetchData() {
      try {
        const [studentRes, examResultsRes] = await Promise.all([
          fetch(
            `${process.env.REACT_APP_API_URL}/students/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `${process.env.REACT_APP_API_URL}/exam-results/student/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        if (!studentRes.ok) throw new Error(`HTTP ${studentRes.status} for student data`);
        const studentData = await studentRes.json();
        setStudent(studentData);

        if (!examResultsRes.ok) throw new Error(`HTTP ${examResultsRes.status} for exam results`);
        const examResultsData = await examResultsRes.json();
        setExamResults(examResultsData);

      } catch (err) {
        console.error("❌ خطأ في تحميل البيانات", err);
        setError("تعذر تحميل بيانات الطالب. الرجاء المحاولة لاحقًا.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // ------------------------- عروض الحالات -------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-blue-600 animate-pulse">⏳ جاري تحميل بيانات الطالب...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg m-6">
        <p className="font-bold">حدث خطأ:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!student) {
    return <p className="p-6 text-xl text-center text-gray-600">❌ لم يتم العثور على الطالب</p>;
  }

  // ------------------------- العرض الرئيسي -------------------------

  const formattedDate = student.registrationDate
    ? new Date(student.registrationDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : "—";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      
      {/* ⬅️ زر الرجوع (أعلى اليسار) - تم تغيير الـ Icon و Flex direction */}
      <button 
        onClick={() => navigate(-1)}
        // استخدمنا justify-start لدفع الزر إلى بداية الحاوية (اليسار في سياق RTL)
        // واستبدلنا space-x-reverse بـ space-x-2 فقط
        className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition duration-150 font-medium float-left clear-both"
      >
        <FaArrowLeft className="w-4 h-4" /> {/* استخدمنا FaArrowLeft ليتناسب مع الاتجاه */}
        <span>العودة للقائمة</span>
      </button>

      {/* لإصلاح مشكلة الـ float مع العناصر التي تليه */}
      <div className="clear-both pt-10"></div> 

      {/* 💳 بطاقة بيانات الطالب الرئيسية (كما هي) */}
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 border-t-4 border-blue-600 mb-8">
        <div className="flex items-center space-x-4 space-x-reverse mb-4 border-b pb-4">
          <FaUserGraduate className="text-blue-600 w-10 h-10 flex-shrink-0" />
          <h1 className="text-3xl font-extrabold text-gray-800">{student.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
          <DetailItem icon={FaIdCard} label="كود الطالب" value={student.stdcode} />
          <DetailItem icon={FaBookOpen} label="الصف الدراسي" value={student.grade} />
          <DetailItem icon={FaEnvelope} label="البريد الإلكتروني" value={student.email || "—"} />
          <DetailItem icon={FaMobileAlt} label="هاتف الطالب" value={student.phone || "—"} />
          <DetailItem icon={FaPhoneVolume} label="هاتف ولي الأمر" value={student.parentPhone || "—"} />
          <DetailItem icon={FaCalendarAlt} label="تاريخ التسجيل" value={formattedDate} />
        </div>
      </div>

      <hr className="my-8" />

      {/* 📊 قسم نتائج الامتحانات (كما هو) */}
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2 space-x-reverse">
          <FaScroll className="text-green-600 w-6 h-6" />
          <span>نتائج الامتحانات</span>
        </h2>

        {examResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عنوان الامتحان
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المادة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدرجة المحققة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدرجة الكلية
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النسبة المئوية
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examResults.map((result, i) => {
                  const score = result.score || 0;
                  const total = result.totalQuestions || 1;
                  const percentage = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
                  const percentageColor = percentage >= 80 ? 'text-green-600 font-bold' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
                  
                  return (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.exam?.title || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.exam?.subject || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {total}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${percentageColor}`}>
                        %{percentage}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">
            لا توجد نتائج امتحانات مسجلة لهذا الطالب حاليًا.
          </p>
        )}
      </div>
      
    </div>
  );
}