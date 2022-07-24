/* eslint-disable indent */
const express = require('express');

const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/admin_controllers');
const authenticationController = require('../controllers/authentication_controllers');
const productController = require('../controllers/product_controllers');
const userControllers = require('../controllers/user_controllers');
const bannerControllers = require('../controllers/bannerControllers');
const orderControllers = require('../controllers/orderControllers');

const middlewares = require('../controllers/middlewares');

const { storage } = middlewares;
const upload = multer({ storage });

router.get('/', adminController.adminLogin);

router.post('/', authenticationController.adminLogin);

router.get(
       '/dashboard',
       middlewares.verfiyAdminLogin,
       adminController.adminDashboard,
);

router.get(
       '/logout',
       middlewares.verfiyAdminLogin,
       authenticationController.adminLogout,
);

router.get(
       '/categories/:allOrDeleted',
       middlewares.verfiyAdminLogin,
       middlewares.verfiyAdminLogin,
       adminController.allCategories,
);

router.post(
       '/add-category',
       middlewares.verfiyAdminLogin,
       productController.addCategory,
);

router.get(
       '/delete-category/:id',
       middlewares.verfiyAdminLogin,
       productController.deleteCategory,
);

router.post(
       '/edit-category',
       middlewares.verfiyAdminLogin,
       productController.editCategory,
);

router.get(
       '/add-product',
       middlewares.verfiyAdminLogin,
       adminController.addProduct,
);

router.post(
       '/add-product',
       upload.array('product_image', 4),
       productController.addProduct,
);

router.get(
       '/products/:id',
       middlewares.verfiyAdminLogin,
       adminController.products,
);

router.get(
       '/delete-product/:id',
       middlewares.verfiyAdminLogin,
       productController.deleteProduct,
);

router.get(
       '/product/:id',
       middlewares.verfiyAdminLogin,
       productController.getProductDetails,
);

router.post(
       '/edit-product/:id',
       middlewares.verfiyAdminLogin,
       upload.array('product-image', 4),
       productController.editProduct,
);

router.get(
       '/users/:allOrBlocked',
       middlewares.verfiyAdminLogin,
       userControllers.getAllUsers,
);

router.post(
       '/blockUser',
       middlewares.verfiyAdminLogin,
       userControllers.blockUser,
);

router.get('/banners', middlewares.verfiyAdminLogin, adminController.banners);

router.post(
       '/addBanners',
       middlewares.verfiyAdminLogin,
       upload.single('banner_images'),
       adminController.addBanners,
);

router.post(
       '/updateBanner',
       middlewares.verfiyAdminLogin,
       upload.single('banner_images'),
       bannerControllers.updateBanner,
);

router.get('/coupons', middlewares.verfiyAdminLogin, adminController.coupons);

router.post(
       '/addCoupon',
       middlewares.verfiyAdminLogin,
       adminController.addCoupon,
);

router.get('/orders', middlewares.verfiyAdminLogin, adminController.orders);

router.get(
       '/orderedProducts/:id',
       middlewares.verfiyAdminLogin,
       adminController.orderDetails,
);

router.get(
       '/deletedProducts',
       middlewares.verfiyAdminLogin,
       adminController.deletedProducts,
);

router.post(
       '/deleteCoupon',
       middlewares.verfiyAdminLogin,
       adminController.deleteCoupon,
);

router.post(
       '/changeOrderStatus',
       middlewares.verfiyAdminLogin,
       orderControllers.changeOrderStatus,
);

router.get('/error500', (req, res) => {
       res.render('error/error500', { layout: 'error_layout', status: '500' });
});

router.post(
       '/readMessage',
       middlewares.verfiyAdminLogin,
       adminController.readMessage,
);

module.exports = router;
