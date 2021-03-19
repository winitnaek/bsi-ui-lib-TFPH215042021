
export function copyToClipboard(pageid) {
    let _id = document.querySelector("div[role='grid']").id;
    let value = [];
    let numOfCols = 0;
    
    let cols = $('#' + _id).jqxGrid('columns').records;
    let rows = [];
    var selrowsindx =$('#' + _id).jqxGrid("selectedrowindexes");
    if (selrowsindx && selrowsindx.length > 0) {
        for (var s = 0; s < selrowsindx.length; s++) {
        var rowdata = $('#' + _id).jqxGrid("getrowdata", selrowsindx[s]);
        rows.push(rowdata);
        }
    } else {
        rows = $('#' + _id).jqxGrid("getrows");
    }
    var colData = "";
    for (var x in cols) {
        if(cols[x].datafield != "edit" && cols[x].datafield != "delete" && cols[x].text!='View' && cols[x].datafield!=pageid && cols[x].exportable !=false && cols[x].hidden !="true" && cols[x].hidden !=true){
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
