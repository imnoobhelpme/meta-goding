const express =require('express');
const app = express();

app.listen(5000, function(){
    console.log('listening on 5000')
});

app.get('/roulette', function(req, res){
    res.sendFile(__dirname + '/roulette.html');
});

app.get('/admin', function(req, res){
    res.send('관리자용 사이트입니다');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/user.html')
});