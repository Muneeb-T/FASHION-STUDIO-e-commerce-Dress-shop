const { ObjectId } = require('mongodb');

/* eslint-disable indent */
module.exports.productModal = (productDetails, files) => {
       let stock;
       if (productDetails.type === 'men' || productDetails.type === 'women') {
              stock = [
                     {
                            size: 'XS',
                            stock: parseInt(productDetails.XS),
                     },
                     {
                            size: 'S',
                            stock: parseInt(productDetails.S),
                     },
                     {
                            size: 'M',
                            stock: parseInt(productDetails.M),
                     },
                     {
                            size: 'L',
                            stock: parseInt(productDetails.L),
                     },
                     {
                            size: 'XL',
                            stock: parseInt(productDetails.XL),
                     },
                     {
                            size: '2XL',
                            stock: parseInt(productDetails['2XL']),
                     },
                     {
                            size: '3XL',
                            stock: parseInt(productDetails['3XL']),
                     },
                     {
                            size: '4XL',
                            stock: parseInt(productDetails['4XL']),
                     },
              ];
       } else {
              stock = [
                     {
                            size: '2-3Y',
                            stock: parseInt(productDetails['2-3Y']),
                     },
                     {
                            size: '3-5Y',
                            stock: parseInt(productDetails['3-5Y']),
                     },
                     {
                            size: '5-7Y',
                            stock: parseInt(productDetails['5-7Y']),
                     },
                     {
                            size: '7-9Y',
                            stock: parseInt(productDetails['7-9Y']),
                     },
                     {
                            size: '9-10Y',
                            stock: parseInt(productDetails['9-10Y']),
                     },
                     {
                            size: '10-12Y',
                            stock: parseInt(productDetails['10-12Y']),
                     },
                     {
                            size: '12-14Y',
                            stock: parseInt(productDetails['12-14Y']),
                     },
                     {
                            size: '14-16Y',
                            stock: parseInt(productDetails['14-16Y']),
                     },
              ];
       }

       const productObject = {
              product_name: productDetails.productName,
              brand: productDetails.brandName,
              type: productDetails.type,
              price: Number(productDetails.price),
              offerPercentage:
                     Number(productDetails.offerPercentage) > 0
                            ? Number(productDetails.offerPercentage)
                            : null,
              offerPrice:
                     Number(productDetails.offerPercentage) > 0
                            ? parseInt(
                                     Number(productDetails.price) -
                                            (Number(productDetails.price) *
                                                   Number(
                                                          productDetails.offerPercentage,
                                                   )) /
                                                   100,
                              )
                            : null,
              description: productDetails.description,
              category: ObjectId(productDetails.category),
              stock,
              lastModified: new Date(),
              deleted: false,
       };

       if (files) {
              if (files.length > 0) {
                     const images = [];
                     files.forEach((element) => {
                            images.push({
                                   _id: new ObjectId(),
                                   filename: element.filename,
                            });
                     });

                     productObject.images = images;
              }
       }

       return productObject;
};
