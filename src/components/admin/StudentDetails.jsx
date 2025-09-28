// src/components/StudentDetails.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StudentDetails() {
  const { id } = useParams(); // 👈 هنا بناخد ID من الرابط
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // 👮‍♂️ لو المستخدم مش أدمن
    if (!token || user.role !== "admin") {
      window.location.href = "/"; // أو ممكن تعمل صفحة Forbidden
      return;
    }

    async function fetchData() {
      try {
        // 📌 بيانات الطالب
        const studentRes = await fetch(
          `${process.env.REACT_APP_API_URL}/students/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!studentRes.ok) throw new Error(`HTTP ${studentRes.status}`);
        const studentData = await studentRes.json();
        setStudent(studentData);



        // 📌 نتائج الامتحانات
        const examResultsRes = await fetch(
          `${process.env.REACT_APP_API_URL}/exam-results/student/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!examResultsRes.ok) throw new Error(`HTTP ${examResultsRes.status}`);
        const examResultsData = await examResultsRes.json();
        console.log("📌 Raw Exam Results:", examResultsData);
        setExamResults(examResultsData);
      } catch (err) {
        console.error("❌ خطأ في تحميل البيانات", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <p className="p-6">⏳ جاري التحميل...</p>;
  if (!student) return <p className="p-6">❌ لم يتم العثور على الطالب</p>;

  return (
    <div className="p-6 space-y-6">
      {/* بيانات الطالب */}
      <div className="bg-white shadow rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-2">{student.name}</h1>
        <p>كود الطالب: {student.stdcode}</p>
        <p>الصف: {student.grade}</p>
        <p>البريد: {student.email}</p>
        <p>📱 الطالب: {student.phone || "—"}</p>
        <p>👨‍👩‍👦 ولي الأمر: {student.parentPhone || "—"}</p>
        <p>
          📅 التسجيل:{" "}
          {student.registrationDate
            ? new Date(student.registrationDate).toLocaleDateString()
            : "—"}
        </p>
      </div>



      {/* نتائج الامتحانات */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-2">📌 نتائج الامتحانات</h2>
        {examResults.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {examResults.map((result, i) => (
              <li key={i}>
                {result.exam?.title || "امتحان"} (
                {result.exam?.subject || "مادة غير معروفة"}) - الدرجة:{" "}
                {result.score}/{result.totalQuestions}
              </li>
            ))}
          </ul>
        ) : (
          <p>لا يوجد نتائج امتحانات</p>
        )}
      </div>
    </div>
  );
}
