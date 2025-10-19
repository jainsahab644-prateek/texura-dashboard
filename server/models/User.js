const Profile = require('./Profile');
const Salary = require('./Salary');
const Task = require('./Task');
const Payslip = require('./Payslip');

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
  },
  isApproved: { // <-- Add this new field
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enable virtuals to be included in JSON output
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Create a virtual property 'salary' that links to the Salary model
UserSchema.virtual('salary', {
  ref: 'Salary',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// Middleware to cascade delete all related data when a user is deleted
UserSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Deleting all data for user: ${this.fullName}`);
  await Profile.deleteOne({ user: this._id });
  await Salary.deleteOne({ user: this._id });
  await Task.deleteMany({ assignee: this._id }); // Also remove them from tasks they are assigned
  await Payslip.deleteMany({ user: this._id });
  // Add any other related models here in the future
  next();
});

module.exports = mongoose.model('User', UserSchema);