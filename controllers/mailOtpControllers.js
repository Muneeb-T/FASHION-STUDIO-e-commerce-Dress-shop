/* eslint-disable indent */
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
       service: 'hotmail',
       auth: {
              user: process.env.NODEMAILER_EMAIL,
              pass: process.env.NODEMAILER_PASSWORD,
       },
});

module.exports.sendEmail = (email, otp) => new Promise((resolve, reject) => {
              const mailOptions = {
                     from: 'muneebmnb17@outlook.com',
                     to: email,
                     subject: 'OTP verification - Fashion studio',
                     text: `OTP for updating email adress is ${otp}`,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                     if (error) {
                            reject({ emailSendError: true });
                     }
                     resolve();
              });
       });
