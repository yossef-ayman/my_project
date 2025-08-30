const mongoose = require("mongoose")

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    imageUrl: { type: String },
  },
  { timestamps: true }
)

module.exports = mongoose.model("News", newsSchema)
