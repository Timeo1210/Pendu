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
app.get('/ERROR_003', function(req, res) {
    res.sendFile(__dirname + '/client/ERROR/ERROR_003/index.html');
})
app.get('/Pendu_img', function(req, res) {
    res.sendFile(__dirname + '/client/html_Game/img/img_pendu/' + req.query.id)
})

app.use('/client',express.static(__dirname + '/client'));

var port = process.env.PORT || 8080;

serv.listen(port, function() {
    console.log('[+] Server Started')
});
/*
var allParty = [
    ['id1', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', -1, -1, '', false, [[], []], 0],
    ['id2', [['joueur1', 'IDofjoueur1'], ['joueur2', 'IDofjoueur2']], 'LapartyX', -1, -1, '', false, [[], []], 0]
]
*/
var allParty = []

var someName = ['Aple', 'Rat', 'Jimmy', 'Solomon', 'Rita']

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){


    function get_allParty_id(all) {
        let dataT = [];
        for (let j = 0; j < allParty.length; j++) {
            dataT.push([allParty[j][1].length.toString(), allParty[j][2], allParty[j][0]]);
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

    function get_randomName(toCheck) {
        if (toCheck.trim() === '') {
            return someName[Math.floor(Math.random() * 5)]
        } else {
            return toCheck
        }
    }

    function UserJoin(id, name) {

        if (allParty.some(elem => elem[0] === id) === true) {

            name = get_randomName(name)

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
        data.nameParty = get_randomName(data.nameParty)
        allParty.push([socket.id, [], data.nameParty, -1, -1, '', false, [[], []], 0, [], 0])
        UserJoin(socket.id, data.name)
    })

    function getWordTurn(data) {
        allParty[data][5] = ''
        allParty[data][7][0] = []
        allParty[data][7][1] = []
        allParty[data][8] = 0
        allParty[data][9] = []
        allParty[data][10] = 0

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
        allParty[data][9].push(allParty[data][1][allParty[data][3]][1])
    }
    socket.on('getWordTurn', function(data) {
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
        //allParty[index][4] === allParty[index][3]
        let count = 0
        while (((allParty[index][4] === allParty[index][3]) || (allParty[index][9].some(elem => elem === allParty[index][1][allParty[index][4]][1]) === true)) && (count < allParty[index][1].length)) {
            count++
            AddCondition()
        }
        if (count === allParty[index][1].length) {
            io.in(allParty[index][0]).emit('partyEnd', {
                id: allParty[index][1][allParty[index][3]][1],
                word: allParty[index][5]
            })
            return
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
        //check for accent

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
        //WIN
        if (allParty[index][7][0].some(elem => elem === '_') !== true && allParty[index][8] !== 8) {
            io.in(allParty[index][0]).emit('partyEnd', {
                id: socket.id,
                word: allParty[index][5]
            })
            for (let i = 0; i < allParty[index][1].length; i++) {
                if (allParty[index][1][i][1] === socket.id) {
                    console.log(i)
                    allParty[index][3] = i
                    allParty[index][3]--
                    break
                }
            }
            allParty[index][10] = 0
        }
        //LOSE
        if (letter !== 'NONE' && error === true) {
            allParty[index][7][1].push(letter)
            allParty[index][8]++
            io.in(allParty[index][0]).emit('mistakeLetter', allParty[index][8])
            //error count
            if (allParty[index][8] === 8) {
                io.in(allParty[index][0]).emit('partyEnd', {
                    id: allParty[index][1][allParty[index][3]][1],
                    word: allParty[index][5]
                })
                allParty[index][10] = 0
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

    socket.on('suggestedWord', function(data) {
        if (allParty[data.index][9].some(elem => elem === data.id) !== true) {
            allParty[data.index][9].push(data.id)
            if (data.suggWord.toLowerCase() === allParty[data.index][5].toLowerCase()) {
                io.in(allParty[data.index][0]).emit('partyEnd', {
                    id: socket.id,
                    word: allParty[data.index][5]
                })
            } else {
                socket.emit('yourDead')
            }
        } else {
            socket.emit('ERROR_004')
        }
    })

    function randomNumber(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    function banPlayer(id, index) {
        io.in(allParty[index][0]).emit('ERROR_003', id)
    }
    socket.on('banRdm', function(data) {
        if (randomNumber(2) === 0) {
            banPlayer(socket.id, data.index);
        } else {
            let rdmNumber = randomNumber(allParty[data.index][1].length)
            while (allParty[data.index][1][rdmNumber][1] === data.id) {
                rdmNumber = randomNumber(allParty[data.index][1].length)
            }
            banPlayer(allParty[data.index][1][rdmNumber][1], data.index)
        }
    })

    socket.on('newVote', function(data) {
        if (data.type === 'ADD') {
            allParty[data.index][10]++
        }


        let nbm_player = allParty[data.index][1].length
        let nbm_voted_player = allParty[data.index][10]

        if (nbm_voted_player === nbm_player) {
            if (data.dom === 'btn_startGame') {
                socket.emit('startGame')
            } else if (data.dom === 'bnt_nextParty') {
                socket.emit('nextParty')
            }
        }

        io.in(allParty[data.index][0]).emit('infoVote', {
            nbm_player: nbm_player.toString(),
            nbm_voted_player: data.type === 'INIT' ? '0' : nbm_voted_player.toString(),
            dom: data.dom
        })
    })

    function RefreshAll() {
        get_allParty_id(true)
    }

    //Not Optimise
    function CheckForStatus(id, index, user) {
        //io.in(allParty[index][0]).emit('letterTurn', LetterTurn(index))

        console.log(allParty[index])

        //NOBODY
        if (allParty[index][1].length === 2) {
            console.log('NOBODY')
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
            if (allParty[index][1].length !== 0) {
                io.in(allParty[index][0]).emit('newAdmin', allParty[index][1][0][1])
            }


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
