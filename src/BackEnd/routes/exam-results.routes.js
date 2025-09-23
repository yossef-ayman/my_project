const express = require("express");
const router = express.Router();
const ExamResult = require("../models/examResult.model");
const auth = require("../middlewares/auth");

// 📌 تسجيل نتيجة امتحان (الطالب)
router.post("/", auth(["student", "admin"]), async (req, res) => {
  try {
    const { examId, studentId, score, totalQuestions, answers, completedAt } = req.body;

    const result = new ExamResult({
      exam: examId,
      student: studentId,
      score,
      totalQuestions,
      answers,
      completedAt: completedAt || new Date()
    });

    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 استرجاع نتائج طالب محدد
router.get("/student/:id", auth(["student", "admin"]), async (req, res) => {
  try {
    const results = await ExamResult.find({ student: req.params.id })
      .populate("exam", "title subject date")
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