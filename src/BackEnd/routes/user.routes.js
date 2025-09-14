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
    if (!user) return res.status(401).json({ message: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;