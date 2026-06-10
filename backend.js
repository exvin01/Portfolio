const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();

// Parse body
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

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST,
    port: process.env.PORT,
    secure: process.env.PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
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
            createdAt: new Date().toLocaleString('en-CA', {timeZone: 'Africa/Blantyre'}),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        // 2. Send email to yourself
        await transporter.sendMail({
            from: `"Exvin Portfolio" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'NEW MESSAGE FROM PORTFOLIO',
            html: `<!DOCTYPE html>
            <html style="background-color: #eee;">
            <body style="overflow: hidden;">
            <h3>NEW SUBMISSION FROM PORTFOLIO CONTACT PAGE</h3>
            <p><strong>Name:</strong> ${fullname}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Regards,</strong><br><strong>Exvin Chipwere</strong></p>
            </body>
             </html>`,
            replyTo: email,
        });

        // 3. Send confirmation to user
        await transporter.sendMail({
            from: `"Exvin Chipwere" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'SUBMISSION NOTIFICATION FROM EXVIN WEBSITE',
            html: `<!DOCTYPE html>
            <html style="background-color: #eee;">
            <body style="overflow: hidden;">
            <h3>Hi ${fullname},<br>THANKS FOR CONTACTING ENGINEER EXVIN</h3>
            <p>We'll be back to you soon by your email</p>
            <p>Please be patient</p>
            <p><strong>Have a good day</strong></p>
            <p><strong>Regards,</strong><br><strong>Engineer E.Chipwere</strong></p>
            </body>
            </html>`,
        });

        res.send('Submission Received ✅');
    } catch (err) {
       console.error(err); 
       res.status(500).send('Error: message saved to DB but email failed');
    }
});

// ===== CLEAN URL ROUTES =====

// Home page
app.get('/', (req, res) =>{
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Handle all clean URLs: /about/ /contact/ /services/
app.get('/:page/', (req, res, next) => {
    const page = req.params.page;
    const filePath = path.resolve(__dirname, page + '.html');
    
    console.log('Looking for file:', filePath); // Check Vercel logs if still 404
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log('File not found:', filePath);
            return next(); // let 404 handler below run
        }
        res.sendFile(filePath);
    });
});

// 404 handler - runs if file doesn't exist
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

module.exports = app;