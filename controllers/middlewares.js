/* eslint-disable indent */
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');

module.exports.verfiyAdminLogin = (req, res, next) => {
       try {
              if (req.session.adminLogin) {
                     next();
              } else {
                     res.redirect('/admin');
              }
       } catch (error) {
              next(error);
       }
};

module.exports.storage = multer.diskStorage({
       destination(req, file, cb) {
              cb(null, './public/admin/product-images');
       },

       filename(req, file, cb) {
              if (req.fileUpdate) cb(null, `${req.fileUpdate.updateFileName}`);
              else {
                     const uniqueSuffix = `${Date.now()}-${Math.round(
                            Math.random() * 1e9,
                     )}`;
                     cb(
                            null,
                            `${uniqueSuffix}${path.extname(file.originalname)}`,
                     );
              }
       },
});

module.exports.registerGuestUser = async (req, res, next) => {
       try {
              if (!req.session.user) {
                     const guestId = new ObjectId();
                     const userObject = {
                            _id: guestId,
                            guest: true,
                            username: `Guest-${guestId}`,
                            cartCount: 0,
                            wishlistCount: 0,
                            wishlist: [],
                            cart: {
                                   products: [],
                            },
                     };

                     req.session.guest = true;
                     req.session.user = userObject;
              }
              next();
       } catch (error) {
              next(error);
       }
};

module.exports.verfiyUserLogin = (req, res, next) => {
       try {
              if (req.session.userLogin) {
                     next();
              } else {
                     res.redirect('/');
              }
       } catch (error) {
              next(error);
       }
};
