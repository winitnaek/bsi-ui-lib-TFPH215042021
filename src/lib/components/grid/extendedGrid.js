import React, { Fragment } from "react";
import {Row} from "reactstrap";
import Aggregates from "../../../../res/js/jqwidgets/jqxgrid.aggregates";
import Grid from "../../../../src/deps/jqwidgets-react/react_jqxgrid";
import BaseGrid from "./baseGrid";

class ExtendedGrid extends BaseGrid {
  constructor(props) {
    super(props);
    this.state = {
    };
  
    //Only Required For Paginated Grid
    this.saveGridData = async (data) => {
      debugger
      const {setGridData} = this.props;
      await setGridData(data);
    } 
  }
  
  buildDataAdapter() {
    const {source} = this.props;
    let dataAdapter = this.processAdapter(source);
    return dataAdapter;
  }
  
  processAdapter(source){
    if(source) {
      let dataAdapter = new $.jqx.dataAdapter(source, {
        formatData: function (data) {
          try {
              return JSON.stringify(data);
          } catch (error) {
              return data;
          }
        },
        downloadComplete: function (data, status, xhr) {
            if(data != null && data.candidateRecords.length > 0){
              source.totalrecords = data.candidateRecords[0].totalRows;
            }
        },
        beforeLoadComplete: function (records, sourceData) {
        },
        loadError: function (xhr, status, error) {
            throw new Error(error);
        }
      });
    return dataAdapter;
    }
  }

  componentDidMount() {
    if (this.refs.extendedGrid) jqxGrid.aggregates = Aggregates;
  }

  render() {
    const {styles,metadata, formProps} = this.props;
    const { pgdef,griddef} = metadata;
    const {columns,recordEdit} = griddef;

    let dataAdapter = this.buildDataAdapter();
    let newColumns = this.addColLinks(columns);
    if (recordEdit) {
      const editCellsRenderer = rowIndex => {
        return ` <div id='edit-${rowIndex}'style="text-align:center; margin-top: 10px; color: #4C7392" onClick={editClick(${rowIndex})}> <i class="fas fa-pencil-alt  fa-1x" color="primary"/> </div>`;
      };
      const editColumn = {
        text: "Edit",
        datafield: "edit",
        align: "center",
        width: "5%",
        sortable: false,
        filterable: false,
        resizable: false,
        cellsrenderer: editCellsRenderer,
        menu: false,
        rendered: this.toolTipRenderer
      };

      newColumns = [...newColumns, editColumn];
    }

    // Child config format in metadata is changed to below format to handle multiple child navigations
    // Format: "childConfig": [{ "pgid": "pageId", "columnHeader": "Column Header" }]

    if (pgdef.childConfig && Array.isArray(pgdef.childConfig) && pgdef.childConfig.length) {
      const childCellsRenderer = (rowIndex, columnField) => {
        return `<div id='edit-${rowIndex}' style="text-align:center; margin-top: 10px; color: #4C7392" onClick="handleChildGrid('${columnField}', '${rowIndex}')"> <i class="fas fa-search  fa-1x" color="primary"/> </div>`;
      };
      const childColumns = pgdef.childConfig.map(({ pgid, columnHeader = "View" }) => ({
        text: columnHeader,
        datafield: pgid,
        align: "center",
        width: "5%",
        sortable: false,
        filterable: false,
        resizable: false,
        cellsrenderer: childCellsRenderer,
        menu: false,
        rendered: this.toolTipRenderer
      }));
      newColumns.push(...childColumns);
    }
 
    module.exports = this.editClick;
    window.editClick = this.editClick;
    module.exports = this.cellClick;
    window.cellClick = this.cellClick;
    module.exports = this.handleChildGrid;
    window.handleChildGrid = this.handleChildGrid;
    module.exports = this.setGridData;
    window.exports = this.setGridData;

    let showaggregates= formProps.showaggregates || false;
    let showstatusbar= formProps.showstatusbar || false;
    return (
      <Fragment>
            <Row>
            <Grid
                ref="extendedGrid"
                id="extendedGrid"
                width="100%"
                altrows={true}
                columnsresize={true} 
                columnsautoresize={true}
                source={dataAdapter}
                virtualmode={true}
                rendergridrows = {(obj) => {
                    this.saveGridData(obj);
                    return obj.data;
                }}
                columns={newColumns}
                pageable={true}
                autoheight={true}
                selectionmode={griddef.selectionmode || "multiplerows"}
                style={styles.gridStyle}
                showaggregates={showaggregates} 
                showstatusbar={showstatusbar}
                sortable = {griddef.sortable || true}
                filterable={griddef.filterable || true}
          />
            </Row>
      </Fragment>
    );
  }
}
export default ExtendedGrid;


