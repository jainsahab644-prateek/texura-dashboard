const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SalarySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user can only have one salary document
  },
  baseSalary: {
    type: Number,
    required: true,
    default: 0,
  },
  // We can add more complex fields later like bonuses or payment history
  effectiveDate: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Middleware to update the 'updatedAt' field on save
SalarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Salary', SalarySchema);