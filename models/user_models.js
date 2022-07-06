/* eslint-disable indent */
const bcrypt = require('bcrypt');

module.exports.userModel = async (userDetails) => {
       const userObject = {
              username: userDetails.username,
              email: userDetails.email,
              phone_number: userDetails.phone_number,
              password: await bcrypt.hash(userDetails.password, 10),
              wishlist: [],
              blocked: false,
       };
       return userObject;
};
