var socket = io();

allParty_id = []

socket.emit('get_allParty_id')


socket.on('allParty_id', function(data) {
    if (document.getElementById('Init').style.display !== 'none') {
        allParty_id = data;
        Aff_allParty_id()
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
    let name = document.getElementById('input_nameofpartie').value
    socket.emit('newpartie', name);
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
