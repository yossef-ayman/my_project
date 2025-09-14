const express = require("express");
const router = express.Router();
const Attendance = require("../models/ِAttendance.model")
const User = require("../models/user.model");
const auth = require("../middlewares/auth");

// ✅ تسجيل حضور
router.post("/mark", auth(["admin", "student"]), async (req, res) => {
  try {
    const { studentId, note } = req.body;

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // تأكد أن الطالب مش متسجل اليوم
    const already = await Attendance.findOne({
      student: studentId,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    if (already) return res.status(400).json({ message: "Already marked today" });

    const attendance = new Attendance({
      student: studentId,
      note,
      present: true
    });
    await attendance.save();

    student.attendanceCount = (student.attendanceCount || 0) + 1;
    await student.save();

    res.json({ message: "✅ Attendance marked", attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Reset يدوي (Admins فقط)
router.post("/reset", auth(["admin"]), async (req, res) => {
  try {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    await Attendance.deleteMany({
      date: { $gte: todayStart, $lt: todayEnd }
    });
    res.json({ message: "🔄 Attendance reset for today" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ تقرير حضور/غياب
router.get("/report", auth(["admin"]), async (req, res) => {
  try {
    const report = await Attendance.find().populate("student", "name stdcode grade center");
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;