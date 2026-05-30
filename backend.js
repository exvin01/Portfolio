const express = require('express');
const path = require('path');
const app = express();
// link all the static files
app.use(express.static(__dirname));
//parse  data files 
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//routing
const nodemailer = require('nodemailer');
const transporter = nodemailer.creatTransport({
    host: process.env.HOST,
    port: process.env.PORT,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})
//getting inputs fron frontend(contact page)
app.post('/contact', async (req, res) => {
    try {
        const {fullname, email, message} = req.body;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'NEW MESSAGE FROM PORTFOLIO',
            html: `
            <h1>NEW SUBMISSION FROM PORTFOLIO CONTACT PAGE</h1>
            <P><strong>Name:</strong> ${fullname}</strong></P>
             <P><strong>Email:</strong> ${email}</strong></P>
              <P><strong>Message:</strong> ${message}</P>
               <P><strong>Regard</strong></P>
                <P><strong>Exvin Chipwere</strong></P>
            `,
            replyto: email,
        })
        //send noticication to email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SUBMISSION NOTIFICATION FROM EXVIN WEBSITE',
            html: `
            <h1>HI, ${fullname} <br>THANKS FOR CONTACTING ENGINEER EXVIN</h1>
            <P>We'll be back to you soon by your email</P>
             <P>Please be patient</P>
              <P><strong>Have a good day</strong> </P>
               <P><strong>Regard</strong></P>
                <P><strong>Engineer E.Chipwere</strong></P>
            `,
        });
        res.send('Submission Received')
    } catch (err) {
       console.error (err); 
         res.status(500).send('Error sending email');

    }
});

//route the home first
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'index.html'));
});
// route contact page incase
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'contact.html'));
});

module.exports = app;
