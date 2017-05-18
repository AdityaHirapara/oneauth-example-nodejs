/**
 * Created by abhishek on 18/05/17.
 */
'use strict';

const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const request = require('request');


const config = require('../config.json');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const app = express();


app.use(express.static('public'));
app.set('view engine','hbs');
app.set('views', path.join(__dirname , '../views'));
app.use(bodyParser.json());
app.use(require('express-session')({ secret: config.secret , resave: true, saveUninitialized: true }));


passport.use(new OAuth2Strategy({
        authorizationURL: 'https://account.codingblocks.com/oauth/authorize',
        tokenURL: 'https://account.codingblocks.com/oauth/token',
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackURL
    },
    function(accessToken, refreshToken, profile, cb) {
        request({
            uri    : 'https://account.codingblocks.com/api/users/me',
            qs : {
              include : 'github'
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            json   : true
        }, function (err , resp , data) {
            if(err)
                return cb(err);
            else {
                const user = data;
                user.accessToken = accessToken;
                return cb(null,user);
            }
        });

    }
));

/*
    For demo purpose only, session should not contain whole user data, just user.id is enough
    You should change these two functions
 */
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


//initialize passport
app.use(passport.initialize());


app.get('/', (req,res)=>{
    res.render('passport-index');
});

app.get('/login', passport.authenticate('oauth2', { failureRedirect: '/failed' }) );

app.get('/callback',passport.authenticate('oauth2', { failureRedirect: '/failed' }) , (req,res)=>{
    //you can access user data from any authenticated route using req.user
    res.render('welcome', req.user);
});

app.get('/failed', (req,res)=>{
    res.render('error' , {error : 'Cannot Authenticate, please try again.'} )
});


app.listen('8080', function () {
    console.log('Running on 8080');
});