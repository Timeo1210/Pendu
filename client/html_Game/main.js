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
    if (data.myId === data.admin) {
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


socket.on('letterTurn', function(data) {
    if (data === socket.id) {
        letterTurn = true
    }
})

socket.on('partyEnd_Lose', function(data) {
    partyEnd = true;
    AffWord(data)
    document.getElementById('p_endOutput').innerHTML = 'Vous avez Perdu !'
    if (admin === true) {
        document.getElementById('bnt_nextParty').disabled = false
    }
})

socket.on('partyEnd_Win', function() {
    partyEnd = true
    document.getElementById('p_endOutput').innerHTML = 'Vous avez Gagnez !'
    if (admin === true) {
        document.getElementById('bnt_nextParty').disabled = false
    }
})

function Aff_allParty_id() {
    allParty_id.unshift(['Nom', 'Nombre de Personne', 'ID de la partie'])
    document.getElementById('list_allParty').innerHTML = '';
    var tbl = document.createElement('table');
    document.getElementById('list_allParty').appendChild(tbl);
    tbl.id = 'table_list_allParty';
    tbl.className = 'list_allParty';

    let bool_do = true
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

                if (j !== 0) {
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

function AffMistake(nbr_mistake) {
    let tab_mistake = []
    for (let i = 0; i < nbr_mistake; i++) {
        tab_mistake.push('X')
    }
    document.getElementById('span_mistake_AFF').innerHTML = ''
    var tbl = document.createElement('table')
    tbl.style.border = '1px black solid'
    tbl.style.height = '20px'
    document.getElementById('span_mistake_AFF').appendChild(tbl)
    var tr = document.createElement('tr')
    tbl.appendChild(tr)
    //nuber eroor = 8
    for (let i = 0; i < 8; i++) {
        var td = document.createElement('td')
        tr.appendChild(td)
        if (tab_mistake[i] === 'X') {
            td.className = 'cell_Red'
        }
    }
}

function NextParty() {
    socket.emit('getWordTurn', indexParty)
}





socket.on('ERROR_001', function() {
    function ANIM_ERROR_001() {
    function afterAnim() {
        document.getElementById('ERROR_001').style.animation = 'fadeOut 1s'
    }
    function endAnim() {
        document.getElementById('ERROR_001').innerHTML = ''
    }
    document.getElementById('ERROR_001').innerHTML = "Partie inexistante ou en cours";
    document.getElementById('ERROR_001').style.animation = 'fadeIn 1s'
    setTimeout(afterAnim, 900)
    setTimeout(endAnim, 1900)
}
    ANIM_ERROR_001()
})
socket.on('ERROR_002', function() {
    window.location = window.location.origin + '/ERROR_002';
})
