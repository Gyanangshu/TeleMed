const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Call = require('../models/Call');
const mongoose = require('mongoose');

// Export the router factory function that accepts io as a parameter
module.exports = (io) => {
  // Create a new call
  router.post('/', auth, authorize('operator'), async (req, res) => {
    try {
      const { patientId } = req.body;

      // Log request body for debugging
      console.log('Request body:', req.body);

      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required' });
      }

      const operatorId = req.body.operatorId || req.user.userId;

      // Generate call details
      const now = new Date();
      const callDetails = {
        patient: patientId,
        operator: operatorId,
        status: 'pending',
        startTime: now,
        callLink: `call-${now.getTime()}-${Math.random().toString(36).substring(2, 9)}`,
        callExpiryTime: new Date(now.getTime() + 40 * 60 * 1000) // 40 minutes from now
      };

      // Log call details before creating object
      console.log('Call details:', callDetails);

      const call = new Call(callDetails);

      // Log call object before saving
      console.log('Call object before save:', call.toObject());

      const savedCall = await call.save();
      console.log('Saved call:', savedCall.toObject());

      // Populate the call with patient and operator data before emitting
      const populatedCall = await Call.findById(savedCall._id)
        .populate('patient', 'name phoneNumber age sex height weight oxygenLevel bloodPressure temperature pulse symptoms')
        .populate('operator', 'name');

      // Emit socket event to notify doctors of new pending call
      console.log('Emitting new-pending-call event with data:', JSON.stringify(populatedCall));

      try {
        // Send to doctors room
        io.to('doctors').emit('new-pending-call', populatedCall);

        // Also broadcast globally as a fallback
        io.emit('global-pending-call-update', {
          action: 'new',
          callId: savedCall._id
        });

        console.log('Emitted new-pending-call event to doctors room');
      } catch (emitError) {
        console.error('Error emitting socket event:', emitError);
        // Continue with the response even if socket emit fails
      }

      res.status(201).json(savedCall);
    } catch (err) {
      console.error('Error creating call:', err);
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: Object.keys(err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message;
            return acc;
          }, {})
        });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all calls (for admin)
  router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
      const calls = await Call.find()
        .populate('patient', 'name phoneNumber age sex height weight oxygenLevel bloodPressure temperature pulse symptoms')
        .populate('operator', 'name')
        .populate('doctor', 'name')
        .sort({ startTime: -1 });

      // Log the first call to verify doctor data
      if (calls.length > 0) {
        console.log('Sample call data with doctor:', {
          callId: calls[0]._id,
          doctor: calls[0].doctor,
          status: calls[0].status
        });
      }

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
        .populate('patient', 'name phoneNumber age sex height weight oxygenLevel bloodPressure temperature pulse symptoms')
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
      console.log('Fetching call with ID:', id);

      // Check if ID is valid
      if (!id || id === 'undefined') {
        console.log('Invalid call ID provided');
        return res.status(400).json({ message: 'Invalid call ID' });
      }

      // Check if ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid MongoDB ObjectId format');
        return res.status(400).json({ message: 'Invalid call ID format' });
      }

      console.log('Querying database for call...');
      const call = await Call.findById(id)
        .populate('patient', 'name phoneNumber age sex height weight oxygenLevel bloodPressure temperature pulse symptoms')
        .populate('operator', 'name')
        .populate('doctor', 'name');

      if (!call) {
        console.log('Call not found in database');
        return res.status(404).json({ message: 'Call not found' });
      }

      console.log('Call found:', call);
      res.json(call);
    } catch (err) {
      console.error('Error fetching call:', err);
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

  // End call (for doctors and operators)
  router.post('/:id/end', auth, async (req, res) => {
    try {
      const { id } = req.params;

      // Log the entire request body for debugging
      console.log('End call request body:', req.body);
      console.log('User from auth middleware:', req.user);

      const { doctorAdvice, referred } = req.body;

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

      // // Check if user has permission to end this call
      // if (req.user.role === 'operator' && call.operator.toString() !== req.user.userId) {
      //   return res.status(403).json({ message: 'Not authorized to end this call' });
      // }
      console.log('Original call data before update:', call);

      // Authorization is now simpler - we're not checking roles since the auth middleware 
      // ensures the user is authenticated

      // Update call status
      call.status = 'completed';
      call.endTime = new Date();

      // Update doctor's advice if provided
      if (doctorAdvice !== undefined) {
        console.log('Updating doctor advice:', doctorAdvice);
        call.doctorAdvice = doctorAdvice;
      }

      // Update referral status if provided
      if (referred !== undefined) {
        console.log('Updating referral status:', referred, typeof referred);
        call.referred = referred;
      }

      // Set the doctor field if the user is a doctor
      if (req.user.role === 'doctor') {
        console.log('Setting doctor field:', req.user.userId);
        call.doctor = req.user.userId;
      }

      console.log('Call data after updates, before saving:', call);

      try {
        // Save with explicit error handling
        const savedCall = await call.save();
        console.log('Call updated successfully:', savedCall);
        res.json(savedCall);
      } catch (saveError) {
        console.error('Error saving call:', saveError);
        return res.status(500).json({ message: 'Error saving call data', error: saveError.message });
      }
    } catch (err) {
      console.error('Error ending call:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });


  // Get all calls created by a particular operator 
  router.post('/created', auth, authorize('operator'), async (req, res) => {
    const { userId } = req.body;
    try {
      const retrieveCalls = await Call.find({
        operator: userId,
        status: "completed"
      });

      return res.status(200).json({ calls: retrieveCalls });
    } catch (error) {
      console.error('Error retrieving calls data for operator:', error);
      return res.status(500).json({ message: 'Error retrieving calls data for operator', error: error.message });
    }
  })

  return router;
}; 