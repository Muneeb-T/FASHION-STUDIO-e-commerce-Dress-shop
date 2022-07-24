/* eslint-disable indent */
const { ObjectId } = require('mongodb');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');

module.exports.getAllOrders = async (limit) => {
       const aggregate = [
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
                            totalPrice: 1,
                            discount: 1,
                            amountPayable: 1,
                            paymentMethod: 1,
                            orderStatus: 1,
                            orderDate: {
                                   $dateToString: {
                                          format: '%d-%m-%Y',
                                          date: '$orderDate',
                                   },
                            },
                     },
              },
              {
                     $sort: { _id: -1 },
              },
       ];
       if (limit) {
              aggregate.push({ $limit: limit });
       }
       const allOrders = await db
              .get()
              .collection(collections.ORDERS_COLLECTION)
              .aggregate(aggregate)
              .toArray();
       return allOrders;
};

module.exports.orderDetails = async (orderId) => {
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
                            $unwind: {
                                   path: '$products',
                            },
                     },
                     {
                            $project: {
                                   _id: 1,
                                   product: '$products.product',
                                   totalPrice: '$products.totalPrice',
                                   isCanceled: '$products.isCanceled',
                                   size: '$products.size',
                                   quantity: '$products.count',
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
                                                        product_name: 1,
                                                        brand: 1,
                                                        type: 1,
                                                        category: 1,
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
                                                        image: {
                                                               $arrayElemAt: [
                                                                      '$images',
                                                                      0,
                                                               ],
                                                        },
                                                 },
                                          },
                                          {
                                                 $lookup: {
                                                        from: 'categories',
                                                        localField: 'category',
                                                        foreignField: '_id',
                                                        pipeline: [
                                                               {
                                                                      $project: {
                                                                             _id: 0,
                                                                             name: 1,
                                                                      },
                                                               },
                                                        ],
                                                        as: 'category',
                                                 },
                                          },
                                          {
                                                 $unwind: '$category',
                                          },
                                          {
                                                 $project: {
                                                        category: 1,
                                                        product_name: 1,
                                                        brand: 1,
                                                        type: 1,
                                                        price: 1,
                                                        image: '$image.filename',
                                                 },
                                          },
                                   ],
                                   as: 'product',
                            },
                     },
                     {
                            $project: {
                                   _id: 1,
                                   totalPrice: 1,
                                   size: 1,
                                   quantity: 1,
                                   isCanceled: 1,
                                   product: {
                                          $arrayElemAt: ['$product', 0],
                                   },
                            },
                     },
                     {
                            $sort: {
                                   _id: -1,
                            },
                     },
              ])
              .toArray();

       const orderDetails = await db
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
                                   products: 0,
                            },
                     },
                     {
                            $lookup: {
                                   from: collections.ADDRESS_COLLECTION,
                                   localField: 'address',
                                   foreignField: '_id',
                                   pipeline: [
                                          {
                                                 $project: {
                                                        user: 0,
                                                 },
                                          },
                                   ],
                                   as: 'address',
                            },
                     },
                     {
                            $lookup: {
                                   from: collections.USERS_COLLECTION,
                                   localField: 'user',
                                   foreignField: '_id',
                                   pipeline: [
                                          {
                                                 $project: {
                                                        username: 1,
                                                 },
                                          },
                                   ],
                                   as: 'username',
                            },
                     },
                     {
                            $project: {
                                   user: 1,
                                   totalPrice: 1,
                                   discount: 1,
                                   amountPayable: 1,
                                   paymentMethod: 1,
                                   orderStatus: 1,
                                   orderDate: {
                                          $dateToString: {
                                                 format: '%d-%m-%Y',
                                                 date: '$orderDate',
                                          },
                                   },
                                   address: {
                                          $arrayElemAt: ['$address', 0],
                                   },
                                   username: {
                                          $arrayElemAt: ['$username', 0],
                                   },
                            },
                     },
              ])
              .toArray();
       return [orderItems, orderDetails[0]];
};

module.exports.usersOrdersList = async (user) => {
       const orders = await db
              .get()
              .collection(collections.ORDERS_COLLECTION)
              .aggregate([
                     {
                            $match: { user: ObjectId(user) },
                     },
                     {
                            $lookup: {
                                   from: collections.ADDRESS_COLLECTION,
                                   localField: 'address',
                                   foreignField: '_id',
                                   as: 'address',
                            },
                     },
                     {
                            $project: {
                                   _id: 1,
                                   orderDate: {
                                          $dateToString: {
                                                 format: '%d-%m-%Y',
                                                 date: '$orderDate',
                                          },
                                   },
                                   amountPayable: 1,
                                   paymentMethod: 1,
                                   orderStatus: 1,
                                   address: {
                                          $arrayElemAt: ['$address', 0],
                                   },
                            },
                     },
                     {
                            $sort: { _id: -1 },
                     },
              ])
              .toArray();
       return orders;
};

module.exports.usersOrderDetails = async (orderId) => {
       const orderDetails = await db
              .get()
              .collection(collections.ORDERS_COLLECTION)
              .aggregate([
                     {
                            $match: {
                                   _id: ObjectId(orderId),
                            },
                     },
                     {
                            $unwind: {
                                   path: '$products',
                            },
                     },
                     {
                            $project: {
                                   _id: 1,
                                   product: '$products.product',
                                   totalPrice: '$products.totalPrice',
                                   size: '$products.size',
                                   quantity: '$products.count',
                                   address: 1,
                                   paymentMethod: 1,
                                   orderStatus: 1,
                                   orderDate: 1,
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
                                                        product_name: 1,
                                                        brand: 1,
                                                        type: 1,
                                                        category: 1,
                                                        image: {
                                                               $arrayElemAt: [
                                                                      '$images',
                                                                      0,
                                                               ],
                                                        },
                                                 },
                                          },
                                          {
                                                 $lookup: {
                                                        from: 'categories',
                                                        localField: 'category',
                                                        foreignField: '_id',
                                                        pipeline: [
                                                               {
                                                                      $project: {
                                                                             _id: 0,
                                                                             name: 1,
                                                                      },
                                                               },
                                                        ],
                                                        as: 'category',
                                                 },
                                          },
                                          {
                                                 $unwind: '$category',
                                          },
                                          {
                                                 $project: {
                                                        category: 1,
                                                        product_name: 1,
                                                        brand: 1,
                                                        type: 1,
                                                        image: '$image.filename',
                                                 },
                                          },
                                   ],
                                   as: 'product',
                            },
                     },
                     {
                            $project: {
                                   _id: 1,
                                   address: 1,
                                   paymentMethod: 1,
                                   orderStatus: 1,
                                   orderDate: 1,
                                   totalPrice: 1,
                                   size: 1,
                                   quantity: 1,
                                   isCanceled: 1,
                                   product: {
                                          $arrayElemAt: ['$product', 0],
                                   },
                            },
                     },
                     {
                            $sort: {
                                   _id: -1,
                            },
                     },
              ])
              .toArray();
       return orderDetails;
};

module.exports.changeOrderStatus = async (req, res) => {
       try {
              const { orderId, status } = req.body;
              if (status === 'Cancelled') {
                     await db
                            .get()
                            .collection(collections.ORDERS_COLLECTION)
                            .updateOne(
                                   { _id: ObjectId(orderId) },
                                   {
                                          $set: {
                                                 orderStatus: status,
                                                 'products.$[].isCanceled': true,
                                          },
                                   },
                            );
              } else {
                     await db
                            .get()
                            .collection(collections.ORDERS_COLLECTION)
                            .updateOne(
                                   { _id: ObjectId(orderId) },
                                   { $set: { orderStatus: status } },
                            );
              }

              res.json({ orderStatusChangeSuccess: true });
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.cancelOrder = async (req, res) => {
       try {
              const { orderId } = req.body;

              const products = await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .aggregate([
                            {
                                   $match: { _id: ObjectId(orderId) },
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
                                   $replaceRoot: { newRoot: '$products' },
                            },
                     ])
                     .toArray();

              products.forEach(async (product) => {
                     await db
                            .get()
                            .collection(collections.PRODUCT_COLLECTION)
                            .updateOne(
                                   { _id: ObjectId(product.product) },
                                   {
                                          $inc: {
                                                 'stock.$[i].stock':
                                                        product.count,
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

              await db
                     .get()
                     .collection(collections.ORDERS_COLLECTION)
                     .updateOne(
                            { _id: ObjectId(orderId) },
                            {
                                   $set: {
                                          orderStatus: 'Cancelled',
                                   },
                            },
                     );
              res.json({ orderCancelsuccess: true });
       } catch (error) {
              res.json({ error500: true });
       }
};

module.exports.checkIfUserOrdered = async (user, product) => {
       const isUserOrdered = await db
              .get()
              .collection(collections.ORDERS_COLLECTION)
              .aggregate([
                     {
                            $match: {
                                   $and: [
                                          { user: ObjectId(user) },
                                          {
                                                 $or: [
                                                        {
                                                               orderStatus:
                                                                      'Delivered',
                                                        },
                                                        {
                                                               orderStatus:
                                                                      'Cancelled',
                                                        },
                                                 ],
                                          },
                                   ],
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
                            $match: {
                                   'products.product': ObjectId(product),
                            },
                     },
              ])
              .toArray();

       if (isUserOrdered && isUserOrdered.length > 0) {
              return true;
       }
       return false;
};
