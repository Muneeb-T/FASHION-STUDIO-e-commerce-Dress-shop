/* eslint-disable indent */
const express = require('express');
const userControllers = require('../controllers/user_controllers');
const authenticationControllers = require('../controllers/authentication_controllers');
const otpControllers = require('../controllers/otp_controllers');
const productControllers = require('../controllers/product_controllers');
const { verifyPayment } = require('../controllers/paymentControllers');

const router = express.Router();

/* GET users listing. */
router.get('/', userControllers.homepage);

router.post('/login', authenticationControllers.userLogin);

router.post('/signup', authenticationControllers.userSignup);

router.post(
       '/verifySmsOtp',
       authenticationControllers.verifySmsOtp,
       authenticationControllers.registerUser,
);

router.get('/logout', authenticationControllers.logoutUser);

router.get('/products/:type', userControllers.viewProducts);

router.get('/product-view:id', userControllers.quickView);

router.post('/addToWishlist', productControllers.addToWishlist);

router.get('/wishlist', userControllers.wishlist);

router.post('/addToBag', productControllers.addToBag);

router.get('/cart', userControllers.viewBag);

router.get('/login', (req, res) => {
       res.render('users/login', { layout: 'users_layout', user: true });
});

router.get('/profile', (req, res) => {
       // eslint-disable-next-line indent
       res.render('users/profile', { layout: 'users_layout', user: true });
});

router.post('/resendOtp', otpControllers.resend);

router.post('/updateCart', productControllers.updateCart);

router.get('/checkout', userControllers.checkout);

router.post('/placeOrder', userControllers.placeOrder);

router.post('/verifyRazorpayPayment', userControllers.verifyOrderPayment);

router.get('/orderSuccess', (req, res) => {
       res.render('users/orderSuccess', {
              layout: 'users_layout',
              user: true,
       });
});

router.post('/applyCoupon', userControllers.applyCoupon)

module.exports = router;
