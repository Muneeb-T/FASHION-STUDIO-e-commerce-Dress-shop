const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const productControllers = require('./product_controllers');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');
const bannerControllers = require('./bannerControllers');
const paymentControllers = require('./paymentControllers');

/* eslint-disable indent */
module.exports.viewProducts = async (req, res) => {
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
              products,
              categories,
              user: true,
       });
};

module.exports.quickView = async (req, res) => {
       const userId = req.session.user._id;
       const { guest, wishlist } = req.session.user;
       const product = await productControllers.getSingleProductDetails(
              req.params.id,
              userId,
              guest,
              wishlist,
       );
       res.render('users/quick_view', {
              layout: 'users_layout',
              product,
              user: true,
       });
};

module.exports.homepage = async (req, res) => {
       const coupons = await db
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
              ])
              .toArray();

       const exploreProducts = await productControllers.getProducts('all', {
              randomProducts: true,
       });
       const newProducts = await productControllers.getProducts('all', {
              newProducts: true,
       });
       const recommendedProducts = await productControllers.getProducts('all', {
              recommeded: true,
       });

       const banners = await bannerControllers.getBanners();

       res.render('users/homepage', {
              layout: 'users_layout',
              exploreProducts,
              newProducts,
              banners,
              coupons,
              user: true,
       });
};

module.exports.wishlist = async (req, res) => {
       const userId = req.session.user._id;
       const { guest } = req.session.user;
       const guestWishlist = req.session.user.wishlist;
       const wishlist = await productControllers.getWishlist(
              userId,
              guest,
              guestWishlist,
       );
       console.log(wishlist);

       res.render('users/wishlist', {
              layout: 'users_layout',
              user: true,
              wishlist,
       });
};

module.exports.viewBag = async (req, res) => {
       const user = req.session.user._id;
       const { guest, cart } = req.session.user;

       const cartDetails = await productControllers.cartDetails(
              user,
              guest,
              cart,
       );

       const coupons = await db
              .get()
              .collection(collections.ADMIN_COLLECTION)
              .aggregate([
                     {
                            $unwind: '$coupons',
                     },
                     {
                            $match: {
                                   'coupons.minimumPurchaseAmount': {
                                          $lte: cartDetails[1].totalPrice,
                                   },
                            },
                     },
                     {
                            $project: {
                                   _id: '$coupons._id',
                                   discount: '$coupons.discount',
                                   validity: '$coupons.validity',
                                   couponCode: '$coupons.couponCode',
                                   minimumPurchaseAmount:
                                          '$coupons.minimumPurchaseAmount',
                                   addedDate: {
                                          $dateToString: {
                                                 format: '%d/%m/%Y',
                                                 date: '$coupons.addedDate',
                                          },
                                   },
                                   expiryDate: {
                                          $dateToString: {
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
              .toArray();
       console.log(coupons);
       res.render('users/cart', {
              layout: 'users_layout',
              user: true,
              cartDetails: cartDetails[0],
              cartSubtotal: cartDetails[1],
              cartPage: true,
              coupons,
       });
};

module.exports.getAllUsers = async (req, res) => {
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
              users,
       });
};

module.exports.blockUser = async (req, res) => {
       const { userId } = req.body;
       try {
              await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .updateOne({ _id: ObjectId(userId) }, [
                            { $set: { blocked: { $eq: [false, '$blocked'] } } },
                     ]);
              res.json({ blockOrUnblockSuccess: true });
       } catch {
              res.json({ blockOrUnblockSuccess: false });
       }
};

module.exports.checkout = async (req, res) => {
       const user = req.session.user._id;
       const checkoutDetails = await productControllers.cartDetails(user);
       console.log(checkoutDetails[0]);
       res.render('users/checkout', {
              layout: 'users_layout',
              user: true,
              checkoutDetails: checkoutDetails[0],
              totalPrice: checkoutDetails[1],
              productsCount: checkoutDetails[0].length,
       });
};

module.exports.placeOrder = async (req, res) => {
       const { name, address, town, district, postcode, paymentMethod } =
              req.body;
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
                                                 price: 1,
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

       aggregate.push({
              $group: {
                     _id: null,
                     totalPrice: {
                            $sum: '$totalPrice',
                     },
              },
       });

       const totalAmount = await db
              .get()
              .collection(collections.CART_COLLECTION)
              .aggregate(aggregate)
              .toArray();

       const order = {
              user: ObjectId(user),
              products,
              amount: totalAmount[0].totalPrice,
              address: {
                     name,
                     address,
                     town,
                     district,
                     postcode,
              },
              paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Online payment',
              orderStatus: paymentMethod === 'cod' ? 'Placed' : 'Pending',
              orderDate: new Date(),
       };
       const createOrder = await db
              .get()
              .collection(collections.ORDERS_COLLECTION)
              .insertOne(order);

       if (paymentMethod === 'onlinePayment') {
              const orderId = createOrder.insertedId;
              req.session.newOrderId = orderId;
              const razorpayOrder = await paymentControllers.generateRazorpay(
                     orderId,
                     totalAmount[0].totalPrice,
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
              await clearCart();

              res.json({ online: true, razorpayOrder, userDetails });
       } else {
              await clearCart();
              res.json({ cod: true });
       }
       async function clearCart() {
              await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .deleteOne({ user: ObjectId(user) });
              req.session.user.cartCount = 0;
       }
};

module.exports.verifyOrderPayment = async (req, res) => {
       const isValidPayment = await paymentControllers.verifyPayment(req.body);
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
              res.json({ paymentSuccess: true });
       } else {
              res.json({ paymentSuccess: false });
       }
};

module.exports.applyCoupon = async (req, res) => {
       const { coupon } = req.body;
       const user = req.session.user._id;
       const applyCoupon = await db
              .get()
              .collection(collections.CART_COLLECTION)
              .updateOne(
                     { user: ObjectId(user) },
                     { $set: { couponApplied: ObjectId(coupon) } },
              );
       res.json({ applyCouponSuccess: true });
};
