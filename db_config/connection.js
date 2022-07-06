require('dotenv').config();
const { MongoClient } = require('mongodb');

const state = {
       db: null,
};

module.exports.connect = (done) => {
       const url = process.env.MONGODB_CONNECITON_URL;
       const database = 'e-commerce-dress-shop';
       MongoClient.connect(url, (err, client) => {
              if (!err) {
                     state.db = client.db(database);
                     done();
              } else done(err);
       });
};

module.exports.get = () => state.db;
