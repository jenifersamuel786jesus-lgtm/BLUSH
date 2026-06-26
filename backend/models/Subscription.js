const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  { timestamps: true }
);

subscriptionSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

