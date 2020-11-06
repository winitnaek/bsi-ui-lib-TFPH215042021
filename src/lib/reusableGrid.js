import React, { Fragment } from "react";
import { copyToClipboard } from "./utils/copyToClipboard";
import ClipboardToast from "./clipboardToast";
import { Col, Row, UncontrolledTooltip } from "reactstrap";
import ReusableModal from "./reusableModal";
import DynamicForm from "./dynamicForm";
import Progress from "./progress";
import Grid from "../deps/jqwidgets-react/react_jqxgrid";
import aggregates from "../../res/js/jqwidgets/jqxgrid.aggregates";
class ReusableGrid extends React.Component {
  constructor(props) {
    super(props);
    let metadata = this.props.metadata;
    this.state = {
      value: "",
      gridData: this.props.gridData || [],
      pgdef: metadata.pgdef,
      pgid: metadata.pgdef.pgid,
      griddef: metadata.griddef,
      cruddef: metadata.cruddef,
      columns: metadata.griddef.columns,
      dataFields: metadata.griddef.dataFields,
      title: metadata.pgdef.pgtitle,
      subtitle: metadata.pgdef.pgsubtitle,
      addNewLabel: metadata.pgdef.addNewLabel,
      recordEdit: metadata.griddef.recordEdit,
      recordDelete: metadata.griddef.recordDelete,
      noResultsFoundTxt: metadata.griddef.noResultsFoundTxt || "",
      hasAddNew: metadata.pgdef.hasAddNew,
      actiondel: metadata.pgdef.actiondel,
      helpLabel: metadata.pgdef.helpLblTxt,
      isfilterform: metadata.griddef.isfilterform,
      filterFormData: {},
      childConfig: metadata.pgdef.childConfig,
      parentConfig: metadata.pgdef.parentConfig,
      isfilter: metadata.griddef.isfilter,
      mockData: [],
      child: this.props.child,
      allSelected: false,
      showClipboard: false,
      numOfRows: 0,
      isOpen: false,
      isLoading: false,
      refresh: false,
    };

    this.editClick = async (index) => {
      const { pageid,setFormData,gridType,setPageFormData} = this.props;
      let _id = document.querySelector("div[role='grid']").id;
      let dataRecord = $("#" + _id).jqxGrid("getrowdata", index);
      const data = { data: dataRecord, mode: "Edit", index: index };
      if(gridType == "comp"){
        await setFormData(pageid,"Edit",data);
        this.setState({ isOpen: true });
      }else{
        await setPageFormData(pageid,"Edit",data);
      }
    };

    this.cellClick = async (cell) => {
      const { pageid,setFormData,gridType,setPageFormData} = this.props;
      let _id = document.querySelector("div[role='grid']").id;
      const decodedCell = decodeURIComponent(cell);
      const cellInfo = JSON.parse(decodedCell); 
      let dataRecord = $("#" + _id).jqxGrid("getrowdata", cellInfo.index);
      const data = {data: dataRecord, mode: "Edit",cell: cellInfo};
      if(gridType == "comp"){
        await setFormData(pageid,"Edit",data);
        this.setState({ isOpen: true });
      }else{
        await setPageFormData(pageid,"Edit",data);
      }
    };

    this.autoFill = async (index) => {
      const { pageid ,setFormData } = this.props;
      let _id = document.querySelector("div[role='grid']").id;
      let dataRecord = $("#" + _id).jqxGrid("getrowdata", index);
      const data = { data: dataRecord, mode: "Edit", index: index };
      await setFormData(pageid,"Edit",data);
    };

    this.handleChildGrid = async (index) => {
      const {pageid,setFormData,tftools,renderGrid, gridType,setPageFormData} = this.props;
      const {childConfig} = this.state;
      let _id = document.querySelector("div[role='grid']").id;
      let data = $("#" + _id).jqxGrid("getrowdata", index);
      if(gridType == "page"){
        await setPageFormData(pageid,"renderChild",data);
      }else{
        await setFormData(pageid, "Edit", data);
        const pgData = tftools.filter((item) => {
          if (item.id === childConfig) {
            return item;
          }
        });
        renderGrid(pgData[0]);
      }
    };

    this.handleParentGrid = () => {
      const { tftools,renderGrid,metadata} = this.props;
      const parentConfig = metadata.pgdef.parentConfig;
      const pgData = tftools.filter((item) => {
        if (item.id === parentConfig) {
          return item;
        }
      });
      renderGrid(pgData[0]);
    };

    this.handleNewForm = async (e) => {
      e.preventDefault();
      debugger
      const {pageid,setFormData } = this.props;
      const payload = { data: {}, mode: "New" };
      await setFormData(pageid,"New",payload);
      this.setState({ isOpen: true });
    };

    this.handleFilterForm = async () => {
      const {pageid,setFormData,filterFormData } = this.props;
      const payload = {
        formData: filterFormData,
        mode: "Edit",
        index: null,
      };
      await setFormData(pageid,"Edit",payload);
      this.setState({ isOpen: true });
    };

    this.handleFilter = (e) => {
      e.preventDefault();
      // Either Render Parent Grid or Toggle isOpen to Open Modal
      const { parentConfig } = this.state;
      parentConfig
        ? this.handleChildGrid(parentConfig.pgdef.pgid)
        : this.handleFilterForm(e);
    };

    this.handleSubmit = (pgid, payload, mode, rowid) => {
      const { saveGridData } = this.props;
      saveGridData.saveGridData(pgid, payload, mode);
      this.setState({isOpen:false});
      this.props.closeForm();
    };

    this.saveDataFunction = async (data) => {
      debugger
      const {setGridData} = this.props;
      await setGridData(data);
    }

    this.saveAndRefresh = async (pgid,values,mode) => {
      const { saveGridData } = this.props;
      this.setState({isLoading:true});
      let payload = await saveGridData.saveGridData(pgid, values, mode);
      this.setState({gridData:payload,isLoading:false,refresh:true});
      setTimeout(this.setState({refresh:false}),0)
    } 

    this.OpenHelp = () => {
      this.props.help(this.state.pgid);
    };

    this.toggle = () => {
      this.setState({ isOpen: false });
    };

    this.deleteHandler = async (data) => {
      debugger
          const {pgid} = this.state;
          const { deleteGridData} = this.props;
            this.setState({isLoading:true});
            let payload = await deleteGridData.deleteGridData(pgid,data,"Edit");
            this.setState({gridData:payload,isLoading:false,refresh:true});
            setTimeout(this.setState({refresh:false}),0);
    };

    this.renderMe = async (pgid, values, filter) => {
      const {setFormData,tftools,renderGrid} = this.props;
      if (filter) {
        let data = { data: values, mode: "Filter", index: null };
        await setFormData(pgid,"Filter",data);
      }
      let tftool = tftools.filter((tftool) => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(tftool[0]);
    };
    
  }

  componentDidMount() {
    const {gridData,metadata,filterFormData} = this.props;
    const {griddef} = this.state;
    if (!gridData) this.setState({noResultsFoundTxt: metadata.griddef.noResultsFoundTxt});
    if(griddef.isfilterform && filterFormData && !filterFormData.filter){
      this.setState({isOpen: true});
    }
    if (this.refs.reusableGrid) {
      jqxGrid.aggregates = aggregates
     }
  }

  exportToExcel() {
    debugger
    const {griddef} = this.state;
    const {exportExternal,pageid} = this.props;
    if(griddef.exportExternal)
      exportExternal({pageid:pageid,type:"xls"});
    else
      this.refs.reusableGrid.exportdata("xls", this.state.pgid);
  }

  exportToCsv() {
    const {griddef} = this.state;
    const {exportExternal,pageid} = this.props;
    if(griddef.exportExternal)
      exportExternal({pageid:pageid,type:"csv"});
    else
      this.refs.reusableGrid.exportdata("csv", this.state.pgid);
  }

  copyToClipboardHandler(event) {
    event.preventDefault();
    var numOfRows = copyToClipboard();
    this.setState(
      {
        showClipboard: true,
        numOfRows: numOfRows,
      },
      () => {
        window.setTimeout(() => {
          this.setState({ showClipboard: false });
        }, 2000);
      }
    );
  }

  addColLinks(columns){
    return columns.map((column) => { 
      if (column.link) {
        column = {
          text: column.text, datafield: column.datafield, align: column.align, cellsalign: column.cellsalign, cellsformat: 'c2', 
          cellsrenderer: function (index, datafield, value, defaultvalue, column, rowdata) {
            let cell = {
              index:index,
              datafield: datafield,
              value: value
          };
          let cellJSON = encodeURIComponent(JSON.stringify(cell));
                return `<a href='#' id='${datafield}-${index}' class='click' onClick={cellClick('${cellJSON}')}><div style="padding-left:4px;padding-top:8px">${value}</div></a>`;
          }
        }
      }else if (column.autoFill){
        column = {
          text: column.text, datafield: column.datafield, align: column.align, cellsalign: column.cellsalign, cellsformat: 'c2', 
          cellsrenderer: function (ndex, datafield, value, defaultvalue, column, rowdata) {
                return `<a href='#' id='${datafield}-${ndex}' class='click' onClick={autoFill(${ndex})}><div style="padding-left:4px;padding-top:8px">${value}</div></a>`;
          }
        }
      }
      return column; 
  });
}

buildDataAdapter() {
  const {serverPaging,metadata,source} = this.props;
  let {dataFields} = metadata.griddef;
  let dataAdapter = null;
  if(serverPaging){
    dataAdapter = this.processAdapter(source);
    return dataAdapter;
  }else{
    let {gridData} = this.state;
    let source = {
      datatype: "json",
      datafields: dataFields,
      localdata: gridData,
    };
    dataAdapter = new $.jqx.dataAdapter(source);
  }
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

  render() {
    let {gridData} = this.state;
    let {metadata,permissions,formProps} = this.props;
    let {dataFields} = metadata.griddef;
    let dataAdapter = this.buildDataAdapter();
    const editCellsRenderer = (ndex) => {
      if (metadata.pgdef.childConfig) {
        return ` <div id='edit-${ndex}'style="text-align:center; margin-top: 10px; color: #4C7392" onClick={handleChildGrid(${ndex})}> <i class="fas fa-search  fa-1x" color="primary"/> </div>`;
      } else {
        return ` <div id='edit-${ndex}'style="text-align:center; margin-top: 10px; color: #4C7392" onClick={editClick(${ndex})}> <i class="fas fa-pencil-alt  fa-1x" color="primary"/> </div>`;
      }
    };

    let text;
    this.state.pgdef.childConfig ? (text = "View") : (text = "Edit");
    const editColumn = {
      text: text,
      datafield: "edit",
      align: "center",
      width: "5%",
      cellsrenderer: editCellsRenderer,
    };

    const { columns, numOfRows, showClipboard } = this.state;
    let newColumns = this.addColLinks(columns);
    if (this.state.recordEdit) {
      newColumns = [...newColumns, editColumn];

      // this is temporary code to override permissions
      if (!permissions) {
        permissions = {
          VIEW: true,
          SAVE: true,
          DELETE: true,
          RUN: true,
          AUDIT: false,
        };
      }

      if (!permissions.SAVE) {
        newColumns = newColumns.filter((item) => {
          return item.text !== "Edit";
        });
      }

      if (!permissions.DELETE) {
        newColumns = newColumns.filter((item) => {
          return item.text !== "Delete";
        });
      }
    }

    const {
      title,
      cruddef,
      isfilterform,
      pgid,
      subtitle,
      noResultsFoundTxt,
      isOpen,
      isfilter,
      parentConfig,
      griddef,
      pgdef,
      helpLabel,
      allSelected,
      hasAddNew,
      actiondel,
      addNewLabel,
      filterFormData,
      isLoading,
      refresh,
    } = this.state;
    const { deleteRow, handleChange,renderMe, handleSubmit } = this;
    let filter;
    if (isfilterform) filter = true;
    const close = this.toggle;
    const deleteHandler = this.deleteHandler;
    const saveAndRefresh = this.saveAndRefresh;
    const saveHandler = this.saveHandler;
    if(!formProps) {
      formProps = {
        close,
        handleChange,
        pgid,
        permissions,
        deleteRow,
        deleteHandler,
        saveHandler,
        saveAndRefresh,
        handleSubmit,
        renderMe,
        filter,
      };
  }

    module.exports = this.editClick;
    window.editClick = this.editClick;
    module.exports = this.autoFill;
    window.autoFill = this.autoFill;
    module.exports = this.cellClick;
    window.cellClick = this.cellClick

    module.exports = this.handleChildGrid;
    window.handleChildGrid = this.handleChildGrid;
    module.exports = this.setGridData;
    window.exports = this.setGridData;
    const {
      styles,
      tftools,
      saveGridData,
      deleteGridData,
      formData,
      fieldData,
      getFormData,
      setFormData,
      renderGrid,
      customTitle,
      hideTitle,
      gridType,
      serverPaging
    } = this.props;
    
    let formatedFilterData = "";
    let showaggregates= formProps.showaggregates || false;
    let showstatusbar= formProps.showstatusbar || false;

    return (
      <Fragment>
        <Row>
        {(!customTitle && !hideTitle) &&
          <Row>
              <h1 style={styles.pagetitle}>{title}</h1>
              <div style={styles.helpMargin}>
                <span id="help">
                  <i
                    className="fas fa-question-circle  fa-lg"
                    onClick={this.OpenHelp}
                    style={styles.helpicon}
                  />
                </span>
                <UncontrolledTooltip placement="right" target="help">
                  <span> {helpLabel} </span>
                </UncontrolledTooltip>
              </div>
          </Row>
          } 
        {(!hideTitle && customTitle) &&
          <div>
             <h1 style={styles.pagetitle}>{customTitle}</h1>
          </div>
          }
        </Row>
        {griddef.gridtype == "type2" && gridData[0] &&  pgdef.parentConfig ? (
          <Row>
            <p>
              {source.localdata && subtitle}
              {source.localdata && formatedFilterData}
            </p>
          </Row>
        ) : null}
        {griddef.gridtype == "type2" && gridData[0] && pgdef.childConfig ? (
          <Row>
            <p>
              {source.localdata && subtitle}
            </p>
          </Row>
        ) : null}
        <Row style={styles.rowTop}>
          <Col sm="2" />
          <Col sm="8">
            {showClipboard && (
              <ClipboardToast numOfRows={numOfRows} />
            )}
          </Col>
          <Col sm="2" style={styles.iconPaddingRight}>
            {hasAddNew && (
              <div style={{float:"right", marginLeft: 8}}>
                <div id="addNew">
                  <a href="" onClick={this.handleNewForm}>
                    <i className="fas fa-calendar-plus  fa-2x" />
                  </a>
                </div>
                <UncontrolledTooltip placement="right" target="addNew">
                  <span> {addNewLabel}</span>
                </UncontrolledTooltip>
              </div>
            )}
            {actiondel ? (
              <div style={{float:"right", marginLeft: 8}}>
                <div id="delAll">
                  <a href="" onClick="">
                    <i className="fas fa-calendar-minus fa-2x" />
                  </a>
                </div>
                <UncontrolledTooltip placement="right" target="delAll">
                  <span> Delete All </span>
                </UncontrolledTooltip>
              </div>
            ) : null}
            {isfilter && (
            <div style={{float:"right", marginLeft: 8}}>
              {parentConfig ? (
                <div id="filter">
                  <a href="" onClick={this.handleParentGrid}>
                    <i className="fas fa-arrow-up  fa-2x" />
                  </a>
                  <UncontrolledTooltip placement="right" target="filter">
                    Return to prior screen
                  </UncontrolledTooltip>
                </div>
              ) : (
                <div id="filter" style={{float:"right", marginLeft: 8}} >
                  <a href="" onClick={this.handleFilter}>
                    <i className="fas fa-filter fa-2x" />
                  </a>
                  <UncontrolledTooltip placement="right" target="filter">
                    Modify Selection Criteria
                  </UncontrolledTooltip>
                </div>
              )}
            </div>
          )}
          </Col>
        </Row>

        <Row>
        {isLoading && <Progress />}
        {!refresh &&
          <Grid
            ref="reusableGrid"
            id="myGrid"
            width="100%"
            altrows={true}
            columnsresize={true} 
            columnsautoresize={true}
            source={dataAdapter}
            virtualmode={serverPaging?true:false}
            rendergridrows = {(obj) => {
              if(gridType == "page") this.saveDataFunction(obj);
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
        }
        </Row>

        <Row style={styles.gridRowStyle}>
          <a href="#" id="exportToExcel" onClick={() => this.exportToExcel()}>
            <i class="fas fa-table fa-lg fa-2x"></i>
          </a>
          <UncontrolledTooltip placement="right" target="exportToExcel">
            <span> Export to Excel </span>
          </UncontrolledTooltip>
          <a
            href="#"
            id="exportToCsv"
            onClick={() => this.exportToCsv()}
            style={styles.gridLinkStyle}
          >
            <i class="fas fa-pen-square fa-lg fa-2x"></i>
          </a>
          <UncontrolledTooltip placement="right" target="exportToCsv">
            <span> Export to CSV </span>
          </UncontrolledTooltip>

          <a
            href="#"
            id="copyToClipboard"
            onClick={(e) => this.copyToClipboardHandler(e)}
            style={styles.gridLinkStyle}
          >
            <i class="far fa-copy fa-lg fa-2x"></i>
          </a>
          <UncontrolledTooltip placement="right" target="copyToClipboard">
            <span> Copy to clipboard </span>
          </UncontrolledTooltip>
        </Row>
        <ReusableModal
          open={isOpen}
          close={this.toggle}
          title={title}
          cruddef={cruddef}
          styles={styles}
        >
          <DynamicForm
            gridType={gridType}
            formData={formData}
            renderMe={this.renderMe}
            formProps={formProps}
            fieldData={fieldData}
            tftools={tftools}
            toggle={this.toggle}
            renderGrid={renderGrid}
            metadata={metadata}
            setFormData={setFormData}
            getFormData={getFormData}
            saveGridData={saveGridData}
            deleteGridData={deleteGridData}
          />
        </ReusableModal>
      </Fragment>
    );
  }
}


export default ReusableGrid;