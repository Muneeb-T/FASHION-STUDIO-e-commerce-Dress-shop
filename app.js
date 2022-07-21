/* eslint-disable indent */
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const hbs = require('express-handlebars');
const flash = require('req-flash');
const session = require('express-session');
const nocache = require('nocache');
const middlewares = require('./controllers/middlewares');

const database = require('./db_config/connection');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
       'hbs',
       hbs.engine({
              extname: 'hbs',
              layoutsDir: `${__dirname}/views/layouts/`,
              partialsDir: `${__dirname}/views/partials/`,
              helpers: {
                     inc(value, options) {
                            return parseInt(value) + 1;
                     },
                     ifeq(a, b, options) {
                            if (a && b) {
                                   if (a.toString() === b.toString()) {
                                          return options.fn(this);
                                   }
                                   return options.inverse(this);
                            }
                     },
                     ifnoteq(a, b, options) {
                            if (a && b) {
                                   if (a.toString() !== b.toString()) {
                                          return options.fn(this);
                                   }
                                   return options.inverse(this);
                            }
                     },
              },
       }),
);

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
       session({
              secret: process.env.SESSSION_SECRET,
              resave: false,
              saveUninitialized: false,
              cookie: { maxAge: 6000000 },
       }),
);

app.use(middlewares.registerGuestUser);

app.use((req, res, next) => {
       res.locals.session = req.session;
       next();
});

app.use(flash());
app.use(nocache());

database.connect((err) => {
       if (!err) console.log('Database connection success');
       else console.log('Database connection failed');
});

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
       _res.render('error/error404', { layout: 'error_layout', status: '404' });
});

// error handler
app.use((err, req, res, next) => {
       console.log(err)
       res.render('error/error500', { layout: 'error_layout', status: '500' });
});

module.exports = app;
