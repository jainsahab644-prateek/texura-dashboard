const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Request = require('../models/Request');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @route   POST /api/requests
// @desc    Create a new request
// @access  Private (Employees)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { requestType, details, task } = req.body;
    const newRequest = new Request({
      requester: req.user.id,
      requestType,
      details,
      task,
    });
    const request = await newRequest.save();
    res.status(201).json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/requests
// @desc    Get all requests
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  try {
    const requests = await Request.find().populate('requester', 'fullName').sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... (keep existing POST and GET routes above this)
// @route   PUT /api/requests/:id/status
// @desc    Update a request's status
// @access  Private (Admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    try {
        const { status } = req.body;

        let request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status update' });
        }

        request.status = status;
        await request.save();

        // --- EMAIL NOTIFICATION LOGIC ---
        try {
            const requester = await User.findById(request.requester);
            if (requester) {
                await sendEmail({
                    to: requester.email,
                    subject: `Your Support Request has been ${request.status}`,
                    text: `Hello ${requester.fullName},\n\nYour support request ("${request.details.substring(0, 50)}...") has been marked as ${request.status}.\n\nPlease log in to the dashboard for more details.\n\nThank you,\nTeXura Management`
                });
                console.log(`Email sent to ${requester.email} for request status update.`);
            }
        } catch (emailError) {
            console.error('Failed to send request status email:', emailError);
        }
        // --- END OF LOGIC ---

        request = await request.populate('requester', 'fullName');
        res.json(request);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;