// models/place.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placeSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    grade: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    days: [
      {
        type: String,
        enum: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], // الأيام
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", placeSchema);
