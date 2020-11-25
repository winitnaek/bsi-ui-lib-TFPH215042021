import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import JqxTooltip from "../../../deps/jqwidgets-react/react_jqxtooltip";
import {Row} from "reactstrap";
import FormModal from "../../formModal";
import DynamicForm from "../../dynamicForm";
import Grid from "../../../deps/jqwidgets-react/react_jqxgrid";

class BaseGridTF extends React.Component {
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
      const {pageid,setFormData,setIsOpen,gridSelectionHandler} = this.props;
      let dataRecord = this.getSelectedRow(index);
      const data = { data: dataRecord, mode: "Edit", index: index };
      debugger
      if(gridSelectionHandler) gridSelectionHandler(pageid,"Edit",data);
      else {
        await setFormData(pageid,"Edit",data);
        setIsOpen(true);
      }
    };

    //TODO
    this.handleChildGrid = (childId, index) => {
      const { setFilterFormData, tftools, renderGrid, fieldData} = this.props;
      const { isDateFilter } = this.state;
      if (index !== undefined) {
        let dataRecord = this.getSelectedRow(index);
        if (isDateFilter) {
          const { id, value } = fieldData[0];
          dataRecord[id] = value;
        }
        setFilterFormData(dataRecord);
      }
      const pgData = tftools.find(tool => tool.id === childId);
      renderGrid(pgData);
    };

    this.dispatchGridData = async data => {
      const { setGridData } = this.props;
      await setGridData(data);
    };

    this.handleSubmit = (pgid, payload, mode, rowid) => {
      const { saveGridData,setIsOpen} = this.props;
      saveGridData.saveGridData(pgid, payload, mode);
      setIsOpen(false);
    }

    this.saveAndRefresh = async (pgid,values,mode) => {
      const { saveGridData } = this.props;
      this.setState({isLoading:true});
      let payload = await saveGridData.saveGridData(pgid, values, mode);
      this.setState({gridData:payload,isLoading:false,refresh:true});
      setTimeout(this.setState({refresh:false}),0)
    } 

    this.close = () => {
      const {setIsOpen} = this.props;
      setIsOpen(false);
    }

    //TODO
    //This method needs to be externalised, only used by TF, doesnot refresh grid
    this.deleteRow = async index => {
      let _id = document.querySelector("div[role='grid']").id;
      const rowid = $("#" + _id).jqxGrid("getrowid", index || rowIndex);
      // need to uncomment below when hooking up to api
      // this.props.deleteGridData(pgid, rowid)
      const {deleteGridData,pageid} = this.props;
      debugger
      deleteGridData.deleteGridData(pageid, this.props.formData.data, "Edit")
      .then((deleteStatus) => {
          if (deleteStatus.status === "SUCCESS") {
            $("#" + _id).jqxGrid("deleterow", rowid);
            alert(deleteStatus.message);
          } else if (deleteStatus.status === "ERROR") {
            alert(deleteStatus.message);
          }
      });
    };

    this.handleFilterForm = e => {
      const { formFilterData,setFormData,setIsOpen} = this.props;
      const payload = {
        formData: formFilterData,
        mode: "Edit",
        index: null
      };
        setFormData(payload);
        setIsOpen(true);
    };

    //This method is used to reload the grid data
    this.renderMe = (pgid, values, filter) => {
      const { setFilterFormData, setFormData, tftools, renderGrid } = this.props;
      if (filter) {
        setFilterFormData(values);
        setFormData({ formData: values, mode: "Edit", index: null });
        this.setState({ filterFormData: values });
      }
      let tftool = tftools.filter(tftool => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(tftool[0]);
    };

    this.columnCounter = 1;
    this.toolTipRenderer = this.toolTipRenderer.bind(this);
  }

  toolTipRenderer(element) {
    const id = `toolTipContainer${this.columnCounter}`;
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
    this.columnCounter++;
  }


  addColLinks(columns) {
    return columns.map(column => {
      if (column.link) {
        column = {
          text: column.text,
          datafield: column.datafield,
          align: column.align,
          cellsalign: column.cellsalign,
          cellsformat: "c2",
          cellsrenderer: function (ndex, datafield, value, defaultvalue, column, rowdata) {
            return `<a href='#' id='${datafield}-${ndex}' class='click' onClick={editClick(${ndex})}><div style="padding-left:4px">${value}</div></a>`;
          }
        };
      }
      column.rendered = this.toolTipRenderer;
      return column;
    });
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
  render() {
    const {
        styles,tftools,saveGridData,formData,fieldData,filterFormData,
        getFormData,renderGrid,recentUsage,
        metadata,isOpen} = this.props;
    debugger
    const { pgdef,griddef,formdef} = metadata;
    const {columns,isfilterform,recordEdit} = griddef;
    const {pgid} = pgdef;

    let dataAdapter = this.buildDataAdapter();
    let permissions = this.props.permissions;
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

      // this is temporary code to override permissions
      if (!permissions) {
        permissions = {
          VIEW: true,
          SAVE: true,
          DELETE: true,
          RUN: true,
          AUDIT: false
        };
      }

      if (!permissions.SAVE) {
        newColumns = newColumns.filter(item => {
          return item.text !== "Edit";
        });
      }

      if (!permissions.DELETE) {
        newColumns = newColumns.filter(item => {
          return item.text !== "Delete";
        });
      }
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
    const {close, deleteRow, handleChange, renderMe, handleSubmit, saveAndRefresh} = this;
    let filter = isfilterform ? true:false;
    const formProps = {
      close,
      handleChange,
      pgid,
      permissions,
      deleteRow,
      saveAndRefresh,
      handleSubmit,
      renderMe,
      filter
    };

    module.exports = this.editClick;
    module.exports = this.handleChildGrid;
    // Below "Global Methods" method's are used by Grid Cell Renderer
    window.editClick = this.editClick;
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
            <FormModal open={isOpen} close={this.close} metadata={metadata} formdef={formdef} styles={styles}>
                <DynamicForm
                    formData={formData}
                    renderMe={this.renderMe}
                    formProps={formProps}
                    fieldData={fieldData}
                    tftools={tftools}
                    renderGrid={renderGrid}
                    metadata={metadata}
                    filterFormData={filterFormData}
                    recentUsage={recentUsage}
                    getFormData={getFormData}
                    saveGridData={saveGridData}
                    handleChildGrid={() => handleChildGrid(this.state.index)}
                    handleSaveAs={this.handleNewForm}
                    handleCancel={this.handleFilterForm}
                    handlePdfView={this.handlePdfView}
                    formFilterData={this.props.formFilterData}
                />
            </FormModal>
      </Fragment>
    );
  }
}
export default BaseGridTF;


