const mongoose = require("mongoose");

// مخطط لتفاصيل كل سؤال ضمن النتيجة
const detailedQuestionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam.questions" },
  questionText: String,
  options: [String],
  selectedIndex: Number, // اختيار الطالب (قد يكون null)
  correctIndex: Number,  // الإجابة الصحيحة
  isCorrect: Boolean
}, { _id: false }); // لا نحتاج _id لكل سؤال تفصيلي

const examResultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [{ type: Number }], // index of chosen answers

  // ✅ الحقول الجديدة والمهمة
  isPassed: { type: Boolean, required: true },
  detailedQuestions: [detailedQuestionSchema], // مصفوفة لتفاصيل المراجعة

  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ExamResult", examResultSchema);