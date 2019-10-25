/*
    Things to be fixed:
        - JSON sends the codes of some characters such as space is sent as %20
          This code is replacing the case of space only. A more generic approach must
          be implemented to prevent displaying weird text to user.
 */


let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
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
            if(req.session.role === 'buyer') {
                res.render('buyer-panel', {username: req.session.username});
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

router.post('/fetch-products', (req, res)=>{
    console.log(req.body);
    mongoose.connect(dbDetails.dbURL, {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });
    let Product = mongoose.model('product_model', ProductSchema, 'product');
    try {
        Product.find(function (err, products) {
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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = router ;