import axios from '../utils/axios';

export const getCalls = async () => {
  try {
    const response = await axios.get('/calls/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching calls:', error);
    throw error;
  }
};

export const getCallById = async (callId) => {
  try {
    const response = await axios.get(`/calls/${callId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching call:', error);
    throw error;
  }
};

export const createCall = async (patientData) => {
  try {
    // First create the patient
    const patientResponse = await axios.post('/patients', patientData);
    const patientId = patientResponse.data._id;

    // Then create the call with the patient ID
    const callResponse = await axios.post('/calls', { patientId });
    return callResponse.data;
  } catch (error) {
    console.error('Error creating call:', error);
    throw error;
  }
};

export const updateCallStatus = async (callId, status) => {
  try {
    const response = await axios.put(`/calls/${callId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating call status:', error);
    throw error;
  }
};

export const endCall = async (callId, data) => {
  try {
    const response = await axios.post(`/calls/${callId}/end`, data);
    return response.data;
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};

export const joinCall = async (callId) => {
  try {
    const response = await axios.post(`/calls/${callId}/join`);
    return response.data;
  } catch (error) {
    console.error('Error joining call:', error);
    throw error;
  }
}; 