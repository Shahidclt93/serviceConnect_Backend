const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email_or_phone: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 60, // Document expires after 1 minute
  },
});

module.exports = mongoose.model('Otp', otpSchema);
