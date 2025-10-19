const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: { // Link to the User model
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    default: '', // This will store a URL from a service like Cloudinary
  },
  phoneNumber: {
    type: String,
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
  },
  dateOfJoining: {
    type: Date,
  },
  jobTitle: { // <-- Add this line
  type: String,
  default: '',
},
  highestGraduation: {
    degree: { type: String, default: '' },
    university: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);