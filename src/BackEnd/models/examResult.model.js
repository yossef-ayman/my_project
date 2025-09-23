const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [{ type: Number }], // index of chosen answers
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ExamResult", examResultSchema);