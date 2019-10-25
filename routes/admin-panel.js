let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

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

router.all('/', (req, res)=>{
    try{
        if(req.session.role === 'admin') {
            res.render('admin-panel', {username: req.session.username});
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


router.post('/add-user', (req, res)=>{
    console.log(req.body);
    console.log(req);
    let data = req.body.data.split('&');
    let role = data[2].split('=')[1].toLocaleLowerCase();
    let User = mongoose.model('user_' + role + '_model', UserSchema, 'user_' + role);

    let email = data[0].split('=')[1].replace("%40", "@");
    let username = data[1].split('=')[1];
    let password = data[3].split('=')[1];
    mongoose.connect('mmongodb://localhost/product_manager', {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });
    let newUser = User({email: email, username: username, password: password});
    try {
        newUser.save(function (err) {
            if (err) {
                res.json({status: 'duplicate'});
            }
            else{
                res.json({status: 'success'});
            }
        });
    }
    catch{}
});

router.post('/delete-user', (req, res)=>{
    let data = req.body.data.split('&');
    let username = data[0].split('=')[1];
    let role = data[1].split('=')[1].toLocaleLowerCase();
    mongoose.connect('mmongodb://localhost/product_manager', {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });
    let User = mongoose.model('user_' + role + '_model', UserSchema, 'user_' + role);
    let deletionConditions = {username: username};
    try {
        User.findOneAndRemove(deletionConditions, function (err) {
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

router.post('/fetch-users', (req, res)=>{
    let data = req.body.data;
    let role = data.split('=')[1].toLocaleLowerCase();
    mongoose.connect('mmongodb://localhost/product_manager', {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('error', function(){
        res.json({status: 'fail'});
    });
    console.log(data);
    let User = mongoose.model('user_' + role + '_model', UserSchema, 'user_' + role);
    try {
        User.find({}, function (err, users) {
            if (err) {
                res.json({status: 'fail'});
            }
            else{
                res.json({status: 'success', users: users});
            }
        });
    }
    catch{}
});
module.exports = router ;