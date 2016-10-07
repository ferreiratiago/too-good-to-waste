var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var app = express();
var io = require('socket.io-client');
var socket = io('http://127.0.0.1:9000/');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());

mongoose.connect("mongodb://localhost/products");

var ProductSchema = mongoose.Schema({
    name: String,
    quantity: Number,
    packageDate: Date,
    expirationDate: Date,
    price: Number,
});
var ShopSchema = mongoose.Schema({
    date: String,
    userId: String,
    items: [ProductSchema]
});

var Product = app.product = restful.model('product', ProductSchema)
    .methods(['get', 'post', 'put', 'delete'])
    .register(app, '/products');

var Shop = app.shop = restful.model('shop', ShopSchema)
    .methods(['get', 'post', 'put', 'delete']);
    Shop.register(app, '/shops');


function fetchExpiredItems(userId, rangeDays, callback) {
    let limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + rangeDays);

    console.log('limitDate', limitDate);

    Shop
        .find({userId, items: {$elemMatch: { expirationDate: {$lt: limitDate}}}})
        .exec((error, shops) => {
            let items;

            if (shops) {
                items = shops
                    .reduce((allItems, shop) => {
                        return allItems.concat(shop.items);
                    }, [])
                    .sort((item1, item2) => {
                        return item1 < item2;
                    });
            }

            callback(error, items);
        });
}

app.get('/expiring/:userId/', function onGetExpiring(req, res, next) {
    let userId = req.params.userId;
    let rangeDays = req.query.range || 2;

    fetchExpiredItems(userId, rangeDays, (error, expiringItems) => {
        if (error) {
            res.send(error);
        }
        res.send(JSON.stringify(expiringItems, undefined, 4));
    });
});

app.get('/notify/:userId', (req, res, next) => {
    let userId = req.params.userId;
    let rangeDays = req.query.range || 2;

    fetchExpiredItems(userId, rangeDays, (error, expiringItems) => {
        if (error) {
            res.send(error);
        }
        socket.emit('expiring', {userId, items: expiringItems});
        res.send(JSON.stringify(expiringItems, undefined, 4));
        next();
    });
});

app.listen(3000);