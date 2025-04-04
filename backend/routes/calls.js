const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Call = require('../models/Call');
const mongoose = require('mongoose');

// Create a new call
router.post('/', auth, authorize('operator'), async (req, res) => {
  try {
    const { patientId } = req.body;
    const operatorId = req.body.operatorId || req.user.userId; // Use authenticated user's ID if operatorId is not provided
    
    // Generate a unique call link (you can use a more sophisticated method)
    const callLink = `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Set call expiry time to 40 minutes from now
    const callExpiryTime = new Date(Date.now() + 40 * 60 * 1000);

    const call = new Call({
      patient: patientId,
      operator: operatorId,
      status: 'pending',
      startTime: new Date(),
      callLink,
      callExpiryTime
    });

    await call.save();

    res.status(201).json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all calls (for admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const calls = await Call.find()
      .populate('patient', 'name phoneNumber age sex')
      .populate('operator', 'name')
      .populate('doctor', 'name')
      .sort({ startTime: -1 });

    res.json(calls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending calls (for doctors)
router.get('/pending', auth, authorize('doctor'), async (req, res) => {
  try {
    const calls = await Call.find({ status: 'pending' })
      .populate('patient', 'name phoneNumber age sex symptoms')
      .populate('operator', 'name')
      .sort({ startTime: 1 });

    res.json(calls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get call by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid call ID' });
    }
    
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid call ID format' });
    }
    
    const call = await Call.findById(id)
      .populate('patient', 'name phoneNumber age sex symptoms')
      .populate('operator', 'name')
      .populate('doctor', 'name');

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update call status
router.patch('/:id/status', auth, authorize('doctor'), async (req, res) => {
  try {
    const { status, doctorAdvice, referral } = req.body;

    const call = await Call.findById(req.params.id);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (call.status === 'completed') {
      return res.status(400).json({ message: 'Call is already completed' });
    }

    call.status = status;
    if (doctorAdvice) call.doctorAdvice = doctorAdvice;
    if (referral) call.referral = referral;
    if (status === 'completed') call.endTime = new Date();

    await call.save();

    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join call (for doctors)
router.post('/:id/join', auth, authorize('doctor'), async (req, res) => {
  try {
    const call = await Call.findById(req.params.id);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (call.status !== 'pending') {
      return res.status(400).json({ message: 'Call is not pending' });
    }

    call.doctor = req.user.userId;
    call.status = 'ongoing';
    await call.save();

    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// End call (for doctors)
router.post('/:id/end', auth, authorize('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid call ID' });
    }
    
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid call ID format' });
    }
    
    const call = await Call.findById(id);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (call.status === 'completed') {
      return res.status(400).json({ message: 'Call is already completed' });
    }

    call.status = 'completed';
    call.endTime = new Date();
    await call.save();

    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 