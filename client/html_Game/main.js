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
        }
    }
    allParty_id.shift()
}
