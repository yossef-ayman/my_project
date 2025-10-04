// ملف: /routes/examResults.js
const express = require("express");
const router = express.Router();
const ExamResult = require("../models/examResult.model");
const auth = require("../middlewares/auth");
const Exam = require("../models/exam.model");

// 📌 تسجيل نتيجة امتحان (الطالب)
router.post("/", auth(["student", "admin"]), async (req, res) => {
  try {
    // 💡 التعديل هنا: استخدام 'exam' و 'student' لمطابقة الـ Frontend
    const { exam, student, answers, completedAt } = req.body; 

    // 🟢 جيب الامتحان من الداتابيس
    const foundExam = await Exam.findById(exam); 
    if (!foundExam) return res.status(404).json({ error: "الامتحان غير موجود" });

    // 🟢 احسب السكور هنا (لضمان أقصى درجات الأمان)
    let score = 0; 
    foundExam.questions.forEach((q, index) => {
      // 💡 التأكد من تحويل الإجابة الصحيحة إلى رقم للمقارنة
      const correct = Number(q.correctAnswer); 
      if (answers[index] === correct) { 
        score++;
      }
    });

    const result = new ExamResult({
      // استخدام الحقول المستخرجة مباشرة
      exam: exam,          
      student: student,    
      score, 
      totalQuestions: foundExam.questions.length, 
      answers,
      completedAt: completedAt || new Date()
    });

    await result.save();
    res.status(201).json(result);
  } catch (err) {
    console.error("Error saving exam result:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /exam-results/lock
router.post("/lock", auth(["student", "admin"]), async (req, res) => {
  // ملاحظة: إذا كان الـ Frontend يرسل 'exam' و 'student' هنا أيضاً، يجب تعديل هذا السطر
  const { examId, studentId } = req.body;
  try {
    const result = await ExamResult.findOneAndUpdate(
      { exam: examId, student: studentId }, // التأكد من استخدام اسم الحقل في الـ Model
      { locked: true },
      { new: true, upsert: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 استرجاع نتائج طالب محدد (Admins فقط)
router.get("/student/:id", auth(["admin"]), async (req, res) => {
  try {
    const results = await ExamResult.find({ student: req.params.id })
      .populate("exam", "title subject date")
      .populate("student", "name stdcode grade email")
      .sort({ completedAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📌 استرجاع نتائج امتحان محدد (للامن فقط)
router.get("/exam/:examId", auth(["admin"]), async (req, res) => {
  try {
    const results = await ExamResult.find({ exam: req.params.examId })
      .populate("student", "name stdcode grade")
      .sort({ completedAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 استرجاع نتيجة واحدة (طالب X امتحان)
router.get("/:examId/:studentId", auth(["student", "admin"]), async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const result = await ExamResult.findOne({ exam: examId, student: studentId })
      .populate("exam", "title subject")
      .populate("student", "name stdcode");

    if (!result) return res.status(404).json({ message: "لا توجد نتيجة" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 حذف نتيجة (Admins فقط)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    await ExamResult.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف النتيجة" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;