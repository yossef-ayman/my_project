const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    parentPhone: { type: String, required: true },
    grade: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], required: true },
    stdcode: { type: String, required: false, unique: true },
    place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: false }, // <-- هنا
    present: { type: Boolean, default: false },
    presentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, email: this.email }, 'your_jwt_secret', {
    expiresIn: '1h',
  });
  return token;
};

module.exports = mongoose.model('User', userSchema);
