/* eslint-disable radix */
/* eslint-disable no-throw-literal */
/* eslint-disable indent */
const { ObjectId } = require('mongodb');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');
const { productModal } = require('../models/product_models');

module.exports.allCategories = async (allOrDeleted) => {
       const find = { deleted: allOrDeleted !== 'all' };
       const categories = await db
              .get()
              .collection(collections.CATEGORY_COLLECTION)
              .find(find)
              .toArray();
       return categories;
};

module.exports.addCategory = async (req, res) => {
       try {
              const { category } = req.body;
              const categoryExist = await db
                     .get()
                     .collection(collections.CATEGORY_COLLECTION)
                     .findOne({ name: category });

              if (categoryExist) {
                     if (categoryExist.deleted === false) {
                            throw 'Category already exist';
                     } else {
                            await db
                                   .get()
                                   .collection(collections.CATEGORY_COLLECTION)
                                   .updateOne(
                                          {
                                                 name: category,
                                          },
                                          {
                                                 $set: {
                                                        deleted: false,
                                                 },
                                          },
                                   );
                     }
              } else {
                     await db
                            .get()
                            .collection(collections.CATEGORY_COLLECTION)
                            .insertOne({
                                   name: category,
                                   deleted: false,
                            });
              }
              res.json({ addCateogrySuccess: true });
       } catch (error) {
              res.json({ addCateogrySuccess: false, message: error });
       }
};

module.exports.deleteCategory = async (req, res) => {
       const categoryId = req.params.id;

       await db
              .get()
              .collection(collections.CATEGORY_COLLECTION)
              .updateOne({ _id: ObjectId(categoryId) }, [
                     { $set: { deleted: { $eq: [false, '$deleted'] } } },
              ]);
       res.json({ deleted: true });
};

module.exports.editCategory = async (req, res) => {
       try {
              const { categoryId, name } = req.body;

              const categoryExist = await db
                     .get()
                     .collection(collections.CATEGORY_COLLECTION)
                     .find({ $or: [{ _id: ObjectId(categoryId) }, { name }] })
                     .toArray();
              if (categoryExist.length !== 1) throw new Error();
              await db
                     .get()
                     .collection(collections.CATEGORY_COLLECTION)
                     .updateOne(
                            { _id: ObjectId(categoryId) },
                            { $set: { name } },
                     );

              res.json({ updationSuccess: true });
       } catch (error) {
              res.json({ updationSuccess: false });
       }
};

module.exports.addProduct = async (req, res) => {
       const product = productModal(req.body, req.files);
       product.addedDate = new Date();

       await db
              .get()
              .collection(collections.PRODUCT_COLLECTION)
              .insertOne(product);
       res.json({ productAddSuccess: true });
};

module.exports.allProducts = async (categoryId) => {
       let filter;

       if (categoryId === 'deleted') {
              filter = {
                     $match: { deleted: true },
              };
       } else if (categoryId === 'all') {
              filter = {
                     $match: { deleted: false },
              };
       } else {
              filter = {
                     $match: {
                            deleted: false,
                            category: ObjectId(categoryId),
                     },
              };
       }

       const products = await db
              .get()
              .collection(collections.PRODUCT_COLLECTION)
              .aggregate([
                     {
                            ...filter,
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
                     {
                            $match: { 'category.deleted': false },
                     },
              ])
              .toArray();
       console.log(products);
       return products;
};

module.exports.deleteProduct = async (req, res) => {
       const productId = req.params.id;
       await db
              .get()
              .collection(collections.PRODUCT_COLLECTION)
              .updateOne(
                     {
                            _id: ObjectId(productId),
                     },
                     [{ $set: { deleted: { $eq: [false, '$deleted'] } } }],
              );
       res.json({ deleted: true });
       // res.redirect('/admin/products/all');
};

module.exports.getProductDetails = async (req, res) => {
       const productId = req.params.id;
       const categories = await this.allCategories('all');
       console.log(categories);

       const [product] = [
              await db
                     .get()
                     .collection(collections.PRODUCT_COLLECTION)
                     .aggregate([
                            {
                                   $match: { _id: ObjectId(productId) },
                            },
                            {
                                   $lookup: {
                                          from: collections.CATEGORY_COLLECTION,
                                          localField: 'category',
                                          foreignField: '_id',
                                          pipeline: [
                                                 {
                                                        $project: {
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
                     ])
                     .toArray(),
       ][0];
       console.log(product);

       res.render('admin/product-details', {
              layout: 'admin_layout',
              admin: true,
              productViewOrEditPage: true,
              product,
              categories,
       });
};

module.exports.editProduct = async (req, res) => {
       const productId = ObjectId(req.params.id);

       const product = productModal(req.body);
       let imagesIds = req.body.updateImageIds;
       if (!Array.isArray(imagesIds)) {
              imagesIds = [imagesIds];
       }

       console.log(req.body);

       imagesIds = imagesIds.filter((val) => val !== '');
       imagesIds = imagesIds.map((id) => ObjectId(id));

       const images = [];
       if (req.files) {
              if (req.files.length > 0) {
                     req.files.forEach((element, index) => {
                            images.push({
                                   _id: imagesIds[index],
                                   filename: element.filename,
                            });
                     });
              }
       }

       await db
              .get()
              .collection(collections.PRODUCT_COLLECTION)
              .updateOne(
                     {
                            _id: ObjectId(productId),
                     },

                     {
                            $set: {
                                   ...product,
                            },

                            $pull: {
                                   images: { _id: { $in: imagesIds } },
                            },
                     },
              );

       await db
              .get()
              .collection(collections.PRODUCT_COLLECTION)
              .updateOne(
                     {
                            _id: ObjectId(productId),
                     },
                     {
                            $push: {
                                   images: { $each: images },
                            },
                     },
              );

       res.json({ productEditSuccess: true });
};

// users

module.exports.getProducts = async (
       type,
       filterQuery,
       userId,
       guest,
       guestWishlist,
) => {
       const filter =
              type === 'all'
                     ? {
                              $match: { $and: [{ deleted: false }] },
                       }
                     : {
                              $match: {
                                     $and: [{ deleted: false }, { type }],
                              },
                       };

       if (filterQuery.categories) {
              if (!Array.isArray(filterQuery.categories)) {
                     filterQuery.categories = [filterQuery.categories];
              }
              filterQuery.categories.forEach((category) => {
                     if (!filter.$match.$or) filter.$match.$or = [];
                     filter.$match.$or.push({ category: ObjectId(category) });
              });
       }

       if (filterQuery.priceRange) {
              const priceRange = JSON.parse(filterQuery.priceRange);
              if (priceRange.max === 'max') {
                     filter.$match.price = { $gte: priceRange.min };
              } else {
                     filter.$match.$and.push(
                            { price: { $gte: priceRange.min } },
                            { price: { $lte: priceRange.max } },
                     );
              }
       }

       const aggregate = [
              {
                     ...filter,
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
              {
                     $match: { 'category.deleted': false },
              },
              {
                     $project: {
                            product_name: 1,
                            brand: 1,
                            category: '$category.name',
                            price: 1,
                            images: 1,
                     },
              },
       ];

       if (
              filterQuery.price &&
              (filterQuery.price === '-1' || filterQuery.price === '1')
       ) {
              aggregate.push({ $sort: { price: parseInt(filterQuery.price) } });
       }

       if (userId) {
              if (!guest) {
                     aggregate.push({
                            $lookup: {
                                   from: collections.USERS_COLLECTION,
                                   let: { product: '$_id' },
                                   pipeline: [
                                          { $match: { _id: ObjectId(userId) } },
                                          {
                                                 $addFields: {
                                                        wishlisted: {
                                                               $in: [
                                                                      '$$product',
                                                                      '$wishlist',
                                                               ],
                                                        },
                                                 },
                                          },
                                          {
                                                 $project: {
                                                        _id: 0,
                                                        wishlisted: 1,
                                                 },
                                          },
                                   ],
                                   as: 'wishlisted',
                            },
                     });

                     aggregate.push({ $unwind: '$wishlisted' });
                     aggregate[4].$project.wishlisted = 1;
              } else {
                     guestWishlist = guestWishlist.map((productId) =>
                            ObjectId(productId),
                     );
                     aggregate.push({
                            $addFields: {
                                   wishlisted: {
                                          wishlisted: {
                                                 $in: ['$_id', guestWishlist],
                                          },
                                   },
                            },
                     });
                     aggregate[4].$project.wishlisted = 1;
              }
       }

       if (filterQuery.randomProducts) {
              aggregate.unshift({
                     $sample: { size: 10 },
              });
       }
       // if (filterQuery.recommended) {
       // }
       if (filterQuery.newProducts) {
              aggregate.splice(
                     1,
                     0,
                     {
                            $sort: { addedDate: -1 },
                     },
                     {
                            $limit: 12,
                     },
              );
       }

       const products = await db
              .get()
              .collection(collections.PRODUCT_COLLECTION)
              .aggregate(aggregate)
              .toArray();
       console.log(products);
       return products;
};

module.exports.getSingleProductDetails = async (
       productId,
       userId,
       guest,
       guestWishlist,
) => {
       const aggregate = [
              {
                     $match: { _id: ObjectId(productId) },
              },
              {
                     $lookup: {
                            from: collections.CATEGORY_COLLECTION,
                            localField: 'category',
                            foreignField: '_id',
                            pipeline: [
                                   {
                                          $project: {
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
                            addedDate: 0,
                            deleted: 0,
                     },
              },
              {
                     $project: {
                            product_name: 1,
                            brand: 1,
                            type: 1,
                            price: 1,
                            description: 1,
                            category: 1,
                            images: 1,
                            sizes: {
                                   $filter: {
                                          input: '$stock',
                                          as: 'stock',
                                          cond: {
                                                 $ne: ['$$stock.stock', 0],
                                          },
                                   },
                            },
                     },
              },
       ];

       if (userId) {
              if (!guest) {
                     aggregate.push({
                            $lookup: {
                                   from: collections.USERS_COLLECTION,
                                   let: { product: '$_id' },
                                   pipeline: [
                                          { $match: { _id: ObjectId(userId) } },
                                          {
                                                 $addFields: {
                                                        wishlisted: {
                                                               $in: [
                                                                      '$$product',
                                                                      '$wishlist',
                                                               ],
                                                        },
                                                 },
                                          },
                                          {
                                                 $project: {
                                                        _id: 0,
                                                        wishlisted: 1,
                                                 },
                                          },
                                   ],
                                   as: 'wishlisted',
                            },
                     });

                     aggregate.push({ $unwind: '$wishlisted' });
                     aggregate[4].$project.wishlisted = 1;
              } else {
                     guestWishlist = guestWishlist.map((productId) =>
                            ObjectId(productId),
                     );
                     aggregate.push({
                            $addFields: {
                                   wishlisted: {
                                          wishlisted: {
                                                 $in: ['$_id', guestWishlist],
                                          },
                                   },
                            },
                     });
                     aggregate[4].$project.wishlisted = 1;
              }
       }

       const [product] = [
              await db
                     .get()
                     .collection(collections.PRODUCT_COLLECTION)
                     .aggregate(aggregate)
                     .toArray(),
       ][0];
       console.log(product);
       return product;
};

module.exports.addToWishlist = async (req, res) => {
       const { product } = req.body;
       const { _id, guest } = req.session.user;

       if (guest) {
              const { wishlist } = req.session.user;
              const ifExist = wishlist.indexOf(product);
              if (ifExist === -1) {
                     req.session.user.wishlist.push(product);
                     req.session.user.wishlistCount += 1;
                     res.json({ inc: 1 });
              } else {
                     req.session.user.wishlist.pop(ObjectId(product));
                     req.session.user.wishlistCount += -1;
                     res.json({ inc: -1 });
              }
       } else {
              const update = await db
                     .get()
                     .collection(collections.USERS_COLLECTION)
                     .updateOne(
                            { _id: ObjectId(_id) },
                            {
                                   $addToSet: { wishlist: ObjectId(product) },
                            },
                     );
              if (update.modifiedCount === 0) {
                     await db
                            .get()
                            .collection(collections.USERS_COLLECTION)
                            .updateOne(
                                   { _id: ObjectId(_id) },
                                   {
                                          $pull: {
                                                 wishlist: ObjectId(product),
                                          },
                                   },
                            );
                     req.session.user.wishlistCount += -1;
                     res.json({ inc: -1 });
              } else {
                     req.session.user.wishlistCount += 1;
                     res.json({ inc: 1 });
              }
       }
};

module.exports.getWishlist = async function (userId, guest, guestWishlist) {
       if (guest) {
              guestWishlist = guestWishlist.map((productId) =>
                     ObjectId(productId),
              );
              const wishlist = await db
                     .get()
                     .collection(collections.PRODUCT_COLLECTION)
                     .aggregate([
                            {
                                   $match: {
                                          $expr: {
                                                 $in: ['$_id', guestWishlist],
                                          },
                                   },
                            },
                            {
                                   $project: {
                                          product_name: 1,
                                          brand: 1,
                                          price: 1,
                                          images: 1,
                                   },
                            },
                     ])
                     .toArray();
              console.log(wishlist);
              return wishlist;
       }
       const wishlist = await db
              .get()
              .collection(collections.USERS_COLLECTION)
              .aggregate([
                     {
                            $match: { _id: ObjectId(userId) },
                     },
                     {
                            $project: {
                                   _id: 0,
                                   wishlist: 1,
                            },
                     },
                     {
                            $lookup: {
                                   from: collections.PRODUCT_COLLECTION,
                                   localField: 'wishlist',
                                   foreignField: '_id',
                                   pipeline: [
                                          {
                                                 $project: {
                                                        product_name: 1,
                                                        brand: 1,
                                                        price: 1,
                                                        images: 1,
                                                 },
                                          },
                                   ],
                                   as: 'wishlist',
                            },
                     },
              ])
              .toArray();
       return wishlist[0].wishlist;
};

module.exports.addToBag = async (req, res) => {
       const { productCount, productId } = req.body;
       const { size } = req.body;
       const user = req.session.user._id;
       const count = parseInt(productCount);

       const { guest, cart } = req.session.user;

       const response = { success: true };

       if (guest) {
              const itemExist = cart.products.findIndex(
                     (cartItem) =>
                            cartItem._id === productId &&
                            cartItem.size === size,
              );

              if (itemExist === -1) {
                     req.session.user.cart.products.push({
                            _id: productId,
                            size,
                            count,
                     });
                     req.session.user.cartCount += 1;
                     response.added = true;
              } else {
                     req.session.user.cart.products[itemExist].count += 1;
              }
       } else {
              const cartExist = await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .findOne({ user: ObjectId(user) });
              if (cartExist) {
                     const update = await cartFunctions.cartExist(
                            user,
                            size,
                            count,
                            productId,
                     );
                     if (update.modifiedCount === 0) {
                            await cartFunctions.cartExistProductNotExist(
                                   user,
                                   size,
                                   count,
                                   productId,
                            );
                            req.session.user.cartCount += 1;
                            response.added = true;
                     }
              } else {
                     await cartFunctions.cartNotExist(
                            user,
                            size,
                            count,
                            productId,
                     );
                     req.session.user.cartCount += 1;
                     response.added = true;
              }
       }

       res.json(response);
};

module.exports.cartDetails = async (userId, guest, guestCart) => {
       if (guest) {
              const productIds = [];
              for (const product of guestCart.products) {
                     productIds.push(ObjectId(product._id));
              }
              const products = await db
                     .get()
                     .collection(collections.PRODUCT_COLLECTION)
                     .aggregate([
                            {
                                   $match: {
                                          $expr: { $in: ['$_id', productIds] },
                                   },
                            },
                            {
                                   $project: {
                                          product_name: 1,
                                          brand: 1,
                                          type: 1,
                                          price: 1,
                                          category: 1,
                                          image: {
                                                 $arrayElemAt: ['$images', 0],
                                          },
                                          sizes: {
                                                 $filter: {
                                                        input: '$stock',
                                                        as: 'stock',
                                                        cond: {
                                                               $ne: [
                                                                      '$$stock.stock',
                                                                      0,
                                                               ],
                                                        },
                                                 },
                                          },
                                   },
                            },
                     ])
                     .toArray();

              const cartItems = [];
              guestCart.products.forEach((element) => {
                     const productObject = {
                            _id: ObjectId(element._id),
                            size: element.size,
                            count: element.count,
                     };
                     const bagItem = products.filter(
                            (product) =>
                                   ObjectId(element._id).toString() ===
                                   ObjectId(product._id).toString(),
                     );
                     // const sizeIndex = bagItem[0].sizes.findIndex(
                     //        (size) => size.size === element.size,
                     // );
                     // console.log(sizeIndex)

                     // bagItem[0].sizes.splice(sizeIndex, 1);

                     productObject.bagItem = bagItem[0];

                     productObject.total = bagItem[0].price * element.count;

                     cartItems.push(productObject);
              });

              const totalPrice = cartItems.reduce(
                     (total, item) => total + item.total,
                     0,
              );

              const cartSubtotal = { totalPrice };
              return [cartItems, cartSubtotal];
       }
       const aggregate = [
              {
                     $match: { user: ObjectId(userId) },
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
                                                 product_name: 1,
                                                 brand: 1,
                                                 type: 1,
                                                 price: 1,
                                                 category: 1,
                                                 image: {
                                                        $arrayElemAt: [
                                                               '$images',
                                                               0,
                                                        ],
                                                 },
                                                 sizes: {
                                                        $filter: {
                                                               input: '$stock',
                                                               as: 'stock',
                                                               cond: {
                                                                      $ne: [
                                                                             '$$stock.stock',
                                                                             0,
                                                                      ],
                                                               },
                                                        },
                                                 },
                                          },
                                   },
                            ],
                            as: 'bagItem',
                     },
              },
              {
                     $project: {
                            size: 1,
                            count: 1,
                            bagItem: { $arrayElemAt: ['$bagItem', 0] },
                     },
              },
              {
                     $set: {
                            'bagItem.sizes': {
                                   $filter: {
                                          input: '$bagItem.sizes',
                                          cond: {
                                                 $ne: ['$$this.size', '$size'],
                                          },
                                   },
                            },
                     },
              },
              {
                     $addFields: {
                            total: {
                                   $multiply: ['$count', '$bagItem.price'],
                            },
                     },
              },
       ];

       const cartDetails = await db
              .get()
              .collection(collections.CART_COLLECTION)
              .aggregate(aggregate)
              .toArray();

       console.log(cartDetails);

       aggregate.push({
              $group: {
                     _id: null,
                     totalPrice: {
                            $sum: {
                                   $multiply: ['$count', '$bagItem.price'],
                            },
                     },
              },
       });
       const [cartSubtotal] = [
              await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .aggregate(aggregate)
                     .toArray(),
       ][0];

       return [cartDetails, cartSubtotal];
};

module.exports.updateCart = async (req, res) => {
       console.log(req.body);

       const { credential, size, productId, inc } = req.body;
       const user = req.session.user._id;
       const { guest, cart } = req.session.user;

       const responseObject = {
              updationSuccess: true,
       };

       const arrayFilters = {
              arrayFilters: [
                     {
                            'i._id': {
                                   $eq: ObjectId(productId),
                            },
                            'i.size': { $eq: size },
                     },
              ],
       };

       const object = [{ user: ObjectId(user) }];
       if (credential === 'count') {
              if (!guest) {
                     object.splice(1, 0, {
                            $inc: { 'products.$[i].count': parseInt(inc) },
                     });
                     object.push(arrayFilters);
                     await updateCart(object);
              } else {
                     console.log(cart);
                     for (const [i, product] of cart.products.entries()) {
                            if (
                                   ObjectId(product._id).toString() ===
                                          ObjectId(productId).toString() &&
                                   product.size === size
                            ) {
                                   req.session.user.cart.products[i].count +=
                                          parseInt(inc);

                                   break;
                            }
                     }
              }
       }

       if (credential === 'size') {
              if (!guest) {
                     const productWithSizeExist = await db
                            .get()
                            .collection(collections.CART_COLLECTION)
                            .aggregate([
                                   {
                                          $match: {
                                                 user: ObjectId(user),
                                          },
                                   },
                                   {
                                          $unwind: '$products',
                                   },
                                   {
                                          $match: {
                                                 $and: [
                                                        {
                                                               'products.size':
                                                                      inc,
                                                        },
                                                        {
                                                               'products._id':
                                                                      ObjectId(
                                                                             productId,
                                                                      ),
                                                        },
                                                 ],
                                          },
                                   },
                                   {
                                          $project: {
                                                 _id: 0,
                                                 size: '$products.size',
                                                 count: '$products.count',
                                          },
                                   },
                            ])
                            .toArray();

                     if (productWithSizeExist.length !== 0) {
                            object[1] = {
                                   $pull: {
                                          products: {
                                                 _id: ObjectId(productId),
                                                 size: productWithSizeExist[0]
                                                        .size,
                                          },
                                   },
                            };
                            await updateCart(object);

                            object[1] = {
                                   $set: {
                                          'products.$[i].size': inc,
                                   },
                                   $inc: {
                                          'products.$[i].count':
                                                 productWithSizeExist[0].count,
                                   },
                            };

                            object.push(arrayFilters);
                            await updateCart(object);
                            req.session.user.cartCount -= 1;
                            responseObject.changeCount = true;
                     } else {
                            object[1] = {
                                   $set: {
                                          'products.$[i].size': inc,
                                   },
                            };
                            object.push(arrayFilters);
                            await updateCart(object);
                     }
              } else {
                     const productIndex = cart.products.findIndex(
                            (product) =>
                                   ObjectId(product._id).toString() ===
                                          ObjectId(productId).toString() &&
                                   product.size === size,
                     );

                     if (productIndex !== -1) {
                            const existingProduct = cart.products[productIndex];
                            req.session.user.cart.products.splice(
                                   productIndex,
                                   1,
                            );
                            const updateIndex = cart.products.findIndex(
                                   (product) =>
                                          ObjectId(product._id).toString() ===
                                                 ObjectId(
                                                        productId,
                                                 ).toString() &&
                                          product.size === inc,
                            );
                            req.session.user.cart.products[updateIndex].count +=
                                   existingProduct.count;
                            req.session.user.cartCount -= 1;
                            responseObject.changeCount = true;
                     } else {
                            const updateIndex = cart.products.findIndex(
                                   (product) =>
                                          ObjectId(product._id).toString() ===
                                                 ObjectId(
                                                        productId,
                                                 ).toString() &&
                                          product.size === size,
                            );
                            req.session.user.cart.products[updateIndex].size =
                                   inc;
                     }
              }
       }

       if (credential === 'remove') {
              if (!guest) {
                     object.push({
                            $pull: {
                                   products: {
                                          _id: ObjectId(productId),
                                          size,
                                   },
                            },
                     });

                     await updateCart(object);
                     req.session.user.cartCount -= 1;
                     responseObject.changeCount = true;
              } else {
                     const productIndex = cart.products.indexOf(
                            (product) =>
                                   ObjectId(product._id).toString() ===
                                          ObjectId(productId) &&
                                   product.size === size,
                     );
                     req.session.user.cart.products.splice(productIndex, 1);
                     req.session.user.cartCount -= 1;
                     responseObject.changeCount = true;
              }
       }

       async function updateCart(object) {
              await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .updateOne(...object);
       }
       res.json(responseObject);
};

module.exports.mergeGuestUser = async (guestWishlist, guestCart, userId) => {
       guestWishlist = guestWishlist.map((productId) => ObjectId(productId));

       const guestCartItems = guestCart.products.map((product) => ({
              _id: ObjectId(product._id),
              size: product.size,
              count: product.count,
       }));

       console.log(guestCartItems);

       await db
              .get()
              .collection(collections.USERS_COLLECTION)
              .updateOne(
                     { _id: ObjectId(userId) },
                     {
                            $addToSet: {
                                   wishlist: {
                                          $each: guestWishlist,
                                   },
                            },
                     },
              );

       const userCart = await db
              .get()
              .collection(collections.CART_COLLECTION)
              .findOne({ user: ObjectId(userId) });
       if (!userCart) {
              await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .insertOne({
                            user: ObjectId(userId),
                            products: guestCartItems,
                     });
       }

       guestCart.products.forEach(async (cartItem) => {
              const update = await cartFunctions.cartExist(
                     userId,
                     cartItem.size,
                     cartItem.count,
                     cartItem._id,
              );
              if (update.modifiedCount === 0) {
                     await cartFunctions.cartExistProductNotExist(
                            userId,
                            cartItem.size,
                            cartItem.count,
                            cartItem._id,
                     );
              }
       });
};

const cartFunctions = {
       cartExist: async (user, size, count, productId) => {
              const update = await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .updateOne(
                            {
                                   user: ObjectId(user),
                            },
                            {
                                   $set: {
                                          'products.$[i].size': size,
                                   },
                                   $inc: { 'products.$[i].count': count },
                            },
                            {
                                   arrayFilters: [
                                          {
                                                 'i._id': {
                                                        $eq: ObjectId(
                                                               productId,
                                                        ),
                                                 },
                                                 'i.size': { $eq: size },
                                          },
                                   ],
                            },
                     );
              return update;
       },
       cartExistProductNotExist: async (user, size, count, productId) => {
              await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .updateOne(
                            { user: ObjectId(user) },
                            {
                                   $push: {
                                          products: {
                                                 _id: ObjectId(productId),
                                                 size,
                                                 count,
                                          },
                                   },
                            },
                     );
       },
       cartNotExist: async (user, size, count, productId) => {
              await db
                     .get()
                     .collection(collections.CART_COLLECTION)
                     .insertOne({
                            user: ObjectId(user),
                            products: [
                                   {
                                          _id: ObjectId(productId),
                                          size,
                                          count,
                                   },
                            ],
                     });
       },
};
