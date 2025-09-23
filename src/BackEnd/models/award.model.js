const mongoose = require("mongoose")

const awardSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["تفوق", "حضور", "سلوك", "مشاركة"], default: "تفوق" }
}, { timestamps: true })

module.exports = mongoose.model("Award", awardSchema)