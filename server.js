const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const JWT_SECRET = 'roulette';
const PORT = 5000;


app.listen(5000, function(){
    console.log('listening on 5000')
});

app.get('/roulette', function(req, res){
    res.sendFile(__dirname + '/roulette.html');
});

app.get('/YWRtaW4K', function(req, res){
    res.send('관리자용 사이트입니다');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});