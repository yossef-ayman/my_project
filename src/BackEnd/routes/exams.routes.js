// src/BackEnd/routes/exams.routes.js
const express = require("express");
const Exam = require("../models/exam.model");
const auth = require("../middlewares/auth");
const router = express.Router();

// 📌 Get all exams (Admins only)
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get active exams (Students + Admins) - hide correctAnswer
router.get("/active", auth(["student", "admin"]), async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true }).select("-questions.correctAnswer");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Add new exam
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Update exam (toggle status or edit info)
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    if (req.body.toggleStatus) {
      exam.isActive = !exam.isActive;
    } else {
      exam.set(req.body);
    }

    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Delete exam
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Add question to exam
router.post("/:id/questions", auth(["admin"]), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    exam.questions.push(req.body);
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Update question
router.put("/:id/questions/:qid", auth(["admin"]), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const q = exam.questions.id(req.params.qid);
    if (!q) return res.status(404).json({ error: "Question not found" });

    q.set(req.body);
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Public exams (اختياري - لو عايز تعرضها من غير تسجيل دخول)
router.get("/public", async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true }).select("-questions.correctAnswer");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete question
router.delete("/:id/questions/:qid", auth(["admin"]), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    exam.questions = exam.questions.filter(q => q._id.toString() !== req.params.qid);
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
