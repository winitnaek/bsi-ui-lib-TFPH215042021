import ReactDOM from "react-dom";
import JqxTooltip from "../../../src/deps/jqwidgets-react/react_jqxtooltip";
const JQXLite = window.JQXLite;

export function editCellRenderer(rowIndex){
    return ` <div id='edit-${rowIndex}'style="text-align:center; margin-top: 10px; color: #4C7392" onClick={editClick(${rowIndex})}> <i class="fas fa-pencil-alt  fa-1x" color="primary"/> </div>`;
};

export function childCellRenderer(rowIndex){
    return `<div id='edit-${rowIndex}' style="text-align:center; margin-top: 10px; color: #4C7392" onClick="handleChildGrid(${rowIndex})"> <i class="fas fa-search  fa-1x" color="primary"/> </div>`;
};

export function autoFillCellRenderer(ndex, datafield, value, defaultvalue, column, rowdata) {
    return `<a href='#' id='${datafield}-${ndex}' class='click' onClick={autoFill(${ndex})}><div style="padding-left:4px;padding-top:8px">${value}</div></a>`;
}

export function addColLinksCellRenderer(index, datafield, value, defaultvalue, column, rowdata) {
    let cell = {index:index, datafield:datafield, value:value};
    let cellJSON = encodeURIComponent(JSON.stringify(cell));
    return `<a href='#' id='${datafield}-${index}' class='click' onClick={cellClick('${cellJSON}')}><div style="padding-left:4px;padding-top:8px">${value}</div></a>`;
}

export function columnModifier(griddef,filterObj){
    const {columns,recordEdit} = griddef;
    let newColumns = columns.map((column) => { 
      debugger
      if (column.link){
        column.cellsrenderer = addColLinksCellRenderer;
      } else if (column.autoFill){
         column.cellsrenderer = autoFillCellRenderer;
      }
      if(filterObj[column.datafield]){
        column.filterItems =  new jqx.dataAdapter(filterObj[column.datafield])
      }
      column.rendered = toolTipRenderer;
      return column; 
  });
  if (recordEdit) {
    const editColumn = getEditColumn();
    newColumns = [...newColumns, editColumn];
  }
  return newColumns;
}

export function getEditColumn(){
    return {
        text: "Edit",
        datafield: "edit",
        align: "center",
        width: "5%",
        cellsrenderer: editCellRenderer,
        rendered: toolTipRenderer
      };
}

export function getChildColumn(columnHeader,pgid){
    return {
        text: columnHeader,
        datafield: pgid,
        align: "center",
        width: "5%",
        cellsrenderer: childCellRenderer,
        rendered: toolTipRenderer
      };
}

export function toolTipRenderer(element) {
    const id = 'toolTip' + JQXLite.generateID();
    element[0].id = id;
    const content = element[0].innerText;
    setTimeout(() => {
      ReactDOM.render(
        <JqxTooltip position={"mouse"} content={content}>
          {content}
        </JqxTooltip>,
        document.getElementById(id)
      );
    });
  }
