/* eslint-disable indent */
const { ObjectId } = require('mongodb');
const db = require('../db_config/connection');
const collections = require('../db_config/collections');

module.exports.getBanners = async () => {
       const banners = await db
              .get()
              .collection(collections.ADMIN_COLLECTION)
              .aggregate([
                     { $unwind: '$banners' },
                     {
                            $project: {
                                   _id: '$banners._id',
                                   title: '$banners.title',
                                   subtitle: '$banners.subtitle',
                                   image: '$banners.image',
                            },
                     },
                     {
                            $sort: { _id: -1 },
                     },
              ])
              .toArray();
       return banners;
};

module.exports.updateBanner = async (req, res) => {
       try {
              const { bannerId, updation, title, subtitle } = req.body;

              const update = [{}];
              if (updation === 'remove') {
                     update.push({
                            $pull: {
                                   banners: { _id: ObjectId(bannerId) },
                            },
                     });
                     await updateBanner(update);
                     res.json({ updationSuccess: true });
              }

              if (updation === 'update') {
                     update.push(
                            {
                                   $set: {
                                          'banners.$[i].title': title,
                                          'banners.$[i].subtitle': subtitle,
                                   },
                            },
                            {
                                   arrayFilters: [
                                          {
                                                 'i._id': {
                                                        $eq: ObjectId(bannerId),
                                                 },
                                          },
                                   ],
                            },
                     );

                     await updateBanner(update);

                     if (req.file) {
                            update.splice(
                                   1,
                                   2,
                                   {
                                          $set: {
                                                 'banners.$[i].image':
                                                        req.file.filename,
                                          },
                                   },
                                   {
                                          arrayFilters: [
                                                 {
                                                        'i._id': {
                                                               $eq: ObjectId(
                                                                      bannerId,
                                                               ),
                                                        },
                                                 },
                                          ],
                                   },
                            );
                            await updateBanner(update);
                     }
                     res.json({ bannerAddSuccess: true, update: true });
              }

              async function updateBanner(update) {
                     await db
                            .get()
                            .collection(collections.ADMIN_COLLECTION)
                            .updateOne(...update);
              }
       } catch (error) {
              res.json({ error500: true });
       }
};
