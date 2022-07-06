/* eslint-disable indent */
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const sid = process.env.TWILIO_SERVICE_ID;
const client = require('twilio')(accountSid, authToken);

module.exports.resend = async (req, res) => {
       try {
              const { phoneNumber } = req.session;
              await this.sentOtp(phoneNumber);
              res.json({ otpSent: true });
       } catch (error) {
              res.json({ otpSent: false });
       }
};

module.exports.sentOtp = (phoneNumber) =>
       new Promise((resolve, reject) => {
              client.verify
                     .services(sid)
                     .verifications.create({
                            to: `+91${phoneNumber}`,
                            channel: 'sms',
                     })
                     .then((verification) => {
                            resolve();
                     })
                     .catch((error) => {
                            const errorObject = { otpError: true };
                            if (error.code === 20429) {
                                   errorObject.message =
                                          'OTP error.Too many attempts';
                                   reject(errorObject);
                            }
                            if (error.code === 20001) {
                                   errorObject.message =
                                          'Please enter a valid phone number';
                                   reject(errorObject);
                            } else {
                                   errorObject.message =
                                          'An error occured while sending OTP';
                                   reject(errorObject);
                            }
                     });
       });

module.exports.verifyOtp = (phoneNumber, otpValue) =>
       new Promise((resolve, reject) => {
              client.verify
                     .services(sid)
                     .verificationChecks.create({
                            to: `+91${phoneNumber}`,
                            code: otpValue,
                     })
                     .then((verificationCheck) => {
                            if (verificationCheck.status === 'approved') {
                                   resolve();
                            } else reject();
                     });
       });
