 var express = require('express');
var app = express();
var serv = require('http').Server(app);
var crypto = require('crypto');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/html_Regle/index.html');
})
app.get('/Pendu', function(req, res) {
    res.sendFile(__dirname + '/client/html_Game/index.html');
})
app.get('/ERROR_002', function(req, res) {
    res.sendFile(__dirname + '/client/ERROR/ERROR_002/index.html');
})

app.use('/client',express.static(__dirname + '/client'));

var port = process.env.PORT || 8080;

serv.listen(port, function() {
    console.log('[+] Server Started')
});

var allParty = [
    ['id1', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', '', ''],
    ['id2', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', '', '']
]

var someName = ['Aple', 'Rat', 'Jimmy', 'Solomon', 'Rita']

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){


    function get_allParty_id(all) {
        let data = [];
        for (let j = 0; j < allParty.length; j++) {
            data.push([allParty[j][2], allParty[j][1].length.toString(), allParty[j][0]]);
        }
        if (all === false) {
            socket.emit('allParty_id', data)
        } else {
            io.emit('allParty_id', data)
        }
    }
    socket.on('get_allParty_id', function() {
        get_allParty_id(false)
    })

    function UserJoin(id, name) {

        if (allParty.some(elem => elem[0] === id) === true) {
            if (name.trim() === '') {
                name = someName[Math.floor(Math.random() * 5)]
            }

            socket.join(id)
            for (let j = 0; j < allParty.length; j++) {
                if (allParty[j][0] === id) {
                    let rdmId = socket.id;
                    allParty[j][1].push([name, rdmId])
                    let players = [[], []]
                    allParty[j][1].forEach(function(elm) {
                        players[1].push(elm[0])
                    })

                    io.in(id).emit('infoMyParty', {
                        myId: rdmId,
                        index: j,
                        players: players,
                        admin: allParty[j][1][0][1]
                    })

                    RefreshAll()
                }
            }
        } else {
            socket.emit('ERROR_001')
        }
    }
    socket.on('newuserjoin', function(data) {
        UserJoin(data.id, data.name)
    })

    socket.on('newpartie', function(data) {
        allParty.push([socket.id, [], data.nameParty, '', ''])
        UserJoin(socket.id, data.name)
    })

    function RefreshAll() {
        get_allParty_id(true)
    }

    socket.on('disconnect', function() {
        for (let j = 0; j < allParty.length; j++) {
            for (let i = 0; i < allParty[j][1].length; i++) {
                if (allParty[j][1][i][1] === socket.id) {
                    //admin leave
                    if (i === 0) {
                        io.in(allParty[j][0]).emit('ERROR_002')
                        allParty.splice(j, 1)
                    }
                    //PROVISOIRE QUAND QUELQU4UN QUITTE LA PARTY S'ARRETE
                    io.in(allParty[j][0]).emit('ERROR_002')
                    allParty.splice(j, 1)

                    RefreshAll()
                    return;
                }

            }
        }
    })

})
