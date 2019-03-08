var express = require('express');
var app = express();
var serv = require('http').Server(app);

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
    ['id1', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', -1, -1, '', false, [[], []], 0],
    ['id2', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', -1, -1, '', false, [[], []], 0]
]

var someName = ['Aple', 'Rat', 'Jimmy', 'Solomon', 'Rita']

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){


    function get_allParty_id(all) {
        let dataT = [];
        for (let j = 0; j < allParty.length; j++) {
            dataT.push([allParty[j][2], allParty[j][1].length.toString(), allParty[j][0],  allParty[j][6]]);
        }
        if (all === false) {
            socket.emit('allParty_id', dataT)
        } else {
            io.emit('allParty_id', dataT)
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
                if (allParty[j][0] === id && allParty[j][6] === false) {
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
        allParty.push([socket.id, [], data.nameParty, -1, -1, '', false, [[], []], 0])
        UserJoin(socket.id, data.name)
    })

    function getWordTurn(data) {
        if (allParty[data][3] === -1) {
            allParty[data][6] = true
            RefreshAll()
        }
        if (allParty[data][3] === allParty[data][1].length - 1) {
            allParty[data][3] = 0
        } else {
            allParty[data][3]++
        }
        io.in(allParty[data][0]).emit('wordTurn', allParty[data][1][allParty[data][3]][1])
    }
    socket.on('getWordTurn', function(data) {
        //Reset
        allParty[data][5] = ''
        allParty[data][7][0] = []
        allParty[data][7][1] = []
        allParty[data][8] = 0
        getWordTurn(data)
    })

    function LetterTurn(index) {
        function AddCondition() {
            if (allParty[index][4] >= allParty[index][1].length - 1) {
                allParty[index][4] = 0
            } else {
                allParty[index][4]++
            }
        }
        AddCondition()
        if (allParty[index][4] === allParty[index][3]) {
            AddCondition()
        }
        return allParty[index][1][allParty[index][4]][1]
    }
    function WordProcess(word, letter, index) {
        let error = true
        if (allParty[index][7][0].length === 0) {
            for (let i = 0; i < word.length; i++) {
                allParty[index][7][0].push('_')
            }
        }
        for (let i = 0; i < word.length; i++) {
            if (word[i].toLowerCase() === word[0].toLowerCase() || word[i].toLowerCase() === word[word.length - 1].toLowerCase()) {
                allParty[index][7][0].splice(i, 1, word[i])
            } else if (word[i].toLowerCase() === letter.toLowerCase()) {
                allParty[index][7][0].splice(i, 1, word[i])
                error = false
            } else if (word[i] === ' ') {
                allParty[index][7][0].splice(i, 1, ' ')
            } else if (word[i] === '-') {
                allParty[index][7][0].splice(i, 1, '-')
            } else if (word[i] === "'") {
                allParty[index][7][0].splice(i, 1, "'")
            }
        }
        if (allParty[index][7][0].some(elem => elem === '_') !== true && allParty[index][8] !== 8) {
            io.in(allParty[index][0]).emit('partyEnd_Win')
        }
        if (letter !== 'NONE' && error === true) {
            allParty[index][7][1].push(letter)
            allParty[index][8]++
            io.in(allParty[index][0]).emit('mistakeLetter', allParty[index][8])
            //error count
            if (allParty[index][8] === 8) {
                io.in(allParty[index][0]).emit('partyEnd_Lose', allParty[index][5])
            }
        }
        //To Win Or Death
    }
    function newLetterChoice(index, word, letter) {
        WordProcess(word, letter, index)
        if (allParty[index][8] !== 8) {
            io.in(allParty[index][0]).emit('letterTurn', LetterTurn(index))

            io.in(allParty[index][0]).emit('wordProcess', {
                word: allParty[index][7][0],
                letter: allParty[index][7][1]
            })
        }
    }
    socket.on('wordIs', function(data) {
        allParty[data.index][5] = data.word;
        newLetterChoice(data.index, data.word, data.letter)
    })

    socket.on('newLetterChoice', function(data) {
        newLetterChoice(data.index, allParty[data.index][5], data.letter)
    })

    function RefreshAll() {
        get_allParty_id(true)
    }

    //Not Optimise
    function CheckForStatus(id, index, user) {
        //io.in(allParty[index][0]).emit('letterTurn', LetterTurn(index))

        //NOBODY
        if (allParty[index][1].length === 2) {
            io.in(allParty[index][0]).emit('ERROR_002')
            allParty.splice(index, 1)
            return;
        }
        //NOTSTART
        if (allParty[index][6] === false) {
            allParty[index][1].splice(user, 1)
            let rdmId = 'NONE'
            let players = [[], []]
            allParty[index][1].forEach(function(elm) {
                players[1].push(elm[0])
            })

            io.in(allParty[index][0]).emit('infoMyParty', {
                myId: rdmId,
                index: index,
                players: players,
                admin: allParty[index][1][0][1]
            })

            RefreshAll()
            return;
        }
        //ADMIN
        if (allParty[index][1][0][1] === allParty[index][1][user][1]) {
            if (typeof allParty[index][1][user] !== 'undefined' &&  allParty[index][1][user][1] === id) {
                allParty[index][1].splice(user, 1)
            }
            io.in(allParty[index][0]).emit('newAdmin', allParty[index][1][0][1])


            //LetterTurn
        } else if (allParty[index][4] === user) {
            if (typeof allParty[index][1][user] !== 'undefined' &&  allParty[index][1][user][1] === id) {
                allParty[index][1].splice(user, 1)
            }
            io.in(allParty[index][0]).emit('letterTurn', LetterTurn(index))
            return;

            //WordTurn
        }

        //WordTurn
        if (allParty[index][3] === user) {
            if (typeof allParty[index][1][user] !== 'undefined' &&  allParty[index][1][user][1] === id) {
                allParty[index][1].splice(user, 1)
            }

            allParty[index][5] = ''
            allParty[index][7][0] = []
            allParty[index][7][1] = []
            allParty[index][8] = 0

            getWordTurn(index);
        }
    }

    socket.on('disconnect', function() {
        for (let j = 0; j < allParty.length; j++) {
            for (let i = 0; i < allParty[j][1].length; i++) {
                if (allParty[j][1][i][1] === socket.id) {
                    CheckForStatus(socket.id, j, i)

                    RefreshAll()
                    return;
                }

            }
        }
    })

})
