import jsPDF from 'jspdf';

export const generateConsultationReport = (call, patient) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Title
  doc.setFontSize(20);
  doc.text('CONSULTATION REPORT', pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${new Date(call.createdAt).toLocaleString()}`, margin, yPos);
  yPos += 15;

  // Patient Information
  doc.setFontSize(16);
  doc.text('PATIENT INFORMATION', margin, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Name: ${patient.name}`, margin, yPos);
  yPos += 7;
  doc.text(`Age: ${patient.age}`, margin, yPos);
  yPos += 7;
  doc.text(`Sex: ${patient.sex}`, margin, yPos);
  yPos += 7;
  doc.text(`Phone: ${patient.phoneNumber}`, margin, yPos);
  yPos += 15;

  // Vital Signs
  doc.setFontSize(16);
  doc.text('VITAL SIGNS', margin, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Height: ${patient.height} cm`, margin, yPos);
  yPos += 7;
  doc.text(`Weight: ${patient.weight} kg`, margin, yPos);
  yPos += 7;
  doc.text(`SpO2: ${patient.oxygenLevel}%`, margin, yPos);
  yPos += 7;
  doc.text(`Temperature: ${patient.temperature}°C`, margin, yPos);
  yPos += 7;
  doc.text(`Pulse: ${patient.pulse} BPM`, margin, yPos);
  yPos += 7;
  doc.text(`Blood Pressure: ${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic}`, margin, yPos);
  yPos += 15;

  // Symptoms
  doc.setFontSize(16);
  doc.text('SYMPTOMS', margin, yPos);
  yPos += 10;
  doc.setFontSize(12);
  const splitSymptoms = doc.splitTextToSize(patient.symptoms, pageWidth - 2 * margin);
  doc.text(splitSymptoms, margin, yPos);
  yPos += (splitSymptoms.length * 7) + 15;

  // Consultation Details
  doc.setFontSize(16);
  doc.text('CALL DETAILS', margin, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Status: ${call.status}`, margin, yPos);
  yPos += 7;
  doc.text(`Start Time: ${call.startTime ? new Date(call.startTime).toLocaleString() : 'Not started'}`, margin, yPos);
  yPos += 7;
  doc.text(`End Time: ${call.endTime ? new Date(call.endTime).toLocaleString() : 'Not ended'}`, margin, yPos);
  yPos += 15;

  doc.setFontSize(16);
  doc.text('DOCTOR NAME', margin, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Dr. ${call?.doctor?.name}`, margin, yPos);
  yPos += 15;

  // Doctor's Notes
  if (call.doctorAdvice) {
    doc.setFontSize(16);
    doc.text("DOCTOR'S NOTES", margin, yPos);
    yPos += 10;
    doc.setFontSize(12);
    const splitNotes = doc.splitTextToSize(call.doctorAdvice, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, yPos);
    yPos += (splitNotes.length * 7) + 15;
  }

  // Consultation Outcome
  if (call.consultationCompleted !== undefined) {
    doc.setFontSize(16);
    doc.text('CONSULTATION OUTCOME', margin, yPos);
    yPos += 10;
    doc.setFontSize(12);
    // doc.text(`Consultation Completed: ${call.consultationCompleted ? 'Yes' : 'No'}`, margin, yPos);
    yPos += 1;
    doc.text(`Referred: ${call.referred ? 'Yes' : 'No'}`, margin, yPos);
  }

  return doc;
}; 