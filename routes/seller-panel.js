/*
    Things to be fixed:
        - JSON sends the codes of some characters such as space is sent as %20
          This code is replacing the case of space only. A more generic approach must
          be implemented to prevent displaying weird text to user.
 */


let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let sanitize = require("mongo-sanitize");
let dbDetails = require('../config/database-settings');

let ProductSchema = new mongoose.Schema({
     seller: {
        type: String,
        trim: true,
        require: true
     },
     name: {
        unique: true,
        type: String,
        trim: true,
        require: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        require: true
    },
    imagePath: {
        type: String,
        trim: true
    }
});

router.all('/', (req, res)=>{
        try{
            if(req.session.role === 'seller') {
                res.render('seller-panel', {username: req.session.username});
                res.end();
            }
            else {
                res.render('restricted-page');
                res.end();
            }
        }
        catch(err){
            res.render('restricted-page');
            res.end();
        }
    }
);

router.post('/add-product', (req, res)=>{

    let data = req.body.data.split('&');
    let seller = data[0].split('=')[1].replaceAll('%20', ' ');
    let name = data[1].split('=')[1].replaceAll('%20', ' ');
    let description = data[2].split('=')[1].replaceAll('%20', ' ');
    let price = data[3].split('=')[1].replaceAll('%20', ' ');
    let category = data[4].split('=')[1].replace('%20', ' ');

    mongoose.connect(dbDetails.dbURL, {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });

    let Product = mongoose.model('product_model', ProductSchema, 'product');
    let newProduct = Product({seller: seller, name: name, description: description, price: price, category: category});
    try {
        newProduct.save(function (err) {
            if (err) {
                console.log(err);
                res.json({status: 'fail'});
            }
            else{
                res.json({status: 'success'});
            }
        });
    }
    catch{}
});

router.post('/delete-product', (req, res)=>{
    console.log(req.body);
    let productDetails = {};
    if (req.body.fullData) {
        productDetails = req.body.data;
    }
    else {
        let data = req.body.data.split('&');
        productDetails.seller = data[0].split('=')[1].replaceAll('%20', ' ');
        productDetails.name = data[1].split('=')[1].replaceAll('%20', ' ');
    }
    console.log(productDetails);

    mongoose.connect(dbDetails.dbURL, {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });
    let Product = mongoose.model('product_model', ProductSchema, 'product');
    try {
        Product.findOneAndRemove(productDetails, function (err) {
            if (err) {
                console.log(err);
                res.json({status: 'fail'});
            }
            else{
                res.json({status: 'success'});
            }
        });
    }
    catch{}
});

router.post('/fetch-products', (req, res)=>{
    console.log(req.body);
    let seller = req.body.data.split('=')[1];
    mongoose.connect(dbDetails.dbURL, {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });
    let Product = mongoose.model('product_model', ProductSchema, 'product');
    try {
        Product.find({seller: seller}, function (err, products) {
            if (err) {
                res.json({status: 'fail'});
            }
            else{
                res.json({status: 'success', products: products});
            }
        });
    }
    catch{}
});

router.post('/edit-product', (req, res)=>{
    let data = req.body.data.split('&');
    let seller = data[0].split('=')[1].replaceAll('%20', ' ');
    let name = data[1].split('=')[1].replaceAll('%20', ' ');
    let description = data[2].split('=')[1].replaceAll('%20', ' ');
    let price = data[3].split('=')[1].replaceAll('%20', ' ');
    let category = data[4].split('=')[1].replace('%20', ' ');

    let newData = {
        seller: seller,
        name: name,
        description: description,
        price: price,
        category: category
    };

    console.log("New Data:" + JSON.stringify(newData));

    let prevData = req.body.prevData;
    let prevName = sanitize(prevData.name);
    let prevDesc = sanitize(prevData.description);
    let prevPrice = sanitize(prevData.price);
    let prevCategory = sanitize(prevData.category);

    prevData = {
        seller: seller,
        name: prevName,
        description: prevDesc,
        price: prevPrice,
        category: prevCategory
    };

    console.log("Prev Data:" + JSON.stringify(prevData));

    mongoose.connect(dbDetails.dbURL, {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });
    let Product = mongoose.model('product_model', ProductSchema, 'product');
    try {
        Product.updateOne(prevData, newData, function (err, result) {
            if (err) {
                res.json({status: 'fail'});
            }
            else{
                res.json({status: 'success', result: result});
            }
        });
    }
    catch{}
});

String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


module.exports = router;