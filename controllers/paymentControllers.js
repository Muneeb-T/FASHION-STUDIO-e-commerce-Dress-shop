/* eslint-disable indent */
require('dotenv').config();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new Razorpay({
       key_id: process.env.RAZORPAY_KEY_ID,
       key_secret: process.env.RAZORPAY_SECRET_KEY,
});

module.exports.generateRazorpay = async (orderId, amount) => {
       const options = {
              amount: amount * 100, // amount in the smallest currency unit
              currency: 'INR',
              receipt: `fst${orderId}`.toUpperCase(),
       };

       let razorpayOrder;
       await instance.orders.create(options, (err, order) => {
              razorpayOrder = order;
       });
       return razorpayOrder;
};

module.exports.verifyPayment = async (paymentDetails) => {
       const expectedSignature = crypto
              .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
              .update(
                     `${paymentDetails['payment[razorpay_order_id]']}|${paymentDetails['payment[razorpay_payment_id]']}`,
              )
              .digest('hex');

       if (
              expectedSignature ===
              paymentDetails['payment[razorpay_signature]']
       ) {
              return true;
       }
       return false;
};
