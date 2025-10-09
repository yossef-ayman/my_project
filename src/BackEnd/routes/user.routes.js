const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔹 Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, parentPhone, role, grade, place, stdcode } = req.body;

    if (await User.findOne({ email })) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, phone, parentPhone, role, grade, place, stdcode });
    await newUser.save();

    res.status(201).json({ message: "User created", id: newUser._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    // ✅ التصحيح: استخدم "_id" وأضف "name" للحمولة
    const payload = {
        _id: user._id,
        name: user.name,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // إرجاع بيانات المستخدم بدون كلمة المرور
    const userToReturn = { ...user.toObject() };
    delete userToReturn.password;

    res.json({ token, user: userToReturn });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;