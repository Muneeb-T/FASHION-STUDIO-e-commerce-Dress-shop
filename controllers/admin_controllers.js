/* eslint-disable indent */
const { ObjectId } = require('mongodb');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');
const productControllers = require('./product_controllers');
const bannerControllers = require('./bannerControllers');
const orderControllers = require('./orderControllers');

module.exports.adminLogin = (req, res) => {
       if (req.session.adminLogin) res.redirect('/admin/dashboard');
       res.render('admin/login', {
              layout: 'admin_layout',
              admin: true,
              login_page: true,
              loginError: req.flash('loginError'),
       });
};

module.exports.adminDashboard = (req, res) => {
       res.render('admin/dashboard', { layout: 'admin_layout', admin: true });
};

module.exports.addProduct = async (req, res) => {
       let categories = await productControllers.allCategories('all');
       if (categories.length === 0) categories = null;

       res.render('admin/add-product', {
              layout: 'admin_layout',
              admin: true,
              categories,
       });
};

module.exports.allCategories = async (req, res) => {
       const { allOrDeleted } = req.params;

       const categories = await productControllers.allCategories(allOrDeleted);

       const isDeletePage = allOrDeleted === 'deleted';

       res.render('admin/categories', {
              layout: 'admin_layout',
              admin: true,
              categories,
              isDeletePage,
              addCategoryError: req.flash('addCategoryError'),
       });
};

module.exports.products = async (req, res) => {
       const categoryId = req.params.id;
       const products = await productControllers.allProducts(categoryId);
       res.render('admin/products', {
              layout: 'admin_layout',
              admin: true,
              products,
       });
};

module.exports.banners = async (req, res) => {
       const banners = await bannerControllers.getBanners();
       res.render('admin/banners', {
              layout: 'admin_layout',
              banners,
              admin: true,
       });
};

module.exports.addBanners = async (req, res) => {
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
              .updateOne({}, { $push: { banners: banner } }, { upsert: true });
       res.json({ bannerAddSuccess: true });
};

module.exports.coupons = async (req, res) => {
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
       res.render('admin/coupons', {
              layout: 'admin_layout',
              admin: true,
              coupons,
       });
};

module.exports.addCoupon = async (req, res) => {
       const { discount, validity, couponCode, minimumPurchaseAmount } =
              req.body;

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
       };

       await db
              .get()
              .collection(collections.ADMIN_COLLECTION)
              .updateOne({}, { $push: { coupons: couponObject } });
       res.json({ couponAddSuccess: true });
};

module.exports.orders = async (req, res) => {
       const allOrders = await orderControllers.getAllOrders();
       res.render('admin/orders', {
              layout: 'admin_layout',
              admin: true,
              allOrders,
       });
};
module.exports.viewOrderedProducts = async (req, res) => {
       const orderId = req.params.id;
       const products = await orderControllers.viewOrderedProducts(orderId);
       res.render('admin/products', {
              layout: 'admin_layout',
              admin: true,
              products,
       });
};

module.exports.deletedProducts = async (req, res) => {
       const products = await productControllers.allProducts('deleted');
       res.render('admin/deletedProducts', {
              layout: 'admin_layout',
              admin: true,
              products,
       });
};

module.exports.deleteCoupon = async (req, res) => {
       const { couponId } = req.body;
       await db
              .get()
              .collection(collections.ADMIN_COLLECTION)
              .updateOne(
                     {},
                     {
                            $pull: { coupons: { _id: ObjectId(couponId) } },
                     },
              );
       res.json({ couponDelete: true });
};
