// src/BackEnd/routes/examResult.routes.js
const express = require("express");
const router = express.Router();
const ExamResult = require("../models/examResult.model");
const auth = require("../middlewares/auth");
const Exam = require("../models/exam.model");

// ▼▼▼ تسجيل نتيجة امتحان (الطالب) - النسخة الآمنة ▼▼▼
router.post("/", auth(["student"]), async (req, res) => {
  try {
    // 🔒 SECURITY FIX: تجاهل studentId من الـ body واستخدم ID الطالب من التوكن الموثوق فقط
    const studentIdFromToken = req.user._id;
    const { exam: examId, answers } = req.body;

    // ✅ التحقق أولاً باستخدام الـ ID الآمن من التوكن
    const existingResult = await ExamResult.findOne({ 
      exam: examId, 
      student: studentIdFromToken 
    });

    if (existingResult) {
      // ✅ FIX: استخدام Status Code 409 (Conflict) فهو أدق + تصحيح رسالة الخطأ
      return res.status(409).json({ 
        error: "لقد قمت بأداء هذا الامتحان مسبقاً ولا يمكنك إعادته." 
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "الامتحان غير موجود" });

    // ... (حساب الدرجة والتفاصيل كما هو)
    let score = 0;
    const detailedQuestions = exam.questions.map((q, index) => {
      const correctIndex = Number(q.correctAnswer);
      const selectedIndex = answers[index];
      const isCorrect = selectedIndex === correctIndex;
      if (isCorrect) score++;
      return {
        questionId: q._id, questionText: q.question, options: q.options,
        selectedIndex, correctIndex, isCorrect,
      };
    });
    const isPassed = score >= exam.passingScore;

    const result = new ExamResult({
      exam: examId,
      student: studentIdFromToken, // 🔒 SECURITY FIX: حفظ النتيجة باستخدام الـ ID الآمن
      score, totalQuestions: exam.questions.length, answers,
      isPassed, detailedQuestions, completedAt: new Date(),
    });

    await result.save();
    
    const populatedResult = await ExamResult.findById(result._id)
      .populate("exam", "title subject duration passingScore");
    
    res.status(201).json(populatedResult);

  } catch (err) {
    console.error("Error in exam result submission:", err);
    res.status(500).json({ error: err.message });
  }
});

// ▼▼▼ استرجاع نتائج الطالب - (الكود الأصلي كان صحيحًا) ▼▼▼
router.get("/my-results", auth(["student"]), async (req, res) => {
  try {
    const studentId = req.user._id;
    const results = await ExamResult.find({ student: studentId })
      .populate("exam", "title subject duration passingScore")
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (err) {
    console.error("Error fetching student results:", err);
    res.status(500).json({ error: err.message });
  }
});

// ▼▼▼ التحقق من حالة الامتحان للطالب - (الكود الأصلي كان صحيحًا) ▼▼▼
router.get("/check-exam-status/:examId", auth(["student"]), async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    const existingResult = await ExamResult.findOne({ 
      exam: examId, 
      student: studentId 
    }).populate("exam", "title subject");

    if (existingResult) {
      return res.json({ hasTaken: true, result: existingResult });
    }
    res.json({ hasTaken: false });
  } catch (err) {
    console.error("Error checking exam status:", err);
    res.status(500).json({ error: err.message });
  }
});

// باقي الرواتب تبقى كما هي (مع تصحيح بسيط لـ /lock)...
router.post("/lock", auth(["student", "admin"]), async (req, res) => {
  const { examId } = req.body;
  // 🔒 SECURITY FIX: استخدم ID المستخدم من التوكن
  const studentId = req.user._id; 
  try {
    const result = await ExamResult.findOneAndUpdate(
      // ✅ FIX: أسماء الحقول يجب أن تطابق الـ Schema (exam وليس examId)
      { exam: examId, student: studentId },
      { locked: true },
      { new: true, upsert: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

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

router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    await ExamResult.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف النتيجة" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;