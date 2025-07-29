const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const { boolean } = require('zod');

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    parentPhone: { type: String, required: true },
    grad: { type: String, required: false },
    role: { type: String, enum: ['student', 'admin'], required: true },
    stdcode: { type: String, required: false },
    place: { type: String, required: false },
  },
  {
    timestamps: false,
  }
);


userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, email: this.email }, 'your_jwt_secret', {
    expiresIn: '1h',
  });
  return token;
};

//userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
