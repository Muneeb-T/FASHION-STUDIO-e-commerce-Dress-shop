/* eslint-disable camelcase */
/* eslint-disable indent */
/* eslint-disable no-empty */
const { ObjectId } = require('mongodb');
const db = require('../db_config/connection');
const orderControllers = require('./orderControllers');
const collections = require('../db_config/collections');

module.exports.saveReview = async (req, res, next) => {
       try {
              console.log(req.body);
              const user = req.session.user._id;
              const { rate_value, rating_msg, comment, product_id } = req.body;
              const checkIfUserOrdered =
                     await orderControllers.checkIfUserOrdered(
                            user,
                            product_id,
                     );
              if (checkIfUserOrdered) {
                     const reviewObject = {
                            userId: ObjectId(user),
                            product: ObjectId(product_id),
                            message: rating_msg,
                            comment,
                            rate_value: parseInt(rate_value),
                            addedDate: new Date(),
                            read: false,
                     };
                     reviewObject.stars = [];
                     for (let i = 1; i <= 5; i++) {
                            if (i <= rate_value) {
                                   reviewObject.stars.push(true);
                            } else {
                                   reviewObject.stars.push(false);
                            }
                     }
                     const review = await db
                            .get()
                            .collection(collections.REVIEW_COLLECTION)
                            .insertOne(reviewObject);
                     res.json({
                            reviewSuccess: true,
                            reviewId: review.insertedId,
                            messageDetails: {
                                   username: req.session.user.username,
                                   ...reviewObject,
                            },
                     });
              } else {
                     throw { validationError: true, notOrdered: true };
              }
       } catch (error) {
              if (error.validationError) {
                     res.json(error);
              } else {
                     res.json({ error500: true });
              }
       }
};
