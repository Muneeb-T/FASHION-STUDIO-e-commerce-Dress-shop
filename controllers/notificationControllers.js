/* eslint-disable indent */
const db = require('../db_config/connection');
const collections = require('../db_config/collections');


module.exports.loadNotifications = async () => {
       const reviewNotifications = await db
              .get()
              .collection(collections.REVIEW_COLLECTION)
              .aggregate([
                     {
                            $match: { read: false },
                     },

                     {
                            $lookup: {
                                   from: collections.USERS_COLLECTION,
                                   localField: 'userId',
                                   foreignField: '_id',
                                   pipeline: [
                                          {
                                                 $project: {
                                                        username: 1,
                                                        _id: 0,
                                                 },
                                          },
                                   ],
                                   as: 'user',
                            },
                     },
                     {
                            $project: {
                                   product: 1,
                                   rate_value: 1,
                                   addeDate: 1,
                                   user: { $arrayElemAt: ['$user', 0] },
                            },
                     },
              ])
              .toArray();

       return reviewNotifications;
};
