
export function copyToClipboard() {
    let _id = document.querySelector("div[role='grid']").id;
    let value = [];
    let numOfCols = 0;
    
    let cols = $('#' + _id).jqxGrid('columns').records;
    let rows = $('#' + _id).jqxGrid('getrows');

    var colData = "";
    for (var x in cols) {
        if(cols[x].datafield != "edit" && cols[x].datafield != "delete"){
            colData += cols[x].text + '  \t';
            numOfCols ++;
        }
    }
    value.push(colData + ' \n');
    for (var x in rows) {
        var rowData = "";
        for(var i = 0; i < numOfCols; i++){
            var datafield = cols[i].datafield;
            var rowVal = rows[x];
            rowData += rowVal[datafield] + '  \t';
        }
        value.push(rowData + ' \n');
    }
    var dummyInput = document.createElement('textarea');
    dummyInput.setAttribute("id", "tempTxtArea");
    $('body').append(dummyInput);
    dummyInput.textContent = value.join('');
    dummyInput.select();
    document.execCommand('copy');

    var child = document.getElementById('tempTxtArea');
    child.parentNode.removeChild(child);;

    var numOfRows = value.length - 1;
    if(numOfRows >= 0)
        return numOfRows;
    else
        return 0;
}
