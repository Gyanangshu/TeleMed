const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in /me endpoint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all doctors list (auth: admin)
router.get('/doctors', auth, authorize('admin'), async (req, res) => {
  try {
    const doctorsList = await User.find({ role: "doctor" }).select('-password');
    if (doctorsList.length === 0) {
      return res.status(404).json({ message: 'No doctors found' });
    }
    res.json(doctorsList);
  } catch (err) {
    console.error('Error in /doctors endpoint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all operators list (auth: admin)
router.get('/operators', auth, authorize('admin'), async (req, res) => {
  try {
    const operatorList = await User.find({ role: 'operator' }).select('-password');
    if (operatorList.length === 0){
      return res.status(404).json({ message: 'No operators found' });
    }
    res.json(operatorList);
  } catch (error) {
    console.error('Error in /operators endpoint:', err);
    res.status(500).json({ message: 'Server error' });
  }
})

module.exports = router; 