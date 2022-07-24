/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-inner-declarations */
/* eslint-disable indent */
const { ObjectId } = require('mongodb');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');
const productControllers = require('./product_controllers');
const bannerControllers = require('./bannerControllers');
const orderControllers = require('./orderControllers');
const notificationController = require('./notificationControllers');

module.exports.adminLogin = (req, res, next) => {
       try {
              if (req.session.adminLogin) res.redirect('/admin/dashboard');
              res.render('admin/login', {
                     layout: 'admin_layout',
                     admin: true,
                     login_page: true,
                     loginError: req.flash('loginError'),
              });
       } catch (error) {
              console.log(error);
              next(error);
       }
};

module.exports.adminDashboard = async (req, res, next) => {
       try {
              const reviewNotifications =
                     await notificationController.loadNotifications();
              function padTo2Digits(num) {
                     return num.toString().padStart(2, '0');
              }

              function formatDate(date) {
                     return [
                            padTo2Digits(date.getDate()),
                            padTo2Digits(date.getMonth() + 1),
                            date.getFullYear(),
                     ].join('-');
              }

              const reveniew = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $match: { orderStatus: 'Delivered' },
                            },
                            {
                                   $group: {
                                          _id: null,
                                          reveniew: { $sum: '$amountPayable' },
                                   },
                            },
                     ])
                     .toArray();

              const todaysReveniew = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $match: {
                                          $and: [
                                                 {
                                                        $expr: {
                                                               $eq: [
                                                                      `${formatDate(
                                                                             new Date(),
                                                                      )}`,
                                                                      {
                                                                             $dateToString:
                                                                                    {
                                                                                           date: '$orderDate',
                                                                                           format: '%d-%m-%Y',
                                                                                    },
                                                                      },
                                                               ],
                                                        },
                                                 },
                                                 {
                                                        $expr: {
                                                               $eq: [
                                                                      '$orderStatus',
                                                                      'Delivered',
                                                               ],
                                                        },
                                                 },
                                          ],
                                   },
                            },
                            {
                                   $group: {
                                          _id: null,
                                          reveniew: { $sum: '$amountPayable' },
                                   },
                            },
                     ])
                     .toArray();

              const customers = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .aggregate([
                            { $group: { _id: null, customers: { $sum: 1 } } },
                     ])
                     .toArray();

              const products = await db
                     .get()
                     .collection(collections.PRODUCT_COLLECTION)
                     .aggregate([
                            {
                                   $match: { deleted: false },
                            },
                            {
                                   $group: {
                                          _id: null,
                                          products: { $sum: 1 },
                                   },
                            },
                     ])
                     .toArray();

              const totalSales = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            { $match: { orderStatus: 'Delivered' } },
                            { $group: { _id: null, totalSales: { $sum: 1 } } },
                     ])
                     .toArray();

              const activeOrders = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            { $match: { orderStatus: { $ne: 'Delivered' } } },
                            {
                                   $group: {
                                          _id: null,
                                          activeOrders: { $sum: 1 },
                                   },
                            },
                     ])
                     .toArray();

              const payment = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $group: {
                                          _id: '$paymentMethod',
                                          count: { $sum: 1 },
                                   },
                            },
                            {
                                   $group: {
                                          _id: null,
                                          counts: {
                                                 $push: {
                                                        method: '$_id',
                                                        count: '$count',
                                                 },
                                          },
                                   },
                            },
                            {
                                   $unwind: '$counts',
                            },
                            {
                                   $project: {
                                          method: '$counts.method',
                                          count: '$counts.count',
                                   },
                            },
                            {
                                   $group: {
                                          _id: null,
                                          sum: { $sum: '$count' },
                                          methods: {
                                                 $push: {
                                                        method: '$method',
                                                        count: '$count',
                                                 },
                                          },
                                   },
                            },

                            {
                                   $unwind: {
                                          path: '$methods',
                                   },
                            },

                            {
                                   $project: {
                                          method: '$methods.method',
                                          count: '$methods.count',
                                          sum: '$sum',
                                          percent: {
                                                 $multiply: [
                                                        {
                                                               $divide: [
                                                                      '$methods.count',
                                                                      '$sum',
                                                               ],
                                                        },
                                                        100,
                                                 ],
                                          },
                                   },
                            },
                            {
                                   $project: {
                                          method: 1,
                                          count: 1,
                                          sum: 1,
                                          percent: { $round: ['$percent', -1] },
                                   },
                            },
                     ])
                     .toArray();
              console.log(payment);

              const salesByDate = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $match: { orderStatus: 'Delivered' },
                            },
                            {
                                   $group: {
                                          _id: {
                                                 $dateToString: {
                                                        format: '%d-%m-%Y',
                                                        date: '$orderDate',
                                                 },
                                          },
                                          amount: { $sum: '$amountPayable' },
                                   },
                            },
                            {
                                   $sort: {
                                          _id: 1,
                                   },
                            },
                     ])
                     .toArray();

              const ordersByDate = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $group: {
                                          _id: {
                                                 $dateToString: {
                                                        format: '%d-%m-%Y',
                                                        date: '$orderDate',
                                                 },
                                          },
                                          count: { $sum: 1 },
                                   },
                            },
                            {
                                   $sort: {
                                          _id: 1,
                                   },
                            },
                     ])
                     .toArray();

              const salesByType = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $unwind: {
                                          path: '$products',
                                   },
                            },
                            {
                                   $project: {
                                          _id: 0,
                                          product: '$products.product',
                                   },
                            },
                            {
                                   $lookup: {
                                          from: 'products',
                                          localField: 'product',
                                          foreignField: '_id',
                                          pipeline: [
                                                 {
                                                        $project: {
                                                               _id: 0,
                                                               type: 1,
                                                        },
                                                 },
                                          ],
                                          as: 'type',
                                   },
                            },
                            {
                                   $project: {
                                          type: { $arrayElemAt: ['$type', 0] },
                                   },
                            },
                            {
                                   $project: { type: '$type.type' },
                            },
                            {
                                   $group: {
                                          _id: '$type',
                                          count: { $sum: 1 },
                                   },
                            },
                            {
                                   $group: {
                                          _id: null,
                                          counts: {
                                                 $push: {
                                                        type: '$_id',
                                                        count: '$count',
                                                 },
                                          },
                                   },
                            },
                            {
                                   $unwind: '$counts',
                            },
                            {
                                   $project: {
                                          type: '$counts.type',
                                          count: '$counts.count',
                                   },
                            },
                            {
                                   $group: {
                                          _id: null,
                                          sum: { $sum: '$count' },
                                          types: {
                                                 $push: {
                                                        type: '$type',
                                                        count: '$count',
                                                 },
                                          },
                                   },
                            },

                            {
                                   $unwind: {
                                          path: '$types',
                                   },
                            },

                            {
                                   $project: {
                                          type: '$types.type',
                                          count: '$types.count',
                                          sum: '$sum',
                                          percent: {
                                                 $multiply: [
                                                        {
                                                               $divide: [
                                                                      '$types.count',
                                                                      '$sum',
                                                               ],
                                                        },
                                                        100,
                                                 ],
                                          },
                                   },
                            },
                            {
                                   $project: {
                                          type: 1,
                                          count: 1,
                                          sum: 1,
                                          percent: { $round: ['$percent', -1] },
                                   },
                            },
                     ])
                     .toArray();

              const orderStatus = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $group: {
                                          _id: '$orderStatus',
                                          count: { $sum: 1 },
                                   },
                            },
                     ])
                     .toArray();

              orderStatus.forEach((element) => {
                     if (element._id === 'Cancelled') {
                            element.color = '#f06c6c';
                     } else if (element._id === 'Placed') {
                            element.color = '#99fa73';
                     } else if (element._id === 'Shipped') {
                            element.color = '#fffc57';
                     } else if (element._id === 'Delivered') {
                            element.color = '#99fa73';
                     } else if (element._id === 'Out for delivery') {
                            element.color = '#81bef0';
                     }
              });

              const recentOrders = await orderControllers.getAllOrders(5);

              res.render('admin/dashboard', {
                     layout: 'admin_layout',
                     admin: true,
                     reveniew: reveniew.length > 0 ? reveniew[0].reveniew : 0,
                     todaysReveniew:
                            todaysReveniew.length > 0
                                   ? todaysReveniew[0].reveniew
                                   : 0,
                     customers:
                            customers.length > 0 ? customers[0].customers : 0,
                     products: products.length > 0 ? products[0].products : 0,
                     totalSales:
                            totalSales.length > 0
                                   ? totalSales[0].totalSales
                                   : 0,
                     activeOrders:
                            activeOrders.length > 0
                                   ? activeOrders[0].activeOrders
                                   : 0,
                     payment,
                     salesByDate,
                     ordersByDate,
                     salesByType,
                     orderStatus,
                     recentOrders:
                            recentOrders.length > 0 ? recentOrders : null,
                     reviewNotifications,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.addProduct = async (req, res, next) => {
       try {
              let categories = await productControllers.allCategories('all');
              const reviewNotifications =
                     await notificationController.loadNotifications();
              if (categories.length === 0) categories = null;

              res.render('admin/add-product', {
                     layout: 'admin_layout',
                     admin: true,
                     categories,
                     reviewNotifications,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.allCategories = async (req, res, next) => {
       try {
              const { allOrDeleted } = req.params;
              const reviewNotifications =
                     await notificationController.loadNotifications();
              const categories = await productControllers.allCategories(
                     allOrDeleted,
              );

              const isDeletePage = allOrDeleted === 'deleted';

              res.render('admin/categories', {
                     layout: 'admin_layout',
                     admin: true,
                     categories: categories.length > 0 ? categories : null,
                     isDeletePage,
                     reviewNotifications,
                     addCategoryError: req.flash('addCategoryError'),
              });
       } catch (error) {
              next(error);
       }
};

module.exports.products = async (req, res, next) => {
       try {
              const categoryId = req.params.id;
              const reviewNotifications =
                     await notificationController.loadNotifications();
              const products = await productControllers.allProducts(categoryId);
              res.render('admin/products', {
                     layout: 'admin_layout',
                     admin: true,
                     reviewNotifications,
                     products: products.length > 0 ? products : null,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.banners = async (req, res, next) => {
       try {
              const reviewNotifications =
                     await notificationController.loadNotifications();
              const banners = await bannerControllers.getBanners();
              res.render('admin/banners', {
                     layout: 'admin_layout',
                     banners: banners.length > 0 ? banners : null,
                     admin: true,
                     reviewNotifications,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.addBanners = async (req, res, next) => {
       try {
              const { title, subtitle } = req.body;
              const image = req.file;
              const banner = {
                     _id: new ObjectId(),
                     title,
                     subtitle,
                     image: image.filename,
              };
              await db
                     .get()
                     .collection(collections.ADMIN_COLLECTION)
                     .updateOne(
                            {},
                            { $push: { banners: banner } },
                            { upsert: true },
                     );
              res.json({ bannerAddSuccess: true });
       } catch (error) {
              next(error);
       }
};

module.exports.coupons = async (req, res, next) => {
       try {
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
              const reviewNotifications =
                     await notificationController.loadNotifications();
              res.render('admin/coupons', {
                     layout: 'admin_layout',
                     admin: true,
                     coupons,
                     reviewNotifications,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.addCoupon = async (req, res, next) => {
       try {
              const {
                     discount,
                     validity,
                     couponCode,
                     minimumPurchaseAmount,
                     limit,
              } = req.body;

              const addedDate = new Date();
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + parseInt(validity));
              const couponObject = {
                     _id: new ObjectId(),
                     discount: parseInt(discount),
                     validity: parseInt(validity),
                     couponCode,
                     minimumPurchaseAmount: parseInt(minimumPurchaseAmount),
                     addedDate,
                     expiryDate,
                     limit: parseInt(limit),
              };

              await db
                     .get()
                     .collection(collections.ADMIN_COLLECTION)
                     .updateOne({}, { $push: { coupons: couponObject } });
              res.json({ couponAddSuccess: true });
       } catch (error) {
              next(error);
       }
};

module.exports.orders = async (req, res, next) => {
       try {
              const allOrders = await orderControllers.getAllOrders();
              const reviewNotifications =
                     await notificationController.loadNotifications();
              res.render('admin/orders', {
                     layout: 'admin_layout',
                     admin: true,
                     reviewNotifications,
                     allOrders: allOrders.length > 0 ? allOrders : null,
              });
       } catch (error) {
              next(error);
       }
};
module.exports.orderDetails = async (req, res, next) => {
       try {
              const orderId = req.params.id;
              const reviewNotifications =
                     await notificationController.loadNotifications();
              const orderDetails = await orderControllers.orderDetails(orderId);
              res.render('admin/orderDetails', {
                     layout: 'admin_layout',
                     admin: true,
                     reviewNotifications,
                     orderedProducts: orderDetails[0],
                     orderDetails: orderDetails[1],
              });
       } catch (error) {
              next(error);
       }
};

module.exports.deletedProducts = async (req, res, next) => {
       try {
              const products = await productControllers.allProducts('deleted');
              const reviewNotifications =
              await notificationController.loadNotifications();
              res.render('admin/deletedProducts', {
                     layout: 'admin_layout',
                     admin: true,
                     reviewNotifications,
                     products: products.length > 0 ? products : null,
              });
       } catch (error) {
              next(error);
       }
};

module.exports.deleteCoupon = async (req, res, next) => {
       try {
              const { couponId } = req.body;
              await db
                     .get()
                     .collection(collections.ADMIN_COLLECTION)
                     .updateOne(
                            {},
                            {
                                   $pull: {
                                          coupons: { _id: ObjectId(couponId) },
                                   },
                            },
                     );
              res.json({ couponDelete: true });
       } catch (error) {
              next(error);
       }
};

module.exports.readMessage = async (req, res, next) => {
       try {
              await db
                     .get()
                     .collection(collections.REVIEW_COLLECTION)
                     .updateOne(
                            { _id: ObjectId(req.body.messageId) },
                            { $set: { read: true } },
                     );
              res.json({ messageReadSuccess: true });
       } catch (error) {
              res.json({ error500: true });
       }
};
