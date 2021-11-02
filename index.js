var express = require('express');
require('dotenv').config();
var app = express();
require('./config/database');

app.set('view engine','pug');
app.set('views','./views');

app.use('/static',express.static('public'));
//app.use('/assets',express.static('assets'));

var webRoutes = require('./routes/web-routes.js');
app.use('/',webRoutes);

app.listen(process.env.PORT);