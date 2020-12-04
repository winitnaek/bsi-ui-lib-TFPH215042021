import React, { Fragment } from "react";
import {Row} from "reactstrap";
import Aggregates from "../../../../res/js/jqwidgets/jqxgrid.aggregates";
import Grid from "../../../../src/deps/jqwidgets-react/react_jqxgrid";
import BaseGrid from "./baseGrid";
import {columnModifier,getEditColumn,getChildColumn} from "../../utils/cellRenderer";

class ExtendedGrid extends BaseGrid {
  constructor(props) {
    super(props);
    this.state = {
      filterObj:{}
    };
  
    //Only Required For Paginated Grid
    this.saveGridData = async (data) => {
      const {setGridData} = this.props;
      await setGridData(data);
    } 
}

  updateGrid(type){
    let _id = document.querySelector("div[role='grid']").id;
    $('#' + _id).jqxGrid('updatebounddata',type);
  }

  formatData(data){
      try {
          return JSON.stringify(data);
      } catch (error) {
          return data;
      }
  }
  
  buildDataAdapter() {
    const {source} = this.props;
    if(source){
      source.filter = () => this.updateGrid("filter");
      source.sort = () => this.updateGrid("sort");
    }
    let dataAdapter = this.processAdapter(source);
    return dataAdapter;
  }

    updateDropdownFilters(sourceData,filters) {
      debugger
      let filtersRecordsOut = sourceData.filtersRecordsOut;
      let filterObj = {};
      filters.map(filter => {
        filter.localdata = filtersRecordsOut[filter.mapping.filterId]
        filterObj[filter.mapping.columnName] = filter;
      })
      //this.setState({allRowSelected:false,allSelected:false});
      this.setState({filterObj});
  }
  
  processAdapter(source){
    debugger
    let compRef = this;
    if(source) {
      let dataAdapter = new $.jqx.dataAdapter(source, {
        formatData: this.formatData,
        beforeLoadComplete: function (records, sourceData) {
          debugger
        compRef.updateDropdownFilters(sourceData,source.filters);
        },
        downloadComplete: function (data, status, xhr) {
            if(data != null && data.candidateRecords.length > 0){
              source.totalrecords = data.candidateRecords[0].totalRows;
            }
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
    const {filterObj} = this.state;
    let dataAdapter = this.buildDataAdapter();
    debugger
    let newColumns = columnModifier(griddef,filterObj);
    // Child config format in metadata is changed to below format to handle multiple child navigations
    // Format: "childConfig": [{ "pgid": "pageId", "columnHeader": "Column Header" }]
    if (pgdef.childConfig && Array.isArray(pgdef.childConfig) && pgdef.childConfig.length) {
      const childColumns = pgdef.childConfig.map(({ pgid, columnHeader = "View" }) => getChildColumn(columnHeader,pgid));
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
                sortable = {griddef.sortable || false}
                filterable={griddef.filterable || false}
                showfilterrow={griddef.showfilterrow || false}
          />
            </Row>
      </Fragment>
    );
  }
}
export default ExtendedGrid;


