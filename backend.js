const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const app = express();

// Static files + parse body
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri = process.env.MONGODB_URI;
let client;
let db;

async function connectDB() {
  if (!db) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('portfolio'); // collection will be inside this DB
    console.log('Connected to MongoDB');
  }
  return db;
}

// Nodemailer transporter - fixed typo: createTransport
const transporter = nodemailer.createTransport({
    service: 'gmail', // use 'gmail' if HOST/PORT not set
    host: process.env.HOST,
    port: process.env.PORT,
    secure: process.env.PORT == 465, // true for 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
    }
});

// POST /contact - save to DB then send emails
app.post('/contact', async (req, res) => {
    try {
        const { fullname, email, message } = req.body;
        
        if (!fullname || !email || !message) {
            return res.status(400).send('All fields required');
        }

        // 1. Save to MongoDB Atlas first
        const database = await connectDB();
        await database.collection('contacts').insertOne({
            fullname,
            email,
            message,
            createdAt: new Date(),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        // 2. Send email to yourself
        await transporter.sendMail({
            from: `"Exvin Portfolio" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // your email
            subject: 'NEW MESSAGE FROM PORTFOLIO',
            html: `
            <h1>NEW SUBMISSION FROM PORTFOLIO CONTACT PAGE</h1>
            <p><strong>Name:</strong> ${fullname}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Regards,</strong></p>
            <p><strong>Exvin Chipwere</strong></p>
            `,
            replyTo: email, // fixed: replyTo not replyto
        });

        // 3. Send confirmation to user
        await transporter.sendMail({
            from: `"Exvin Chipwere" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'SUBMISSION NOTIFICATION FROM EXVIN WEBSITE',
            html: `
            <h1>Hi ${fullname},<br>THANKS FOR CONTACTING ENGINEER EXVIN</h1>
            <p>We'll be back to you soon by your email</p>
            <p>Please be patient</p>
            <p><strong>Have a good day</strong></p>
            <p><strong>Regards,</strong></p>
            <p><strong>Engineer E.Chipwere</strong></p>
            `,
        });

        res.send('Submission Received ✅');
    } catch (err) {
       console.error(err); 
       res.status(500).send('Error: message saved to DB but email failed');
    }
});

// Routes - fixed duplicate '/'
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact.html', (req, res) =>{
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// For Vercel serverless
module.exports = app;

// For local testing: uncomment below
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on ${PORT}`));