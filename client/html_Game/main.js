var socket = io();
var allSpan = ['Init', 'Init_after_name','wtgPlayer']
function InitingAff() {
    for (let j = 1; j < allSpan.length; j++) {
        document.getElementById(allSpan[j]).style.display = 'none'
    }
}
InitingAff()

var allParty_id = []
var myId = ''
var indexparty = ''
var admin = false;

socket.emit('get_allParty_id')


socket.on('allParty_id', function(data) {
    if (document.getElementById('Init').style.display !== 'none') {
        allParty_id = data;
        Aff_allParty_id()
    }
})

socket.on('infoMyParty', function(data) {
    console.log('test')
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
            var td = document.createElement('td')
            tr.appendChild(td)
            td.innerHTML = allParty_id[j][i];
            td.className = 'cell_list_allParty'
            if (j !== 0) {
                td.setAttribute("onclick", function(){var row = j - 1; JoinThis(allParty_id[row][2])})
                td.onclick = function(){var row = j - 1; JoinThis(allParty_id[row][2])}
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

}





socket.on('ERROR_001', function() {
    function ANIM_ERROR_001() {
    function afterAnim() {
        document.getElementById('ERROR_001').style.animation = 'fadeOut 1s'
    }
    function endAnim() {
        document.getElementById('ERROR_001').innerHTML = ''
    }
    document.getElementById('ERROR_001').innerHTML = "Partie Inexistante";
    document.getElementById('ERROR_001').style.animation = 'fadeIn 1s'
    setTimeout(afterAnim, 900)
    setTimeout(endAnim, 1900)
}
    ANIM_ERROR_001()
})
socket.on('ERROR_002', function() {
    window.location = window.location.origin + '/ERROR_002';
})
