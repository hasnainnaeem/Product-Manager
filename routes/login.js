let express = require('express');
let router = express.Router();
let session = require('express-session');
let mongodb = require('mongodb');
let mongoose = require('mongoose');
let dbDetails = require('../config/database-settings');

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

router.get('/:userType', (req, res)=> {
    res.render('login', {role: req.params.userType});
});

router.post('/:userType', (req, res)=> {
    let userType = req.params.userType;

    mongoose.connect(dbDetails.dbURL, {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('Connected to the database.');
    });

    console.log("email:" + req.body.email);
    console.log("password:" + req.body.password);

    let  user = mongoose.model('user_' + userType + '_model', UserSchema, 'user_' + userType);

    if(userType === "admin") {
        user.findOne({email: req.body.email, password: req.body.password}, function(err, user){
            console.log(user);
            if (err) throw err;
            else if(user !== null){
                req.session.email = user.email;
                req.session.role = 'admin';
                req.session.username = user.username;
                res.redirect('../../../admin-panel');
            }
            else if(!user){
                res.render('login', {role: userType, feedback: "Wrong email or password. Try again."});
                res.end();
            }
        });
    }
    else if(userType==="buyer"){
        user.findOne({email: req.body.email, password: req.body.password}, function(err, user){
            console.log(user);
            if (err) throw err;
            else if(user !== null){
                req.session.email = user.email;
                req.session.role = 'buyer';
                req.session.username = user.username;
                res.redirect('../../../buyer-panel');
            }
            else if(!user){
                res.render('login', {role: userType, feedback: "Wrong email or password. Try again."});
                res.end();
            }
        });
    }
    else if(userType==="seller"){
        user.findOne({email: req.body.email, password: req.body.password}, function(err, user){
            console.log(user);
            if (err) throw err;
            else if(user !== null){
                req.session.email = user.email;
                req.session.role = 'seller' +
                    '';
                req.session.username = user.username;
                res.redirect('../../../seller-panel');
            }
            else if(!user){
                res.render('login', {role: userType, feedback: "Wrong email or password. Try again."});
                res.end();
            }
        });
    }

});
module.exports = router ;