import React, { Fragment } from "react";
import { Row } from "reactstrap";
import { columnModifier, getChildColumn } from "../../utils/cellRenderer";
import Grid from "../../../../src/deps/jqwidgets-react/react_jqxgrid";
import Aggregates from "../../../../res/js/jqwidgets/jqxgrid.aggregates";

// Component used to handle non-server side paginated functionality.
class BaseGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    // Used to get the selected row data.
    this.getSelectedRow = (index) => {
      let _id = document.querySelector("div[role='grid']").id;
      let dataRecord = $("#" + _id).jqxGrid("getrowdata", index);
      return dataRecord;
    };

    // Handles the edit event on selection of Individual Record in the Grid (Pencil Icon).
    this.editClick = async (index) => {
      const { pageid, gridSelectionHandler } = this.props;
      let dataRecord = this.getSelectedRow(index);
      const data = { data: dataRecord, mode: "Edit", index: index };
      await gridSelectionHandler(pageid, "Edit", data);
    };

    // Handles the click event on click of an individual cell within a grid.
    this.cellClick = async (cell) => {
      const { pageid, gridSelectionHandler } = this.props;
      const decodedCell = decodeURIComponent(cell);
      const cellInfo = JSON.parse(decodedCell);
      let dataRecord = this.getSelectedRow(cellInfo.index);
      const data = { data: dataRecord, mode: "Edit", cell: cellInfo };
      await gridSelectionHandler(pageid, "Edit", data);
    };

    // Navigates to the child grid when click on a row in a grid.
    this.handleChildGrid = async (index) => {
      const { pageid, gridSelectionHandler } = this.props;
      let data = this.getSelectedRow(index);
      await gridSelectionHandler(pageid, "renderChild", data);
    };

    //Only Required For Paginated Grid, to save data to the redux store
    // this.dispatchGridData = async data => {
    //   const { setGridData } = this.props;
    //   await setGridData(data);
    // };
  }

  // Binds localdata to the grid.
  buildDataAdapter() {
    const { metadata } = this.props;
    let { griddef } = metadata;
    let dataAdapter = null;
    let data = this.props.griddata;
    let { dataFields } = griddef;
    let source = {
      datatype: "json",
      datafields: dataFields,
      localdata: data,
    };
    dataAdapter = new $.jqx.dataAdapter(source);
    return dataAdapter;
  }

  //Binds with juxGrid.aggregates to display totals for individual columns
  componentDidMount() {
    if (this.refs.baseGrid) jqxGrid.aggregates = Aggregates;
  }

  // Renders the Grid
  render() {
    const { styles, metadata } = this.props;
    const { pgdef, griddef } = metadata;
    let dataAdapter = this.buildDataAdapter();
    let newColumns = columnModifier(griddef, null);
    if (pgdef.childConfig && Array.isArray(pgdef.childConfig) && pgdef.childConfig.length) {
      const childColumns = pgdef.childConfig.map(({ pgid, columnHeader = "View" }) =>
        getChildColumn(columnHeader, pgid)
      );
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
