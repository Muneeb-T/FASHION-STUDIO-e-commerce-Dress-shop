/* eslint-disable indent */
const express = require('express');
const multer = require('multer');
const userControllers = require('../controllers/user_controllers');
const authenticationControllers = require('../controllers/authentication_controllers');
const otpControllers = require('../controllers/otp_controllers');
const productControllers = require('../controllers/product_controllers');
const orderControllers = require('../controllers/orderControllers');
const middlewares = require('../controllers/middlewares');
const reviewControllers = require('../controllers/reviewControllers');

const { storage } = middlewares;
const upload = multer({ storage });

const router = express.Router();

/* GET users listing. */
router.get('/', userControllers.homepage);

router.post('/login', authenticationControllers.userLogin);

router.post('/signup', authenticationControllers.userSignup);

router.post('/sendLoginOtp', authenticationControllers.userLoginSendOtp);

router.post(
       '/verifyOtpAndLogin',
       authenticationControllers.verifySmsOtp,
       authenticationControllers.userLoginWithOtp,
);

router.post(
       '/verifyOtpAndSignup',
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

router.get(
       '/profile',
       middlewares.verfiyUserLogin,
       userControllers.userProfile,
);

router.get('/address', middlewares.verfiyUserLogin, userControllers.address);

router.get(
       '/addAddress',
       middlewares.verfiyUserLogin,
       userControllers.addAddress,
);

router.post('/resendOtp', otpControllers.resend);

router.post('/updateCart', productControllers.updateCart);

router.get('/checkout', middlewares.verfiyUserLogin, userControllers.checkout);

router.post('/placeOrder', userControllers.placeOrder);

router.post('/verifyRazorpayPayment', userControllers.verifyOrderPayment);

router.get('/orderSuccess/:id', middlewares.verfiyUserLogin, (req, res) => {
       res.render('users/orderSuccess', {
              layout: 'users_layout',
              orderId: req.params.id,
              user: true,
       });
});

router.get('/orders', middlewares.verfiyUserLogin, userControllers.orders);

router.post('/applyCoupon', userControllers.applyCoupon);

router.post('/cancelOrder', orderControllers.cancelOrder);

router.post(
       '/updateProfile',
       upload.single('profile_pic'),
       userControllers.updateProfile,
);

router.post(
       '/verifyOtpAndUpdateUsername',
       authenticationControllers.verifySmsOtp,
       userControllers.updateUsername,
);

router.post(
       '/verifyOtpAndUpdatePassword',
       authenticationControllers.verifySmsOtp,
       userControllers.updatePassword,
);

router.post('/verifyOtpAndUpdateEmail', userControllers.updateEmail);

router.post('/addNewAddress', userControllers.addNewAdress);

router.get(
       '/deleteAddress/:id',
       middlewares.verfiyUserLogin,
       userControllers.deleteAddress,
);

router.post('/saveAddress', userControllers.saveAddress);

router.get(
       '/order/:id',
       middlewares.verfiyUserLogin,
       userControllers.orderDetails,
);

router.get(
       '/invoice/:id',
       middlewares.verfiyUserLogin,
       userControllers.invoice,
);

router.get(
       '/editAddress/:id',
       middlewares.verfiyUserLogin,
       userControllers.editAddress,
);

router.post(
       '/updateAddress/:id',
       middlewares.verfiyUserLogin,
       userControllers.addressEdit,
);

router.post(
       '/reviewProduct',
       middlewares.verfiyUserLogin,
       reviewControllers.saveReview,
);

router.get('/error500', (req, res) => {
       res.render('error/error500', { layout: 'error_layout', status: '500' });
});

module.exports = router;
