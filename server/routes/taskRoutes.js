const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @route   POST /api/tasks
// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }

  try {
    const { title, description, priority, assignee, dueDate } = req.body;

    const taskData = { title, description, priority, createdBy: req.user.id };
    if (assignee) taskData.assignee = assignee;
    if (dueDate) taskData.dueDate = dueDate;

    const newTask = new Task(taskData);
    const task = await newTask.save();

    // --- NOTIFICATION & EMAIL LOGIC ---
    if (task.assignee) {
      // 1. Create in-app notification
      const notification = new Notification({
        user: task.assignee,
        message: `You have been assigned a new task: "${task.title}"`,
        link: '/dashboard'
      });
      await notification.save();

      // 2. Send email notification
      const assignedUser = await User.findById(task.assignee);
      if (assignedUser) {
        try {
          await sendEmail({
            to: assignedUser.email,
            subject: 'New Task Assignment - TeXura Dashboard',
            text: `Hello ${assignedUser.fullName},\n\nYou have been assigned a new task: "${task.title}".\nPlease log in to the dashboard to view the details.\n\nThank you,\nTeXura Management`
          });
          console.log('Email sent for new task assignment.');
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }
    }
    // --- END OF LOGIC ---

    const populatedTask = await Task.findById(task._id).populate('assignee', 'fullName');
    res.status(201).json(populatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks (for admin)
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    try {
        const tasks = await Task.find()
            .populate('assignee', 'fullName')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/tasks/mytasks
// @desc    Get tasks assigned to the logged-in user
// @access  Private
router.get('/mytasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ assignee: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update the status of a task
// @access  Private
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        if (task.assignee.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        task.status = status;
        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (Edit)
// @access  Private (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // Create a notification if the task is assigned
        if (task.assignee) {
          const notification = new Notification({
            user: task.assignee,
            message: `A task assigned to you has been updated: "${task.title}"`,
            link: '/dashboard'
          });
          await notification.save();
        }

        const populatedTask = await task.populate('assignee', 'fullName');
        res.json(populatedTask);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        await task.deleteOne();
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;