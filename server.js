const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;
const cors = require('cors');
app.use(cors());
app.use(express.static('public')); 

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