import React, { Fragment } from "react";
import { Row } from "reactstrap";
import Aggregates from "../../../../res/js/jqwidgets/jqxgrid.aggregates";
import Grid from "../../../../src/deps/jqwidgets-react/react_jqxgrid";
import BaseGrid from "./baseGrid";
import { columnModifier, getChildColumn } from "../../utils/cellRenderer";

//This will be used for server side paging, custom filtering and sorting
class ExtendedGrid extends BaseGrid {
  constructor(props) {
    super(props);
    this.state = {
      filtersMetadata: [],
      initialLoad: true,
    };

    //Only Required For Paginated Grid, to save data to the redux store
    this.saveGridData = async (data) => {
      const { setGridData } = this.props;
      await setGridData(data);
    };
  }

  //Refreshes grid with new data.
  updateGrid(type) {
    let _id = document.querySelector("div[role='grid']").id;
    $("#" + _id).jqxGrid("updatebounddata", type);
  }

  //Format the post payload
  formatData(data) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      return data;
    }
  }

  // Handles filter and sort events for the grid.
  buildDataAdapter() {
    const { source } = this.props;
    if (source) {
      source.filter = () => this.updateGrid("filter");
      source.sort = () => this.updateGrid("sort");
    }
    let dataAdapter = this.processAdapter(source);
    return dataAdapter;
  }

  //Reinitializes the filters with data from the backend.
  updateDropdownFilters(filtersMetadata, responseData) {
    const { initialLoad } = this.state;
    let dropdownFilterValues = responseData.filtersRecordsOut;
    filtersMetadata &&
      filtersMetadata.map((filter) => {
        if (initialLoad || filter.repopulate) filter.localdata = dropdownFilterValues[filter.mapping.filterId] || [];
      });
    this.setState({ filtersMetadata, initialLoad: false });
  }

  // Process Adapter handles the request and response for API calls.
  // BeforeLoadComplete - Populates the grid and updates the state for filter dropdowns.
  // DownloadComplete - Sets the page totals for the grid.
  // LoadComplete - Sets the filter values for the dropdowns.
  processAdapter(source) {
    let compRef = this;
    if (source) {
      const { filterdef } = this.props.metadata;
      let dataAdapter = new $.jqx.dataAdapter(source, {
        formatData: this.formatData,
        beforeLoadComplete: function (records, responseData) {
          compRef.updateDropdownFilters(filterdef, responseData);
          //source.data.initialLoad = false;
          compRef.setState({ initialLoad: false });
        },
        downloadComplete: function (data, status, xhr) {
          if (data != null && data.candidateRecords.length > 0) {
            source.totalrecords = data.candidateRecords[0].totalRows;
          }
        },
        loadComplete: function (data, status) {
          const { filtersMetadata } = compRef.state;
          compRef.refs.extendedGrid.on("pagechanged", (event) => {
            compRef.refs.extendedGrid.clearselection();
          });
          filtersMetadata &&
            filtersMetadata.map((filter) => {
              let columnName = filter.mapping.columnName;
              compRef.refs.extendedGrid.setcolumnproperty(columnName, "filteritems", filter.localdata);
            });
        },
        loadError: function (xhr, status, error) {
          throw new Error(error);
        },
      });
      return dataAdapter;
    }
  }

  //Binds with juxGrid.aggregates to display totals for individual columns
  componentDidMount() {
    if (this.refs.extendedGrid) jqxGrid.aggregates = Aggregates;
  }

  // Renders the Grid
  render() {
    const { styles, metadata, formProps } = this.props;
    const { pgdef, griddef } = metadata;
    const { filtersMetadata } = this.state;
    let dataAdapter = this.buildDataAdapter();
    let newColumns = columnModifier(griddef, filtersMetadata);
    if (pgdef.childConfig && Array.isArray(pgdef.childConfig) && pgdef.childConfig.length) {
      const childColumns = pgdef.childConfig.map(({ pgid, columnHeader = "View" }) =>
        getChildColumn(columnHeader, pgid)
      );
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

    let showaggregates = formProps.showaggregates || false;
    let showstatusbar = formProps.showstatusbar || false;
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
            rendergridrows={(obj) => {
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
            sortable={griddef.sortable || false}
            filterable={griddef.filterable || false}
            showfilterrow={griddef.showfilterrow || false}
          />
        </Row>
      </Fragment>
    );
  }
}
export default ExtendedGrid;
