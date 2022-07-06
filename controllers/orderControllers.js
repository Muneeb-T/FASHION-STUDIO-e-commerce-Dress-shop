/* eslint-disable indent */
const { ObjectId } = require('mongodb');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');

module.exports.getAllOrders = async () => {
       const allOrders = await db
              .get()
              .collection(collections.ORDERS_COLLECTION)
              .aggregate([
                     {
                            $project: {
                                   address: 0,
                                   products: 0,
                            },
                     },
                     {
                            $lookup: {
                                   from: 'users',
                                   localField: 'user',
                                   foreignField: '_id',
                                   as: 'user',
                                   pipeline: [
                                          {
                                                 $project: {
                                                        username: 1,
                                                 },
                                          },
                                   ],
                            },
                     },
                     {
                            $unwind: '$user',
                     },
                     {
                            $project: {
                                   userId: '$user._id',
                                   user: '$user.username',
                                   amount: 1,
                                   paymentMethod: 1,
                                   orderStatus: 1,
                                   orderDate: 1,
                            },
                     },
              ])
              .toArray();
       return allOrders;
};

module.exports.viewOrderedProducts = async (orderId) => {
       const orderItems = await db
              .get()
              .collection(collections.ORDERS_COLLECTION)
              .aggregate([
                     {
                            $match: {
                                   _id: ObjectId(orderId),
                            },
                     },
                     {
                            $project: {
                                   products: 1,
                                   _id: 0,
                            },
                     },
                     {
                            $unwind: {
                                   path: '$products',
                            },
                     },
                     {
                            $lookup: {
                                   from: 'products',
                                   localField: 'products.product',
                                   foreignField: '_id',
                                   as: 'orderItems',
                            },
                     },
                     {
                            $project: {
                                   products: {
                                          $arrayElemAt: ['$orderItems', 0],
                                   },
                            },
                     },
                     {
                            $project: {
                                   _id: '$products._id',
                                   product_name: '$products.product_name',
                                   brand: '$products.brand',
                                   type: '$products.type',
                                   price: '$products.price',
                                   category: '$products.category',
                                   stock: '$products.stock',
                                   lastModified: '$products.lastModified',
                                   images: '$products.images',
                                   addedDate: '$products.addedDate',
                            },
                     },
                     {
                            $lookup: {
                                   from: collections.CATEGORY_COLLECTION,
                                   localField: 'category',
                                   foreignField: '_id',
                                   pipeline: [
                                          {
                                                 $project: {
                                                        _id: 0,
                                                 },
                                          },
                                   ],
                                   as: 'category',
                            },
                     },
                     {
                            $unwind: '$category',
                     },
              ])
              .toArray();
       return orderItems;
};
