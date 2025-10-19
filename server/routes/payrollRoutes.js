const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Payslip = require('../models/Payslip');
const User = require('../models/User');
const Salary = require('../models/Salary');
const Profile = require('../models/Profile');

// @route   GET /api/payroll/:year/:month
// @desc    Generate and get payroll for a specific month
// @access  Private (Admin only)
router.get('/:year/:month', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    console.log(`\n--- STARTING PAYROLL FOR ${month}/${year} ---`);

    const employees = await User.find({ role: 'employee', isApproved: true });
    console.log(`Step 1: Found ${employees.length} approved employees to process.`);

    for (const employee of employees) {
      console.log(`\nStep 2: Processing ${employee.fullName}...`);
      const profileInfo = await Profile.findOne({ user: employee._id });

      if (profileInfo && profileInfo.dateOfJoining) {
        const joiningDate = new Date(profileInfo.dateOfJoining);
        const joiningYear = joiningDate.getFullYear();
        const joiningMonth = joiningDate.getMonth() + 1;
        if (joiningYear > year || (joiningYear === year && joiningMonth > month)) {
          console.log(`--> SKIPPED: Joining date (${joiningMonth}/${joiningYear}) is in the future.`);
          continue;
        }
      }

      const salaryInfo = await Salary.findOne({ user: employee._id });
      const baseSalary = salaryInfo ? salaryInfo.baseSalary : 0;
      let calculatedSalary = baseSalary;
      
      if (profileInfo && profileInfo.dateOfJoining) {
        const joiningDate = new Date(profileInfo.dateOfJoining);
        if (joiningDate.getFullYear() === year && joiningDate.getMonth() + 1 === month) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const joiningDay = joiningDate.getDate();
            const daysWorked = daysInMonth - joiningDay + 1;
            calculatedSalary = (daysWorked > 0 && daysInMonth > 0) ? (baseSalary / daysInMonth) * daysWorked : 0;
        }
      }
      
      const payslipExists = await Payslip.findOne({ user: employee._id, year, month });
      if (!payslipExists) {
        console.log(`--> Creating new payslip for ${employee.fullName} with Net Pay: ${calculatedSalary}`);
        const newPayslip = new Payslip({ user: employee._id, year, month, baseSalary, netPay: calculatedSalary });
        await newPayslip.save();
      } else {
        console.log(`--> Payslip already exists for ${employee.fullName}. Checking for updates...`);
        if (payslipExists.status === 'Pending' && (payslipExists.baseSalary !== baseSalary || payslipExists.netPay !== calculatedSalary)) {
          payslipExists.baseSalary = baseSalary;
          payslipExists.netPay = calculatedSalary;
          await payslipExists.save();
          console.log(`--> Updated existing pending payslip for ${employee.fullName}.`);
        }
      }
    }

    console.log('\nStep 3: Fetching final payroll list from database...');
    const payroll = await Payslip.find({ year, month }).populate('user', 'fullName');
    console.log(`Step 4: Found ${payroll.length} total payslips for ${month}/${year} to return.`);
    
    res.json(payroll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/payroll/:payslipId/pay
// @desc    Mark a payslip as paid
// @access  Private (Admin only)
router.put('/:payslipId/pay', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    try {
      const payslip = await Payslip.findByIdAndUpdate(
        req.params.payslipId,
        { status: 'Paid', paidOn: Date.now() },
        { new: true }
      ).populate('user', 'fullName');
  
      if (!payslip) {
        return res.status(404).json({ msg: 'Payslip not found' });
      }
      res.json(payslip);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;