const express = require("express");
const Award = require("../models/award.model");
const User = require("../models/user.model");
const auth = require("../middlewares/auth");
const router = express.Router();



// 📌 [GET] تكريمات طالب محدد (Admin أو الطالب نفسه)
router.get("/:studentId", auth(["admin", "student"]), async (req, res) => {
  try {
    const awards = await Award.find({ student: req.params.studentId });
    res.json(awards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 [GET] كل التكريمات (Admins فقط)
// awards.routes.js
router.get("/", auth(["admin"]), async (req, res) => {
  try {
    const awards = await Award.find()
      .populate({
        path: "student",
        select: "name stdcode grade place",
        populate: { path: "place", select: "name" } // هنا نجيب اسم السنتر
      });

    res.json(awards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📌 [POST] إضافة تكريم
router.post("/", async (req, res) => {
  try {
    const { studentId, title, description, type } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "الطالب مش موجود" });
    }

    const award = new Award({
      student: student._id,
      title,
      description,
      type
    });

    await award.save();

    // ✅ populate الطالب مع الصف والسنتر
    await award.populate("student", "name stdcode grade center");

    res.status(201).json(award);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// 📌 [PUT] تعديل تكريم (Admins فقط)
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const updated = await Award.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "التكريم غير موجود" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 [DELETE] حذف تكريم (Admins فقط)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    await Award.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف التكريم" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;