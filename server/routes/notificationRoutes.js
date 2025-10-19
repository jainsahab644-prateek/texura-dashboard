const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get all unread notifications for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id, isRead: false })
                                                .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/notifications/read
// @desc    Mark all of a user's notifications as read
// @access  Private
router.post('/read', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.json({ msg: 'Notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;