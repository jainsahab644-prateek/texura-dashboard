const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Salary = require('../models/Salary');
const User = require('../models/User');

// @route   POST /api/salary/:userId
// @desc    Set or update a user's salary
// @access  Private (Admin only)
router.post('/:userId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }

  try {
    const { baseSalary } = req.body;
    const { userId } = req.params;

    // Verify the user is a valid employee
    const employee = await User.findById(userId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const salary = await Salary.findOneAndUpdate(
      { user: userId }, // find a document with this filter
      { baseSalary, user: userId, updatedAt: Date.now() }, // document to insert when `upsert: true`
      { new: true, upsert: true, setDefaultsOnInsert: true } // options
    );

    res.json(salary);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Employee not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;