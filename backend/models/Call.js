const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  consultationCompleted: {
    type: Boolean,
    default: false
  },
  referred: {
    type: Boolean,
    default: false
  },
  doctorAdvice: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  callLink: {
    type: String,
    required: true
  },
  callExpiryTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for querying active calls
callSchema.index({ status: 1, callExpiryTime: 1 });

module.exports = mongoose.model('Call', callSchema); 