import React, { Fragment } from "react";
import {Row} from "reactstrap";
import {addColumnLinks,getEditColumn,getChildColumn} from "../../utils/cellRenderer"
import Grid from "../../../../src/deps/jqwidgets-react/react_jqxgrid";

class BaseGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.getSelectedRow = (index) => {
      let _id = document.querySelector("div[role='grid']").id;
      let dataRecord = $("#" + _id).jqxGrid("getrowdata", index);
      return dataRecord;
    }

    this.editClick = async (index) => {
      const { pageid,gridSelectionHandler} = this.props;
      let dataRecord = this.getSelectedRow(index);
      const data = { data: dataRecord, mode: "Edit", index: index };
      await gridSelectionHandler(pageid,"Edit",data);
    };

    this.cellClick = async (cell) => {
      const { pageid,gridSelectionHandler} = this.props;
      const decodedCell = decodeURIComponent(cell);
      const cellInfo = JSON.parse(decodedCell); 
      let dataRecord = this.getSelectedRow(cellInfo.index);
      const data = {data: dataRecord, mode: "Edit",cell: cellInfo};
      await gridSelectionHandler(pageid,"Edit",data);
    };

    this.handleChildGrid = async (index) => {
      const {pageid,gridSelectionHandler} = this.props;
      let data = this.getSelectedRow(index);
      await gridSelectionHandler(pageid,"renderChild",data);
    }
    
    this.dispatchGridData = async data => {
      const { setGridData } = this.props;
      await setGridData(data);
    }; 
  }

  buildDataAdapter() {
    const {metadata} = this.props;
    let {griddef} = metadata;
    let dataAdapter = null;
      let data = this.props.griddata;
      debugger
      let { dataFields } = griddef;
      let source = {
        datatype: "json",
        datafields: dataFields,
        localdata: data
      };
      dataAdapter = new $.jqx.dataAdapter(source);
    return dataAdapter;
  }

  componentDidMount() {
    if (this.refs.extendedGrid) jqxGrid.aggregates = Aggregates;
  }
  
  render() {
    const {styles,metadata} = this.props;
    debugger
    const {pgdef,griddef} = metadata;
    const {columns,recordEdit} = griddef;
    let dataAdapter = this.buildDataAdapter();
    let newColumns = addColumnLinks(columns);
    if (recordEdit) {
      const editColumn = getEditColumn();
      newColumns = [...newColumns, editColumn];
    }
    // Child config format in metadata is changed to below format to handle multiple child navigations
    // Format: "childConfig": [{ "pgid": "pageId", "columnHeader": "Column Header" }]
    if (pgdef.childConfig && Array.isArray(pgdef.childConfig) && pgdef.childConfig.length) {
      const childColumns = pgdef.childConfig.map(({ pgid, columnHeader = "View" }) => getChildColumn(columnHeader,pgid));
      newColumns.push(...childColumns);
    }

    // Below "Global Methods" method's are used by Grid Cell Renderer
    module.exports = this.editClick;
    window.editClick = this.editClick;
    module.exports = this.cellClick;
    window.cellClick = this.cellClick;
    module.exports = this.handleChildGrid;
    window.handleChildGrid = this.handleChildGrid;
    module.exports = this.setGridData;
    window.exports = this.setGridData;
    return (
      <Fragment>
            <Row>
                <Grid
                    ref="baseGrid"
                    id="baseGrid"
                    width="100%"
                    altrows={true}
                    source={dataAdapter}
                    columns={newColumns}
                    pageable={true}
                    autoheight={true}
                    selectionmode={metadata.griddef.selectionmode || "multiplerows"}
                    style={styles.gridStyle}
                    sortable={true}
                    filterable={true}
                    columnsresize={true}
                    showfilterrow={true}
                    columnsautoresize={true}
                    columnsresize={true}
                />
            </Row>
      </Fragment>
    );
  }
}
export default BaseGrid;


