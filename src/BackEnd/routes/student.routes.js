const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");

// 🔹 Get all students
router.get("/", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get single student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Add student
router.post("/", async (req, res) => {
  try {
    const { name, email, stdcode, phone, parentPhone, grade, place, password } = req.body;

    if (await User.findOne({ stdcode })) return res.status(400).json({ message: "stdcode exists" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "email exists" });

    const hashed = password ? await bcrypt.hash(password, 10) : undefined;

    const newStudent = new User({
      name,
      email,
      stdcode,
      phone,
      parentPhone,
      grade,
      place,
      attendanceCount: 0,
      role: "student",
      password: hashed,
    });

    await newStudent.save();
    const out = newStudent.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update student
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Delete student
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
