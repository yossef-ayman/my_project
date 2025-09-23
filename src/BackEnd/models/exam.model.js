// src/BackEnd/models/exam.model.js
const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  image: { type: String }
})

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  duration: Number,
  questions: [questionSchema],
  isActive: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model("Exam", examSchema)