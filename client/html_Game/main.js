var socket = io();
var allSpan = ['Init', 'Init_after_name','wtgPlayer', 'wordChoose', 'Pendu']
function InitingAff() {
    for (let j = 1; j < allSpan.length; j++) {
        document.getElementById(allSpan[j]).style.display = 'none'
    }
}
InitingAff()

var allParty_id = []
var myId = ''
var indexParty = ''
var admin = false;
var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
var letterTurn = false
var mistakeAffInit = false
var partyEnd = false
var alreadyBan = false
var tab_aff_pendu = ['img_pendu0.png', 'img_pendu1.png', 'img_pendu2.png', 'img_pendu3.png', 'img_pendu4.png', 'img_pendu5.png', 'img_pendu6.png', 'img_pendu7.png', 'img_pendu8.png']

socket.emit('get_allParty_id')


socket.on('allParty_id', function(data) {
    if (document.getElementById('Init').style.display !== 'none') {
        allParty_id = data;
        Aff_allParty_id()
    }
})

socket.on('infoMyParty', function(data) {
    indexParty = data.index;
    //dysplay: none Init
    document.getElementById('Init').style.display = 'none';
    document.getElementById('wtgPlayer').style.display = 'block';
    //check admin
    if (socket.id === data.admin) {
        admin = true
    }
    //display players
    function Aff_playerInParty() {
        document.getElementById('div_list_players').innerHTML = ''
        var tbl = document.createElement('table');
        document.getElementById('div_list_players').appendChild(tbl)

        for (let k = 0; k < data.players[1].length; k++) {
            data.players[0].push('img_player')
        }

        for (let j = 0; j < data.players.length; j++) {
            var tr = document.createElement('tr')
            tbl.appendChild(tr)
            for (let i = 0; i < data.players[j].length; i++) {
                var td = document.createElement('td')
                tr.appendChild(td)

                if (data.players[j][i] === 'img_player') {
                    let img = document.createElement('img')
                    img.src = 'client/html_Game/img/img_player.jpg'
                    td.appendChild(img)
                } else {
                    td.innerHTML = data.players[j][i]
                }
            }
        }
    }
    Aff_playerInParty()
    if (admin === true) {
        document.getElementById('btn_startGame').disabled = false;
        document.getElementById('p_admin_output').innerHTML = 'Vous êtes admin.'

        document.getElementById('p_adminWait').innerHTML = 'Appuyer pour commencer la partie avec ces joueurs'
        document.getElementById('p_adminWait').className = 'p_grey'
    } else {
        document.getElementById('p_admin_output').innerHTML = 'Vous n\'êtes pas admin.'
        document.getElementById('p_admin_output').className = 'p_grey'

        document.getElementById('p_adminWait').innerHTML = 'En attente de joueur.'
    }

})

socket.on('wordTurn', function(data) {
    document.getElementById('wtgPlayer').style.display = 'none';
    document.getElementById('Pendu').style.display = 'none';
    document.getElementById('wordChoose').style.display = 'block';

    partyEnd = false
    letterTurn = false
    document.getElementById('p_endOutput').innerHTML = ''
    document.getElementById('bnt_nextParty').disabled = true
    AffLetters(['NONE'], ['NONE'])
    AffMistake(0)

    if (data === socket.id) {
        document.getElementById('wordChoose_true').style.display = 'block'
    } else {
        document.getElementById('wordChoose_true').style.display = 'none'
    }
})

socket.on('wordProcess', function(data) {
    document.getElementById('wordChoose').style.display = 'none'
    document.getElementById('input_word_Pendu').value = ''

    document.getElementById('Pendu').style.display = 'block'
    //dsa   zdadadad


    AffWord(data.word)
    AffLetters(data.word, data.letter)
    if (mistakeAffInit === false) {
        mistakeAffInit = true
        AffMistake(0)
    }
})

socket.on('mistakeLetter', function(data) {
    AffMistake(data)
})

socket.on('newAdmin', function(data) {
    if (data === socket.id) {
        admin = true
    }
})


socket.on('letterTurn', function(data) {
    if (data === socket.id) {
        letterTurn = true
    }
    AffWhoChose()
})

socket.on('partyEnd', function(data) {
    partyEnd = true;
    AffWord(data)
    if (typeof data.id !== 'undefined' && data.id === socket.id) {
        document.getElementById('p_endOutput').innerHTML = ''
        document.getElementById('p_endOutput').style.color = 'green'
        document.getElementById('p_endOutput').innerHTML = 'Vous avez Gagnez !'
    } else {
        document.getElementById('p_endOutput').innerHTML = ''
        document.getElementById('p_endOutput').style.color = 'red'
        document.getElementById('p_endOutput').innerHTML = 'Vous avez Perdu !'
    }
    if (admin === true) {
        document.getElementById('bnt_nextParty').disabled = false
    }
})

socket.on('yourDead', function() {
    partyEnd = true
    letterTurn = false

    document.getElementById('p_endOutput').style.color = 'red'
    document.getElementById('p_endOutput').innerHTML = 'Vous Avez Perdu !'

    socket.emit('newLetterChoice', {
        index: indexParty,
        letter: 'NONE'
    })

    document.getElementById('aff_whoChoose').innerHTML = ''
    document.getElementById('aff_whoChoose').innerHTML = "Ce n'est pas a vous de choisir"
    document.getElementById('aff_whoChoose').className = 'p_red'
})

function Aff_allParty_id() {
    allParty_id.unshift(['Nom', 'Nombre de Personne', 'ID de la partie'])
    document.getElementById('list_allParty').innerHTML = '';
    var tbl = document.createElement('table');
    document.getElementById('list_allParty').appendChild(tbl);
    tbl.id = 'table_list_allParty';
    tbl.className = 'list_allParty';

    for (let j = 0; j < allParty_id.length; j++) {
        var tr = document.createElement('tr')
        tbl.appendChild(tr)
        for (let i = 0; i < allParty_id[j].length; i++) {
            function aff_allPartyTD() {
                var td = document.createElement('td')
                tr.appendChild(td)
                if (allParty_id[j][allParty_id.length - 1] !== true) {
                    td.className = 'cell_list_allParty'
                } else {
                    td.className = 'cell_list_allParty cell_Red'
                }

                td.innerHTML = allParty_id[j][i];

                if (j !== 0 && allParty_id[j][allParty_id.length - 1] !== true) {
                    td.setAttribute("onclick", function(){var row = j - 1; JoinThis(allParty_id[row][2])})
                    td.onclick = function(){var row = j - 1; JoinThis(allParty_id[row][2])}
                }
            }
            if (j === 0) {
                aff_allPartyTD()
            } else if (i !== allParty_id[j].length - 1) {
                aff_allPartyTD()
            }
        }
    }
    allParty_id.shift()
}


function JoinThis(id) {
    socket.emit('newuserjoin', {
        id: id,
        name: document.getElementById('input_nameofuser').value
    })
}

function CreateParty() {
    socket.emit('newpartie', {
        nameParty: document.getElementById('input_nameofpartie').value,
        name: document.getElementById('input_nameofuser').value
    });
}

function StartGame() {
    if (admin === true) {
        socket.emit('getWordTurn', indexParty)
    }
}

function NewWord() {
    let word = document.getElementById('input_word_Pendu').value
    socket.emit('wordIs', {
        word: word,
        index: indexParty,
        letter: 'NONE'
    })
}

function AffWord(wordP) {
    document.getElementById('span_word_AFF').innerHTML = ''
    var tbl = document.createElement('table')
    document.getElementById('span_word_AFF').appendChild(tbl)
    var tr = document.createElement('tr')
    tbl.appendChild(tr)
    for (let i = 0; i < wordP.length; i++) {
        var td = document.createElement('td')
        tr.appendChild(td)

        td.innerHTML = wordP[i]
    }

}

function AffLetters(letters, misLetter) {
    document.getElementById('span_alphabet_AFF').innerHTML = ''
    var tbl = document.createElement('table')
    document.getElementById('span_alphabet_AFF').appendChild(tbl)
    var tr = document.createElement('tr')
    tbl.appendChild(tr)
    for (let i = 0; i < alphabet.length; i++) {
        var td = document.createElement('td')
        tr.appendChild(td)
        td.innerHTML = alphabet[i]
        td.id = 'AffLetters' + '/' + i
        if (letters.some(elem => elem.toLowerCase() === alphabet[i].toLowerCase()) !== true && misLetter.some(elem => elem.toLowerCase() === alphabet[i].toLowerCase()) !== true && partyEnd === false) {
            td.setAttribute("onclick", function(){LetterChoice(this.innerHTML)})
            td.onclick = function(){LetterChoice(this.innerHTML)}
        } else {
            td.className = 'cell_Red'
        }
    }
}

function LetterChoice(letter) {
    if (letterTurn === true) {
        letterTurn = false
        socket.emit('newLetterChoice', {
            index: indexParty,
            letter: letter
        })
    }
}

function AffWhoChose() {
    if (letterTurn === true) {
        document.getElementById('aff_whoChoose').innerHTML = ''
        document.getElementById('aff_whoChoose').innerHTML = "C'est a vous de choisir"
        document.getElementById('aff_whoChoose').className = 'p_green'
    } else {
        document.getElementById('aff_whoChoose').innerHTML = ''
        document.getElementById('aff_whoChoose').innerHTML = "Ce n'est pas a vous de choisir"
        document.getElementById('aff_whoChoose').className = 'p_red'
    }
}

function AffMistake(nbr_mistake) {
    document.getElementById('div_mistake_AFF').style.backgroundImage = "url(" + window.location.origin + "/Pendu_img?id=" + tab_aff_pendu[nbr_mistake] + ")";
}

function NextParty() {
    socket.emit('getWordTurn', indexParty)
}

function BanRandomPlayer() {
    if (alreadyBan === false) {
        alreadyBan = true
        document.getElementById('btn_banPlayer').disabled = true
        socket.emit('banRdm', {
            index: indexParty,
            id: socket.id
        })
    } else {
        ANIM_ERROR('ERROR_003', "Vous avez déjà bannie quelqu'un")
    }
}

function SuggestWord(suggWord) {
    document.getElementById('input_wordFind').value = ""
    socket.emit('suggestedWord', {
        index: indexParty,
        id: socket.id,
        suggWord: suggWord
    })
}




function ANIM_ERROR(id, text) {
function afterAnim() {
    document.getElementById(id).style.animation = 'fadeOut 1s'
}
function endAnim() {
    document.getElementById(id).innerHTML = ''
}
document.getElementById(id).innerHTML = text;
document.getElementById(id).style.animation = 'fadeIn 1s'
setTimeout(afterAnim, 900)
setTimeout(endAnim, 1900)
}

socket.on('ERROR_001', function() {
    ANIM_ERROR('ERROR_001', 'Partie inexistante ou en cours')
})
socket.on('ERROR_002', function() {
    window.location = window.location.origin + '/ERROR_002';
})
socket.on('ERROR_003', function(data) {
    if (data === socket.id) {
        window.location = window.location.origin + '/ERROR_003';
    }
})
socket.on('ERROR_004', function() {
    ANIM_ERROR('ERROR_004', "Vous n'êtes pas authoriser a écrire de mot")
})
