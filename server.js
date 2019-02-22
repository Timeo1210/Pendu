var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/html_Regle/index.html');
})
app.get('/Pendu', function(req, res) {
    res.sendFile(__dirname + '/client/html_Game/index.html');
})

app.use('/client',express.static(__dirname + '/client'));

var port = process.env.PORT || 8080;

serv.listen(port, function() {
    console.log('[+] Server Started')
});

var allParty = [
    ['id', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', ''],
    ['id', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', '']
]

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.on('get_allParty_id', function() {
        let data = [];
        for (let j = 0; j < allParty.length; j++) {
            data.push([allParty[j][2], allParty[j][1].length.toString(), allParty[j][0]]);
        }
        socket.emit('allParty_id', data)
    })
})
