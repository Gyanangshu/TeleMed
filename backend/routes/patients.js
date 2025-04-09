const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Patient = require('../models/Patient');

// Create a new patient
router.post('/', auth, authorize('operator'), async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      age,
      sex,
      height,
      weight,
      oxygenLevel,
      temperature,
      pulse,
      bloodPressure,
      symptoms,
    } = req.body;

    const patient = new Patient({
      name,
      phoneNumber,
      age,
      sex,
      height,
      weight,
      oxygenLevel,
      temperature,
      pulse,
      bloodPressure,
      symptoms,
    });

    await patient.save();

    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patients by phone number
router.get('/phone/:phoneNumber', auth, async (req, res) => {
  try {
    const patients = await Patient.find({ phoneNumber: req.params.phoneNumber })
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 