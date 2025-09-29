// src/components/student/ExamLoader.jsx
"use client"

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExamInterface from "./ExamInterface";
import { useToast } from "../../hooks/use-toast";

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <p className="text-xl font-semibold">جاري تحميل الامتحان...</p>
  </div>
);

const ExamLoader = ({ student }) => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("فشل تحميل الامتحان أو أنه غير متاح.");
        }
        
        const data = await res.json();
        setExam(data);
      } catch (err) {
        toast({ title: "خطأ", description: err.message, variant: "destructive" });
        navigate("/dashboard"); // أو أي مسار رئيسي آخر
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, navigate, toast]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!exam) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-red-500">لم يتم العثور على الامتحان.</p>
      </div>
    );
  }

  const handleExamComplete = (result) => {
    // تحديث النتائج المحفوظة محليًا (اختياري)
    const savedResults = JSON.parse(localStorage.getItem("examResults") || "[]");
    localStorage.setItem("examResults", JSON.stringify([...savedResults, result]));
    // الانتقال للوحة التحكم بعد إكمال الامتحان
    navigate("/dashboard");
  };

  return (
    <ExamInterface
      exam={exam}
      student={student}
      onBack={() => navigate("/dashboard")}
      onComplete={handleExamComplete}
    />
  );
};

export default ExamLoader;