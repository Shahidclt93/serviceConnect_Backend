const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email_or_phone: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'franchisee', 'serviceprovider'],
    default: 'user',   // Default role
  }
});




module.exports = model("User", userSchema);
