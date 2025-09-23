// src/components/StudentDetails.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StudentDetails() {
  const { id } = useParams(); // 👈 هنا بناخد ID من الرابط
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchData() {
      try {
        // 📌 بيانات الطالب
        const studentRes = await fetch(
          `${process.env.REACT_APP_API_URL}/students/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const studentData = await studentRes.json();
        setStudent(studentData);

        // 📌 سجل الحضور
        const attendanceRes = await fetch(
          `${process.env.REACT_APP_API_URL}/Attendance/student/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);

        // 📌 نتائج الامتحانات
        const examsRes = await fetch(
      `${process.env.REACT_APP_API_URL}/exam-results/student/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const examsData = await examsRes.json();
    console.log("📌 Exam results response:", examsData); // 👈 اطبع الرد هنا
    setExams(examsData);
  
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
        <p>📅 التسجيل: {student.registrationDate}</p>
      </div>

      {/* سجل الحضور */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-2">📌 سجل الحضور</h2>
        {attendance.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {attendance.map((a, i) => (
              <li key={i}>
                {new Date(a.date).toLocaleDateString()} -{" "}
                {a.status ? "✔️ حاضر" : "❌ غائب"}
              </li>
            ))}
          </ul>
        ) : (
          <p>لا يوجد سجل حضور</p>
        )}
      </div>

      {/* نتائج الامتحانات */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-2">📌 نتائج الامتحانات</h2>
        {exams.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {exams.map((e, i) => (
              <li key={i}>
                {e.exam?.title || "امتحان"} (
                {e.exam?.subject || "مادة غير معروفة"}) - الدرجة: {e.score}/
                {e.totalQuestions}
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
