/* eslint-disable no-inner-declarations */
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const productControllers = require('./product_controllers');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');
const bannerControllers = require('./bannerControllers');
const paymentControllers = require('./paymentControllers');
const orderControllers = require('./orderControllers');
const otpControllers = require('./otp_controllers');
const { sendEmail } = require('./mailOtpControllers');

/* eslint-disable indent */
module.exports.viewProducts = async (req, res, next) => {
       try {
              const userId = req.session.user._id;
              const { guest, wishlist } = req.session.user;
              const { type } = req.params;
              const products = await productControllers.getProducts(
                     type,
                     req.query,
                     userId,
                     guest,
                     wishlist,
              );
              const categories = await productControllers.allCategories('all');

              res.render('users/products', {
                     layout: 'users_layout',
                     products: products.length > 0 ? products : null,
                     categories,
                     user: true,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.quickView = async (req, res, next) => {
       try {
              const userId = req.session.user._id;
              const { guest, wishlist } = req.session.user;
              const productRatingCounts =
                     await productControllers.getProductRatingCounts(
                            req.params.id,
                     );
              const product = await productControllers.getSingleProductDetails(
                     req.params.id,
                     userId,
                     guest,
                     wishlist,
              );
              res.render('users/quick_view', {
                     layout: 'users_layout',
                     product,
                     productRatingCounts,
                     user: true,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.homepage = async (req, res, next) => {
       try {
              const exploreProducts = await productControllers.getProducts(
                     'all',
                     {
                            randomProducts: true,
                     },
              );
              const newProducts = await productControllers.getProducts('all', {
                     newProducts: true,
              });

              const banners = await bannerControllers.getBanners();

              res.render('users/homepage', {
                     layout: 'users_layout',
                     exploreProducts,
                     newProducts,
                     banners,
                     user: true,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.wishlist = async (req, res, next) => {
       try {
              const userId = req.session.user._id;
              const { guest } = req.session.user;
              const guestWishlist = req.session.user.wishlist;
              const wishlist = await productControllers.getWishlist(
                     userId,
                     guest,
                     guestWishlist,
              );
              if (wishlist && wishlist.length > 0) {
                     wishlist.forEach((product) => {
                            product.stars = [];
                            for (let i = 1; i <= 5; i++) {
                                   if (
                                          product.averageRating &&
                                          i <=
                                                 product.averageRating
                                                        .averageRating
                                   ) {
                                          product.stars.push(true);
                                   } else {
                                          product.stars.push(false);
                                   }
                            }
                     });
              }

              res.render('users/wishlist', {
                     layout: 'users_layout',
                     user: true,
                     wishlist: wishlist.length > 0 ? wishlist : null,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.viewBag = async (req, res, next) => {
       try {
              const user = req.session.user._id;
              const { guest, cart } = req.session.user;

              const cartDetails = await productControllers.cartDetails(
                     user,
                     guest,
                     cart,
              );

              const coupons =
                     cartDetails && cartDetails[1]
                            ? await db
                                     .get()
                                     .collection(collections.ADMIN_COLLECTION)
                                     .aggregate([
                                            {
                                                   $unwind: '$coupons',
                                            },
                                            {
                                                   $match: {
                                                          $and: [
                                                                 {
                                                                        'coupons.minimumPurchaseAmount':
                                                                               {
                                                                                      $lte: cartDetails[1]
                                                                                             .totalPrice,
                                                                               },
                                                                 },
                                                                 {
                                                                        'coupons.expiryDate':
                                                                               {
                                                                                      $gte: new Date(),
                                                                               },
                                                                 },
                                                          ],
                                                   },
                                            },
                                            {
                                                   $project: {
                                                          _id: '$coupons._id',
                                                          discount: '$coupons.discount',
                                                          validity: '$coupons.validity',
                                                          couponCode:
                                                                 '$coupons.couponCode',
                                                          minimumPurchaseAmount:
                                                                 '$coupons.minimumPurchaseAmount',
                                                          addedDate: {
                                                                 $dateToString:
                                                                        {
                                                                               format: '%d/%m/%Y',
                                                                               date: '$coupons.addedDate',
                                                                        },
                                                          },
                                                          expiryDate: {
                                                                 $dateToString:
                                                                        {
                                                                               format: '%d/%m/%Y',
                                                                               date: '$coupons.expiryDate',
                                                                        },
                                                          },
                                                   },
                                            },
                                            {
                                                   $addFields: {
                                                          savings: {
                                                                 $toInt: {
                                                                        $multiply: [
                                                                               {
                                                                                      $divide: [
                                                                                             '$discount',
                                                                                             100,
                                                                                      ],
                                                                               },
                                                                               cartDetails[1]
                                                                                      .totalPrice,
                                                                        ],
                                                                 },
                                                          },
                                                   },
                                            },
                                     ])
                                     .toArray()
                            : null;

              res.render('users/cart', {
                     layout: 'users_layout',
                     user: true,
                     cartDetails: cartDetails ? cartDetails[0] : null,
                     cartSubtotal: cartDetails ? cartDetails[1] : null,
                     cartPage: true,
                     coupons,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.getAllUsers = async (req, res, next) => {
       try {
              const aggregate = [{ $project: { password: 0, wishlist: 0 } }];
              if (req.params.allOrBlocked === 'blocked') {
                     aggregate.push({ $match: { blocked: true } });
              } else {
                     aggregate.push({ $match: { blocked: false } });
              }

              const users = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .aggregate(aggregate)
                     .toArray();
              res.render('admin/users', {
                     layout: 'admin_layout',
                     admin: true,
                     users: users.length > 0 ? users : null,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.blockUser = async (req, res) => {
       try {
              const { userId } = req.body;
              await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .updateOne({ _id: ObjectId(userId) }, [
                            { $set: { blocked: { $eq: [false, '$blocked'] } } },
                     ]);
              res.json({ blockOrUnblockSuccess: true });
       } catch {
              res.json({ error500: true });
       }
};

module.exports.checkout = async (req, res, next) => {
       try {
              const user = req.session.user._id;
              const checkoutDetails = await productControllers.cartDetails(
                     user,
              );
              const addressList = await db
                     .get()
                     .collection(collections.ADDRESS_COLLECTION)
                     .find({ user: ObjectId(user), deleted: { $ne: true } })
                     .toArray();
              res.render('users/checkout', {
                     layout: 'users_layout',
                     user: true,
                     checkoutDetails: checkoutDetails[0],
                     priceDetails: checkoutDetails[1],
                     productsCount: checkoutDetails[0].length,
                     addressList,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.placeOrder = async (req, res, next) => {
       try {
              const { address, paymentMethod } = req.body;
              const user = req.session.user._id;

              const aggregate = [
                     {
                            $match: {
                                   user: ObjectId(user),
                            },
                     },
                     {
                            $project: {
                                   _id: 0,
                                   products: 1,
                            },
                     },
                     {
                            $unwind: '$products',
                     },
                     {
                            $project: {
                                   product: '$products._id',
                                   size: '$products.size',
                                   count: '$products.count',
                            },
                     },
                     {
                            $lookup: {
                                   from: collections.PRODUCT_COLLECTION,
                                   localField: 'product',
                                   foreignField: '_id',
                                   pipeline: [
                                          {
                                                 $project: {
                                                        price: {
                                                               $cond: {
                                                                      if: {
                                                                             $eq: [
                                                                                    '$offerPrice',
                                                                                    null,
                                                                             ],
                                                                      },
                                                                      then: '$price',
                                                                      else: '$offerPrice',
                                                               },
                                                        },
                                                 },
                                          },
                                   ],
                                   as: 'price',
                            },
                     },
                     {
                            $project: {
                                   product: 1,
                                   size: 1,
                                   count: 1,
                                   price: { $arrayElemAt: ['$price', 0] },
                            },
                     },
                     {
                            $addFields: {
                                   totalPrice: {
                                          $multiply: ['$count', '$price.price'],
                                   },
                            },
                     },
                     {
                            $project: {
                                   price: 0,
                            },
                     },
              ];

              const products = await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .aggregate(aggregate)
                     .toArray();

              const checkoutDetails = await productControllers.cartDetails(
                     user,
              );

              const priceDetails = checkoutDetails[1];

              const order = {
                     user: ObjectId(user),
                     products,
                     ...priceDetails,
                     address: ObjectId(address),
                     orderStatus:
                            paymentMethod === 'cod' ? 'Placed' : 'Pending',
                     orderDate: new Date(),
              };
              if (paymentMethod === 'cod') {
                     order.paymentMethod = 'COD';
              } else if (paymentMethod === 'razorpay') {
                     order.paymentMethod = 'Razorpay';
              } else if (paymentMethod === 'paypal') {
                     order.payamentMethod = 'Paypal';
              }
              const createOrder = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .insertOne(order);

              if (paymentMethod === 'razorpay') {
                     const orderId = createOrder.insertedId;
                     req.session.newOrderId = orderId;
                     const razorpayOrder =
                            await paymentControllers.generateRazorpay(
                                   orderId,
                                   priceDetails.amountPayable,
                            );

                     const userDetails = await db
                            .get()
                            .collection(collections.USERS_COLLECTION)
                            .findOne(
                                   {
                                          _id: ObjectId(user),
                                   },
                                   {
                                          $projection: {
                                                 username: 1,
                                                 phone_number: 1,
                                                 email: 1,
                                          },
                                   },
                            );

                     res.json({ online: true, razorpayOrder, userDetails });
              } else {
                     await clearCart();
                     res.json({ cod: true, orderId: createOrder.insertedId });
              }

              products.forEach(async (product) => {
                     await db
                            .get()
                            .collection(collections.PRODUCT_COLLECTION)
                            .updateOne(
                                   { _id: ObjectId(product.product) },
                                   {
                                          $inc: {
                                                 'stock.$[i].stock':
                                                        -product.count,
                                          },
                                   },
                                   {
                                          arrayFilters: [
                                                 {
                                                        'i.size': {
                                                               $eq: product.size,
                                                        },
                                                 },
                                          ],
                                   },
                            );
              });

              async function clearCart() {
                     await db
                            .get()
                            .collection(collections.CART_COLLECTION)
                            .deleteOne({ user: ObjectId(user) });
                     req.session.user.cartCount = 0;
              }
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.verifyOrderPayment = async (req, res) => {
       try {
              const user = req.session.user._id;
              const isValidPayment = await paymentControllers.verifyPayment(
                     req.body,
              );
              const orderId = req.session.newOrderId;
              if (isValidPayment) {
                     await db
                            .get()
                            .collection(collections.ORDERS_COLLECTION)
                            .updateOne(
                                   { _id: ObjectId(orderId) },
                                   {
                                          $set: {
                                                 orderStatus: 'Placed',
                                          },
                                   },
                            );
                     await clearCart();
                     res.json({ paymentSuccess: true, orderId });
              } else {
                     res.json({ paymentSuccess: false });
              }
              async function clearCart() {
                     await db
                            .get()
                            .collection(collections.CART_COLLECTION)
                            .deleteOne({ user: ObjectId(user) });
                     req.session.user.cartCount = 0;
              }
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.applyCoupon = async (req, res) => {
       try {
              const { coupon } = req.body;
              const user = req.session.user._id;

              const responseObject = { applyCouponSuccess: true };

              const alreadyUsed = await db
                     .get()
                     .collection(collections.ADMIN_COLLECTION)
                     .aggregate([
                            {
                                   $unwind: '$coupons',
                            },
                            {
                                   $project: {
                                          _id: 0,
                                          coupons: 1,
                                   },
                            },
                            {
                                   $match: {
                                          $and: [
                                                 {
                                                        'coupons._id':
                                                               ObjectId(coupon),
                                                 },
                                                 {
                                                        'coupons.usedBy': {
                                                               $in: [
                                                                      ObjectId(
                                                                             user,
                                                                      ),
                                                               ],
                                                        },
                                                 },
                                          ],
                                   },
                            },
                     ])
                     .toArray();

              if (alreadyUsed[0]) {
                     responseObject.applyCouponSuccess = false;
                     responseObject.alreadyUsed = true;
              } else {
                     const isCouponApplied = await db
                            .get()
                            .collection(collections.CART_COLLECTION)
                            .aggregate([
                                   {
                                          $match: {
                                                 user: ObjectId(user),
                                          },
                                   },
                                   {
                                          $project: {
                                                 couponApplied: 1,
                                          },
                                   },
                            ])
                            .toArray();

                     let update;

                     if (coupon) {
                            const isOutOfLimit = await db
                                   .get()
                                   .collection(collections.ADMIN_COLLECTION)
                                   .aggregate([
                                          {
                                                 $project: {
                                                        coupons: 1,
                                                 },
                                          },
                                          {
                                                 $unwind: '$coupons',
                                          },
                                          {
                                                 $match: {
                                                        'coupons._id':
                                                               ObjectId(coupon),
                                                 },
                                          },
                                          {
                                                 $project: {
                                                        limit: '$coupons.limit',
                                                 },
                                          },
                                   ])
                                   .toArray();
                            if (isOutOfLimit[0].limit > 0) {
                                   if (
                                          isCouponApplied &&
                                          isCouponApplied[0].couponApplied
                                   ) {
                                          if (
                                                 isCouponApplied[0].couponApplied.toString() !==
                                                 coupon.toString()
                                          ) {
                                                 update = {
                                                        $set: {
                                                               couponApplied:
                                                                      ObjectId(
                                                                             coupon,
                                                                      ),
                                                        },
                                                 };
                                                 await limitIncrement(
                                                        -1,
                                                        coupon,
                                                 );
                                          }
                                   } else {
                                          update = {
                                                 $set: {
                                                        couponApplied:
                                                               ObjectId(coupon),
                                                 },
                                          };
                                          await limitIncrement(-1, coupon);
                                   }
                            } else {
                                   responseObject.applyCouponSuccess = false;
                                   responseObject.outOfLimit = true;
                            }
                     } else if (
                            isCouponApplied &&
                            isCouponApplied[0].couponApplied
                     ) {
                            update = {
                                   $unset: { couponApplied: '' },
                            };
                            await limitIncrement(
                                   1,
                                   isCouponApplied[0].couponApplied,
                            );
                     }

                     if (update) {
                            await db
                                   .get()
                                   .collection(collections.CART_COLLECTION)
                                   .updateOne(
                                          { user: ObjectId(user) },
                                          {
                                                 ...update,
                                          },
                                   );
                     }
              }

              async function limitIncrement(inc, couponId) {
                     const usedBy =
                            inc === -1
                                   ? {
                                            $push: {
                                                   'coupons.$[i].usedBy':
                                                          ObjectId(user),
                                            },
                                     }
                                   : {
                                            $pull: {
                                                   'coupons.$[i].usedBy':
                                                          ObjectId(user),
                                            },
                                     };

                     await db
                            .get()
                            .collection(collections.ADMIN_COLLECTION)
                            .updateOne(
                                   {},
                                   {
                                          $inc: { 'coupons.$[i].limit': inc },
                                          ...usedBy,
                                   },
                                   {
                                          arrayFilters: [
                                                 {
                                                        'i._id': {
                                                               $eq: ObjectId(
                                                                      couponId,
                                                               ),
                                                        },
                                                 },
                                          ],
                                   },
                            );
              }

              res.json(responseObject);
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.orders = async (req, res, next) => {
       try {
              const user = req.session.user._id;
              const ordersList = await orderControllers.usersOrdersList(user);
              res.render('users/orders', {
                     layout: 'users_layout',
                     user: true,
                     ordersList: ordersList.length > 0 ? ordersList : null,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.orderDetails = async (req, res, next) => {
       try {
              const orderId = req.params.id;
              const orderDetails = await orderControllers.orderDetails(orderId);
              res.render('users/orderDetails', {
                     layout: 'users_layout',
                     user: true,
                     orderedProducts: orderDetails[0],
                     orderDetails: orderDetails[1],
              });
       } catch (error) {
              next(error);
       }
};

module.exports.userProfile = async (req, res, next) => {
       try {
              const user = req.session.user._id;
              const userDetails = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne(
                            { _id: ObjectId(user) },
                            {
                                   projection: {
                                          password: 0,
                                          wishlist: 0,
                                          blocked: 0,
                                   },
                            },
                     );
              res.render('users/profile', {
                     layout: 'users_layout',
                     user: true,
                     userDetails,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.address = async (req, res, next) => {
       try {
              const user = req.session.user._id;
              const userDetails = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne(
                            { _id: ObjectId(user) },
                            {
                                   projection: {
                                          password: 0,
                                          wishlist: 0,
                                          blocked: 0,
                                   },
                            },
                     );
              const addressList = await db
                     .get()
                     .collection(collections.ADDRESS_COLLECTION)
                     .find({ user: ObjectId(user), deleted: { $ne: true } })
                     .toArray();
              res.render('users/address', {
                     layout: 'users_layout',
                     user: true,
                     userDetails,
                     addressList,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.addAddress = async (req, res) => {
       try {
              const user = req.session.user._id;
              const userDetails = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne(
                            { _id: ObjectId(user) },
                            {
                                   projection: {
                                          password: 0,
                                          wishlist: 0,
                                          blocked: 0,
                                   },
                            },
                     );
              res.render('users/addAddress', {
                     layout: 'users_layout',
                     user: true,
                     userDetails,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.updateProfile = async (req, res) => {
       try {
              const user = req.session.user._id;
              const { username, email, phone_number, password } = req.body;
              const { file } = req;
              const update = {};
              if (file) {
                     update.profilePicture = file.filename;
              }

              if (username) {
                     update.username = username;
              }
              if (phone_number) {
                     req.session.phoneNumber = req.session.user.phoneNumber;
                     const phoneNumberExist = await db
                            .get()
                            .collection(collections.USERS_COLLECTION)
                            .findOne({ phone_number });
                     if (phoneNumberExist) {
                            res.json({
                                   updationError: true,
                                   message: 'Phone number already exist',
                            });
                     } else {
                            await otpControllers.sentOtp(
                                   req.session.user.phoneNumber,
                            );
                            req.session.profileUpdate = phone_number;
                            res.json({
                                   otpSent: true,
                                   phoneNumber: req.session.user.phoneNumber,
                            });
                     }
              }
              if (email) {
                     const emailExist = await db
                            .get()
                            .collection(collections.USERS_COLLECTION)
                            .findOne({ email });
                     if (emailExist) {
                            res.json({
                                   updationError: true,
                                   message: 'Email already exist',
                            });
                     } else {
                            const oldEmail = await db
                                   .get()
                                   .collection(collections.USERS_COLLECTION)
                                   .findOne(
                                          { _id: ObjectId(user) },
                                          { projection: { email: 1 } },
                                   );

                            req.session.emailUpdate = email;
                            const otp = Math.floor(
                                   100000 + Math.random() * 900000,
                            );
                            req.session.emailOtp = otp;
                            await sendEmail(oldEmail.email, otp);

                            res.json({ otpSent: true, email: oldEmail.email });
                     }
              }
              if (password) {
                     await otpControllers.sentOtp(req.session.user.phoneNumber);
                     req.session.phoneNumber = req.session.user.phoneNumber;
                     req.session.profileUpdate = phone_number;
                     res.json({
                            otpSent: true,
                            phoneNumber: req.session.user.phoneNumber,
                     });
              }
              if (file || username) {
                     await db
                            .get()
                            .collection(collections.USERS_COLLECTION)
                            .updateOne(
                                   {
                                          _id: ObjectId(user),
                                   },
                                   {
                                          $set: { ...update },
                                   },
                            );
                     if (username) req.session.user.username = username;
                     res.json({ updationSuccess: true });
              }
       } catch (error) {
              if (error.otpError) {
                     res.json(error);
              } else if (error.emailSendError) {
                     res.json({
                            emailSendError: true,
                            message: 'An error occured while sending OTP',
                     });
              } else {
                     res.json({ error500: true });
              }
       }
};

module.exports.updateUsername = async (req, res) => {
       try {
              const user = req.session.user._id;
              await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .updateOne(
                            {
                                   _id: ObjectId(user),
                            },
                            {
                                   $set: {
                                          phone_number:
                                                 req.session.profileUpdate,
                                   },
                            },
                     );
              req.session.user.phoneNumber = req.session.profileUpdate;
              res.json({
                     phoneNumberUpdateSuccess: true,
                     phone_number: req.session.profileUpdate,
              });
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.updatePassword = async (req, res) => {
       try {
              let { newPassword } = req.body;
              const user = req.session.user._id;

              newPassword = await bcrypt.hash(newPassword, 10);
              await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .updateOne(
                            { _id: ObjectId(user) },
                            {
                                   $set: {
                                          password: newPassword,
                                   },
                            },
                     );
              res.json({ passwordUpdateSuccess: true });
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.updateEmail = async (req, res) => {
       try {
              const otp = req.body.otp.join('');
              const newEmail = req.session.emailUpdate;
              const user = req.session.user._id;
              if (Number(otp) === Number(req.session.emailOtp)) {
                     await db
                            .get()
                            .collection(collections.USERS_COLLECTION)
                            .updateOne(
                                   { _id: ObjectId(user) },
                                   { $set: { email: newEmail } },
                            );
                     res.json({ emailUpdateSuccess: true });
              } else {
                     res.json({ verificationFailed: true });
              }
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.addNewAdress = async (req, res, next) => {
       try {
              const user = req.session.user._id;
              await db
                     .get()
                     .collection(collections.ADDRESS_COLLECTION)
                     .insertOne({ user: ObjectId(user), ...req.body });
              res.redirect('/address');
       } catch (error) {
              next(error);
       }
};

module.exports.deleteAddress = async (req, res) => {
       try {
              const addressId = req.params.id;
              await db
                     .get()
                     .collection(collections.ADDRESS_COLLECTION)
                     .updateOne(
                            { _id: ObjectId(addressId) },
                            { $set: { deleted: true } },
                     );
              res.json({ addressDeleted: true });
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.saveAddress = async (req, res) => {
       try {
              const user = req.session.user._id;
              const saveAddress = await db
                     .get()
                     .collection(collections.ADDRESS_COLLECTION)
                     .insertOne({ user: ObjectId(user), ...req.body });
              res.json({
                     addressSaved: true,
                     savedAddress: req.body,
                     newAddressId: saveAddress.insertedId,
              });
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.invoice = async (req, res, next) => {
       try {
              const orderId = req.params.id;
              const orderDetails = await orderControllers.orderDetails(orderId);
              res.render('users/invoice', {
                     layout: 'users_layout',
                     user: true,
                     orderedProducts: orderDetails[0],
                     orderDetails: orderDetails[1],
              });
       } catch (error) {
              next(error);
       }
};

module.exports.editAddress = async (req, res, next) => {
       try {
              const user = req.session.user._id;
              const addressId = req.params.id;
              const userDetails = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .findOne(
                            { _id: ObjectId(user) },
                            {
                                   projection: {
                                          password: 0,
                                          wishlist: 0,
                                          blocked: 0,
                                   },
                            },
                     );
              const address = await db
                     .get()
                     .collection(collections.ADDRESS_COLLECTION)
                     .findOne({ _id: ObjectId(addressId) });
              res.render('users/editAddress', {
                     layout: 'users_layout',
                     user: true,
                     userDetails,
                     address,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.addressEdit = async (req, res, next) => {
       try {
              const updations = req.body;
              const addressId = req.params.id;

              await db
                     .get()
                     .collection(collections.ADDRESS_COLLECTION)
                     .updateOne(
                            { _id: ObjectId(addressId) },
                            { $set: { ...updations } },
                     );
              res.redirect('/address');
       } catch (error) {
              next(error);
       }
};
