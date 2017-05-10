/**
 * Created by abhishek on 10/05/17.
 */
'use strict';
 
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const config = require('./config.json');
const app = express();


app.use(express.static('public'));
app.set('view engine','hbs');
app.set('views', path.join(__dirname , '/views'));
app.use(bodyParser.json());
app.use(session({
    secret : config.secret,
    cookie: { maxAge: 60000 }
}));



app.get('/', (req,res)=>{
    const loginUri = `https://account.codingblocks.com/oauth/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${config.callbackURL}`;
    res.render('index', {loginUri} );
});
app.get('/callback', (req,res)=>{

    // get the code from query string
    const code = req.query.code;
    console.log(code);

    // prepare a POST request to the oneauth api
    const options = {
        method: 'POST',
        uri: 'https://account.codingblocks.com/oauth/token',
        body: {
            client_id: config.clientId,
            redirect_uri : config.callbackURL,
            client_secret : config.clientSecret,
            grant_type : 'authorization_code',
            code : code
        },
        json: true
    };

    let error ;

    rp(options).then(data=>{
        //get access_token
        if(data.access_token) {
            req.session.accessToken = data.access_token;
        } else {
            error = 'Invalid code';
        }
    }).catch(err=>{
        error = err;
    }).finally(function () {
        if(error){
            res.render('error', {error});
        } else {
            res.redirect('/welcome');
        }
    })

});

app.get('/welcome', (req,res)=>{
    if(req.session.accessToken) {
        // now that we have an accessToken , We can get data from the api
        rp({
            uri : 'https://account.codingblocks.com/api/users/me',
            headers : {
                'Authorization' : `Bearer ${req.session.accessToken}`
            },
            json : true
        }).then(data=>{
            console.log(data);
            res.render('welcome', data );
        });

    } else {
        res.sendStatus(401);
    }
});


app.listen('8080', function () {
    console.log('Running on 8080');
});