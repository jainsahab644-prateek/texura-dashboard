const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    user = new User({
      fullName,
      email,
      password,
      role,
      isApproved: role === 'admin' ? true : false,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({
      msg: role === 'employee' 
        ? 'Registration successful! Your account is awaiting admin approval.'
        : 'Admin account created successfully!',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    if (!user.isApproved) {
      return res.status(403).json({ msg: 'Your account is pending admin approval.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users
// @desc    Get all users (for admin)
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  try {
    const users = await User.find().select('-password').populate('salary');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/pending
// @desc    Get all unapproved users
// @access  Private (Admin only)
router.get('/pending', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    try {
      const pendingUsers = await User.find({ isApproved: false, role: 'employee' }).select('-password');
      res.json(pendingUsers);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route   GET /api/users/me
// @desc    Get logged in user's data
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/me
// @desc    Update current user's profile info (e.g., name)
// @access  Private
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { fullName } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { fullName }, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/update-password
// @desc    Update current user's password
// @access  Private
router.put('/update-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { return res.status(400).json({ msg: 'Incorrect current password' }); }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve a user registration
// @access  Private (Admin only)
router.put('/:id/approve', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).select('-password');
      if (!user) { return res.status(404).json({ msg: 'User not found' }); }
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update a user's role
// @access  Private (Admin only)
router.put('/:id/role', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) { return res.status(404).json({ msg: 'User not found' }); }
    user.role = req.body.role;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) { return res.status(404).json({ msg: 'User not found' }); }
    if (user.id === req.user.id) { return res.status(400).json({ msg: 'You cannot delete your own account.' }); }
    await user.deleteOne();
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;