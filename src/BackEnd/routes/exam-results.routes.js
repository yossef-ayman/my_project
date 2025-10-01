// src/BackEnd/routes/examResult.routes.js
const express = require("express");
const router = express.Router();
const ExamResult = require("../models/examResult.model");
const auth = require("../middlewares/auth");
const Exam = require("../models/exam.model");
// لم نعد بحاجة لجلب موديل Exam هنا
// const Exam = require("../models/exam.model");

// ▼▼▼ هذا هو الجزء الذي تم تعديله بالكامل ▼▼▼
// 📌 تسجيل نتيجة امتحان (الطالب)
router.post("/", auth(["student", "admin"]), async (req, res) => {
  try {
    // 1. استقبل إجابات الطالب والبيانات الأساسية فقط
    const { exam: examId, student: studentId, answers } = req.body;

    // 2. أحضر الامتحان كاملاً (مع الإجابات الصحيحة) من قاعدة البيانات
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "الامتحان غير موجود" });

    // 3. قم بحساب الدرجة وتفاصيل الأسئلة هنا في السيرفر
    let score = 0;
    const detailedQuestions = exam.questions.map((q, index) => {
      const correctIndex = Number(q.correctAnswer);
      const selectedIndex = answers[index];
      const isCorrect = selectedIndex === correctIndex;

      if (isCorrect) {
        score++;
      }

      return {
        questionId: q._id,
        questionText: q.question,
        options: q.options,
        selectedIndex,
        correctIndex,
        isCorrect,
      };
    });

    // 4. حدد حالة النجاح بناءً على الدرجة المحسوبة
    const isPassed = score >= exam.passingScore;

    // 5. أنشئ مستند النتيجة الكامل
    const result = new ExamResult({
      exam: examId,
      student: studentId,
      score,
      totalQuestions: exam.questions.length,
      answers,
      isPassed,
      detailedQuestions,
      completedAt: new Date(),
    });

    await result.save();
    res.status(201).json(result); // أعد النتيجة الكاملة للواجهة الأمامية
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ▲▲▲ نهاية الجزء المعدل ▲▲▲
router.get("/my-results", auth(["student"]), async (req, res) => {
  try {
    // req.user._id يأتي من التوكن بعد عملية تسجيل الدخول
    const results = await ExamResult.find({ student: req.user._id })
      .populate("exam", "title subject") // 👈 إضافة: لجلب اسم ومادة الامتحان
      .sort({ completedAt: -1 }); // 👈 إضافة: لترتيب النتائج من الأحدث للأقدم

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /exam-results/lock
router.post("/lock", auth(["student", "admin"]), async (req, res) => {
  const { examId, studentId } = req.body;
  try {
    const result = await ExamResult.findOneAndUpdate(
      { examId, studentId },
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
      .populate("exam", "title subject date")         // بيانات الامتحان
      .populate("student", "name stdcode grade email")   // بيانات الطالب
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