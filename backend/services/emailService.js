const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'P2P Tutoring <noreply@p2ptutoring.com>',
      to,
      subject,
      html,
    });
    console.log(`✉️  Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email error:', error.message);
    // Don't throw error - just log it and continue
    return false;
  }
};

const sendBookingConfirmation = async (studentEmail, tutorEmail, slotDetails) => {
  const subject = 'Booking Confirmation - P2P Tutoring';
  const studentHtml = `
    <h2>Booking Confirmed!</h2>
    <p>Your tutoring session has been booked:</p>
    <ul>
      <li><strong>Subject:</strong> ${slotDetails.subject}</li>
      <li><strong>Date & Time:</strong> ${new Date(slotDetails.start_time).toLocaleString()}</li>
      <li><strong>Duration:</strong> ${Math.round((new Date(slotDetails.end_time) - new Date(slotDetails.start_time)) / 60000)} minutes</li>
    </ul>
  `;
  
  const tutorHtml = `
    <h2>New Booking!</h2>
    <p>A student has booked your tutoring session:</p>
    <ul>
      <li><strong>Subject:</strong> ${slotDetails.subject}</li>
      <li><strong>Date & Time:</strong> ${new Date(slotDetails.start_time).toLocaleString()}</li>
    </ul>
  `;

  await sendEmail(studentEmail, subject, studentHtml);
  await sendEmail(tutorEmail, subject, tutorHtml);
};

const sendCancellationNotification = async (email, slotDetails, isTutor = false) => {
  const subject = 'Session Cancelled - P2P Tutoring';
  const html = `
    <h2>Session Cancelled</h2>
    <p>${isTutor ? 'You have cancelled' : 'Your session has been cancelled'}:</p>
    <ul>
      <li><strong>Subject:</strong> ${slotDetails.subject}</li>
      <li><strong>Date & Time:</strong> ${new Date(slotDetails.start_time).toLocaleString()}</li>
    </ul>
  `;
  
  await sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendCancellationNotification,
};