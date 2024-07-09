const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const port = 3001;
app.use(cors());
app.use(bodyParser.json());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD,  // Your email password or app-specific password
  },
});

app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, course, message } = req.body;

  try {
    // Save referral data to the database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        course,
        message,
      },
    });

    // Send referral email
    const mailOptions = {
      from: process.env.EMAIL,
      to: refereeEmail,
      subject: 'Course Referral',
      text: `Hi ${refereeName},\n\nYou have been referred by ${referrerName} (${referrerEmail}) to the course: ${course}.\n\nMessage: ${message}\n\nBest Regards,\nAccredian Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to send email', error });
      }
      res.status(200).json({ message: 'Referral saved and email sent', referral });
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save referral', error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
