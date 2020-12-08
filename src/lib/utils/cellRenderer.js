import ReactDOM from "react-dom";
import JqxTooltip from "../../../src/deps/jqwidgets-react/react_jqxtooltip";
const JQXLite = window.JQXLite;

// Display Pencil Icon
export function editCellRenderer(rowIndex) {
  return ` <div id='edit-${rowIndex}'style="text-align:center; margin-top: 10px; color: #4C7392" onClick={editClick(${rowIndex})}> <i class="fas fa-pencil-alt  fa-1x" color="primary"/> </div>`;
}

// Displays Search Icon (EyeGlass)
export function childCellRenderer(rowIndex) {
  return `<div id='edit-${rowIndex}' style="text-align:center; margin-top: 10px; color: #4C7392" onClick="handleChildGrid(${rowIndex})"> <i class="fas fa-search  fa-1x" color="primary"/> </div>`;
}

// To be deleted
export function autoFillCellRenderer(ndex, datafield, value, defaultvalue, column, rowdata) {
  return `<a href='#' id='${datafield}-${ndex}' class='click' onClick={autoFill(${ndex})}><div style="padding-left:4px;padding-top:8px">${value}</div></a>`;
}

// Addes hyperlink to the cell.
export function addColLinksCellRenderer(index, datafield, value, defaultvalue, column, rowdata) {
  let cell = { index: index, datafield: datafield, value: value };
  let cellJSON = encodeURIComponent(JSON.stringify(cell));
  return `<a href='#' id='${datafield}-${index}' class='click' onClick={cellClick('${cellJSON}')}><div style="padding-left:4px;padding-top:8px" title="Hello">${value}</div></a>`;
}

// Adds autoFill links or regular hyperlink to the cell.
export function columnModifier(griddef, filterObj) {
  const { columns, recordEdit } = griddef;
  let newColumns = columns.map((column) => {
    if (column.link) {
      column.cellsrenderer = addColLinksCellRenderer;
    } else if (column.autoFill) {
      column.cellsrenderer = autoFillCellRenderer;
    }
    //column.rendered = toolTipRenderer;
    return column;
  });
  if (recordEdit) {
    const editColumn = getEditColumn();
    newColumns = [...newColumns, editColumn];
  }
  return newColumns;
}

//Creates a new column with a pencil icon and tooltip.
export function getEditColumn() {
  return {
    text: "Edit",
    datafield: "edit",
    align: "center",
    width: "5%",
    cellsrenderer: editCellRenderer,
    rendered: toolTipRenderer,
  };
}

//Creates a new column with search icon (eyeglass) and tooltip.
export function getChildColumn(columnHeader, pgid) {
  return {
    text: columnHeader,
    datafield: pgid,
    align: "center",
    width: "5%",
    cellsrenderer: childCellRenderer,
    rendered: toolTipRenderer,
  };
}

// Displays tooltips on grid cells.
export function toolTipRenderer(element) {
  const id = "toolTip" + JQXLite.generateID();
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
