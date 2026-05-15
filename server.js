const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(__dirname));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,
  }
});

app.post('/submit', async (req, res) => {
  try {
    const { fullname, email, description } = req.body;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New submission From Portfolio',
      text: `Name: ${fullname}\nEmail: ${email}\nDescription from the portfolio: ${description}`
    });
    res.send('Submission received!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending email');
  }
});

//connecting with the frontend


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
