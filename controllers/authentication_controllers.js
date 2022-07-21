/* eslint-disable indent */
const bcrypt = require('bcrypt');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');
const otpControllers = require('./otp_controllers');
const { userModel } = require('../models/user_models');
const { mergeGuestUser } = require('./product_controllers');

module.exports.adminLogin = async (req, res, next) => {
       try {
              const { username, password } = req.body;
              const adminExist = await db
                     .get()
                     .collection(collections.ADMIN_COLLECTION)
                     .findOne({ username });
              if (adminExist) {
                     const passwordExist = await bcrypt.compare(
                            password,
                            adminExist.password,
                     );
                     if (passwordExist) {
                            req.session.adminLogin = true;
                            req.session.adminName = adminExist.username;
                            res.json({ login: true });
                     } else {
                            throw { loginError: true };
                     }
              } else {
                     throw { loginError: true };
              }
       } catch (error) {
              if (error.loginError) {
                     res.json({ login: false });
              } else {
                     res.json({ error500: true });
              }
       }
};

module.exports.adminLogout = (req, res, next) => {
       try {
              req.session.adminLogin = false;
              req.session.adminName = null;
              res.redirect('/admin');
       } catch (error) {
              next(error);
       }
};

module.exports.sendSmsOtp = async (req, res) => {
       try {
              req.session.signupDetails = req.body;
              await otpControllers.sentOtp(req.body.phone_number);
       } catch {
              return { otpSent: false };
       }
};

module.exports.verifySmsOtp = async (req, res, next) => {
       try {
              console.log(req.session);
              console.log(req.body);
              const otp = req.body.otp.join('');
              const phone_number = req.session.phoneNumber;
              await otpControllers.verifyOtp(phone_number, otp);
              next();
       } catch (error) {
              console.log(error);
              res.json({ verifcationFailed: true });
       }
};

module.exports.userSignup = async (req, res) => {
       try {
              req.session.signupDetails = req.body;
              req.session.phoneNumber = req.body.phone_number;
              const { email, phone_number } = req.body;
              const signupExistError = { exist: true };

              const emailExist = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne({ email });

              if (emailExist) {
                     signupExistError.message =
                            'Already have account in this email adress';
                     throw signupExistError;
              }

              const phoneNumberExist = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne({ phone_number });

              if (phoneNumberExist) {
                     signupExistError.message =
                            'Already have account in this phone number';
                     throw signupExistError;
              }

              await otpControllers.sentOtp(phone_number);
              res.json({ otpSent: true });
       } catch (error) {
              console.log(error);
              if (error) {
                     res.json(error);
              } else {
                     res.json({ otpSendFailed: true });
              }
       }
};

module.exports.registerUser = async (req, res) => {
       try {
              const userObject = await userModel(req.session.signupDetails);
              const guestWishlist = req.session.user.wishlist;
              const guestCart = req.session.user.cart;
              const guestWishlistCount = req.session.user.wishlistCount;
              const guestCartCount = req.session.user.cartCount;

              const user = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .insertOne(userObject);
              await mergeGuestUser(guestWishlist, guestCart, user.insertedId);
              req.session.userLogin = true;
              req.session.user = {
                     _id: user.insertedId,
                     username: req.session.signupDetails.username,
                     phoneNumber: req.session.signupDetails.phone_number,
                     email: req.session.signupDetails.email,
                     cartCount: guestCartCount,
                     wishlistCount: guestWishlistCount,
              };
              req.session.signupDetails = null;
              res.json({ signupSuccess: true });
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.userLogin = async (req, res) => {
       try {
              const { usernameOrEmail, password } = req.body;
              const guestWishlist = req.session.user.wishlist;
              const guestWishlistCount = req.session.user.wishlistCount;
              const guestCartCount = req.session.user.cartCount;
              const guestCart = req.session.user.cart;

              const user = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne({
                            $or: [
                                   { username: usernameOrEmail },
                                   { email: usernameOrEmail },
                            ],
                     });
              if (user) {
                     if (user.blocked === true) {
                            throw {
                                   loginError: true,
                                   message: 'Your account has been locked',
                            };
                     }
                     const validPassword = await bcrypt.compare(
                            password,
                            user.password,
                     );
                     if (validPassword) {
                            const cart = await db
                                   .get()
                                   .collection(collections.CART_COLLECTION)
                                   .findOne({ user: user._id });
                            await mergeGuestUser(
                                   guestWishlist,
                                   guestCart,
                                   user._id,
                            );
                            req.session.userLogin = true;

                            req.session.user = {
                                   _id: user._id,
                                   guest: false,
                                   username: user.username,
                                   phoneNumber: user.phone_number,
                                   email: user.email,
                                   cartCount: cart
                                          ? cart.products.length +
                                            guestCartCount
                                          : 0,
                                   wishlistCount: user.wishlist
                                          ? user.wishlist.length +
                                            guestWishlistCount
                                          : 0,
                            };

                            res.json({ loginSuccess: true });
                     } else {
                            throw {
                                   credentialError: true,
                                   message: 'Invalid username or password',
                            };
                     }
              } else {
                     throw {
                            credentialError: true,
                            message: 'Invalid username or password',
                     };
              }
       } catch (error) {
              if (error.locked || error.credentialError) {
                     res.json({ loginError: true, message: error.message });
              } else {
                     res.json({ error500: true });
              }
       }
};

module.exports.userLoginSendOtp = async (req, res) => {
       try {
              const { phoneNumber } = req.body;
              req.session.phoneNumber = phoneNumber;
              const user = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne({ phone_number: phoneNumber });
              if (user) {
                     await otpControllers.sentOtp(phoneNumber);
                     res.json({ otpSent: true, phoneNumber });
              } else {
                     res.json({ userNotExist: true });
              }
       } catch (error) {
              if (error.otpError) {
                     res.json(error);
              } else {
                     res.json({ error500: true });
              }
       }
};

module.exports.userLoginWithOtp = async (req, res) => {
       try {
              const guestWishlist = req.session.user.wishlist;
              const guestWishlistCount = req.session.user.wishlistCount;
              const guestCartCount = req.session.user.cartCount;
              const guestCart = req.session.user.cart;
              const { phoneNumber } = req.session;

              const user = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne({ phone_number: phoneNumber });
              console.log();

              if (user.blocked === true) {
                     throw {
                            loginError: true,
                            message: 'Your account has been locked',
                     };
              }

              const cart = await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .findOne({ user: user._id });
              await mergeGuestUser(guestWishlist, guestCart, user._id);
              req.session.userLogin = true;

              req.session.user = {
                     _id: user._id,
                     guest: false,
                     username: user.username,
                     phoneNumber: user.phone_number,
                     email: user.email,
                     cartCount: cart
                            ? cart.products.length + guestCartCount
                            : 0,
                     wishlistCount: user.wishlist
                            ? user.wishlist.length + guestWishlistCount
                            : 0,
              };

              res.json({ loginSuccess: true });
       } catch (error) {
              if (error.locked || error.credentialError) {
                     res.json({ loginError: true, message: error.message });
              } else {
                     res.json({ error500: true });
              }
       }
};

module.exports.logoutUser = (req, res, next) => {
       try {
              req.session.destroy();
              res.redirect('/');
       } catch (error) {
              next(error);
       }
};
