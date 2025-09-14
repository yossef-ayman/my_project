const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  present: { type: Boolean, default: true },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);