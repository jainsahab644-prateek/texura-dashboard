const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PayslipSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: Number, // e.g., 10 for October
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number, // e.g., 2025
    required: true,
  },
  baseSalary: {
    type: Number,
    required: true,
  },
  bonuses: {
    type: Number,
    default: 0,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netPay: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  paidOn: {
    type: Date,
  },
}, { timestamps: true });

// Ensure a user can only have one payslip per month/year combination
PayslipSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', PayslipSchema);