const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');
const Profile = require('../models/Profile');

// @route   GET /api/profile/me
// @desc    Get current user's profile (or create one if it doesn't exist)
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['fullName', 'email']);

    if (!profile) {
      // If no profile, create a blank one for this user
      profile = new Profile({ user: req.user.id });
      await profile.save();
      // Re-fetch the profile with user data populated
      profile = await Profile.findOne({ user: req.user.id }).populate('user', ['fullName', 'email']);
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/profile
// @desc    Create or update a user's profile
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { phoneNumber, address, highestGraduation } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (phoneNumber) profileFields.phoneNumber = phoneNumber;
    if (address) profileFields.address = address;
    if (highestGraduation) profileFields.highestGraduation = highestGraduation;

    try {
        let profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true }
        ).populate('user', ['fullName', 'email']);

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/profile/me/picture
// @desc    Upload a profile picture
// @access  Private
router.post('/me/picture', [authMiddleware, upload.single('profilePicture')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }
        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { profilePicture: req.file.path }, // req.file.path contains the URL from Cloudinary
            { new: true, upsert: true }
        ).populate('user', ['fullName', 'email']);
        
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/profile/:userId
// @desc    Admin updates a user's profile
// @access  Private (Admin only)
router.put('/:userId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  try {
    const { jobTitle, dateOfJoining } = req.body;
    const profile = await Profile.findOneAndUpdate(
        { user: req.params.userId },
        { $set: { jobTitle, dateOfJoining } },
        { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/profile/user/:userId
// @desc    Admin gets a specific user's profile by user ID
// @access  Private (Admin only)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['fullName', 'email']);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;