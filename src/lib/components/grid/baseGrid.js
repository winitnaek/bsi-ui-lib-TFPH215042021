import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import JqxTooltip from "../../../../src/deps/jqwidgets-react/react_jqxtooltip";
import { copyToClipboard } from "../../utils/copyToClipboard";
import ClipboardToast from "../../clipboardToast";
import { Col, Row, UncontrolledTooltip, Badge } from "reactstrap";
import ReusableModal from "../../reusableModal";
import DynamicForm from "../../dynamicForm";
import CustomDate from "../../inputTypes/date";
import ConfirmModal from "../../confirmModal";
import ReusableAlert from "../../reusableAlert";
import Grid from "../../../../src/deps/jqwidgets-react/react_jqxgrid";
import ViewPDF from "../../viewPDF";
import PageTitle from "../../components/header/pageTitle";
import PageFilters from "../../components/header/pageFilters";
import PageActions from "../../components/header/pageActions";
import PageFooter from "../../components/footer/pageFooter";

class BaseGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allSelected: false,
      showClipboard: false,
      numOfRows: 0,
      isOpen: false,
      viewPdfMode: false,
      isSaveSuccess: false,
      showConfirm: false,
      alertInfo: {
        showAlert: false,
        aheader: "",
        abody: "",
        abtnlbl: "Ok"
      },
    };

    this.editClick = (index, pgid) => {
      let _id = document.querySelector("div[role='grid']").id;
      let dataRecord = $("#" + _id).jqxGrid("getrowdata", index);
      const data = { formData: dataRecord, mode: "Edit", index: index };
      const setIsOpen = () => {
        this.setState({ isOpen: true, index });
      };
      async function dispatchAction(setFormData, setIsOpen) {
        setFormData(data);
        await setIsOpen();
      }
      const { setFormData } = this.props;
      dispatchAction(setFormData, setIsOpen);
    };

    this.handleChildGrid = (childId, rowIndex) => {
      const { setFilterFormData, tftools, renderGrid, fieldData } = this.props;
      const { isDateFilter } = this.state;
      if (rowIndex !== undefined) {
        let _id = document.querySelector("div[role='grid']").id;
        let dataRecord = $("#" + _id).jqxGrid("getrowdata", rowIndex);
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

    this.handleParentGrid = () => {
      const { tftools, renderGrid } = this.props;
      const parentConfig = this.state.parentConfig.pgdef.pgid;
      const pgData = tftools.filter(item => {
        if (item.id === parentConfig) {
          return item;
        }
      });
      renderGrid(pgData[0]);
    };

    this.handleNewForm = (e, formProps) => {
      e.preventDefault();
      const { values = {} } = formProps || {};
      const payload = { data: values, mode: "New" };
      const { setFormData } = this.props;
      setFormData(payload);
      this.setState({ isOpen: true });
    };

    this.handlePdfView = () => {
      this.setState({
        viewPdfMode: !this.state.viewPdfMode
      });
    };

    this.handleSubmit = (pgid, payload, mode, rowid) => {
      const { saveGridData } = this.props;
      saveGridData.saveGridData(pgid, payload, mode);
      this.props.closeForm();
    };

    this.OpenHelp = () => {
      this.props.help(this.state.pgid);
    };

    this.toggle = isSaveSuccess => {
      this.setState({ isOpen: false, isSaveSuccess }, () => {
        window.setTimeout(() => {
          this.setState({ isSaveSuccess: false });
        }, 2000);
      });
    };

    this.deleteRow = index => {
      const { pgid, index: rowIndex } = this.state;
      let _id = document.querySelector("div[role='grid']").id;
      const rowid = $("#" + _id).jqxGrid("getrowid", index || rowIndex);
      // need to uncomment below when hooking up to api
      // this.props.deleteGridData(pgid, rowid)
      const { deleteGridData } = this.props;
      deleteGridData.deleteGridData(pgid, this.props.formData.data, "Edit").then(deleteStatus => {
        if (deleteStatus.status === "SUCCESS") {
          $("#" + _id).jqxGrid("deleterow", rowid);
          alert(deleteStatus.message);
        } else if (deleteStatus.status === "ERROR") {
          alert(deleteStatus.message);
        }
      });
    };

    this.deleteAll = () => {
      this.setState({
        showConfirm: true
      });
    };

    this.handleOk = () => {
      let _id = document.querySelector("div[role='grid']").id;
      const { deleteGridData } = this.props;
      const { pgid } = this.state;
      const griddata = $("#" + _id).jqxGrid("getdatainformation");
      const rows = [];
      for (let i = 0; i < griddata.rowscount; i++) {
        rows.push($("#" + _id).jqxGrid("getrenderedrowdata", i));
      }

      // TODO: Check with API team which method to call to delete all rows
      deleteGridData.deleteGridData(pgid, rows, "Edit");

      $("#" + _id).jqxGrid("clear");
      this.setState({
        showConfirm: false
      });
    };

    this.handleCancel = () => {
      this.setState({
        showConfirm: false
      });
    };

    this.mapToolUsage = (id, successMessage, errorMessage) => {
      const { mapToolUsage } = this.props;
      const { pgid } = this.state;
      // TODO: Check for request payload format
      mapToolUsage.createDefaultMapping(pgid, { id }).then(res => {
        const { alertInfo } = this.state;
        this.setState({
          alertInfo: Object.assign({}, alertInfo, { abody: successMessage, showAlert: true })
        });
      });
    };

    this.handleAlertOk = () => {
      const {pgid} = this.state;
      this.renderMe(pgid, filter, false);
    };

    this.renderMe = (pgid, values, filter) => {
      const { setFilterFormData, setFormData, tftools, renderGrid } = this.props;

      if (filter) {
        setFilterFormData(values);
        setFormData({ formData: values, mode: "Edit", index: null });
        this.setState({ filterFormData: values });
      }

      let data = tftools.filter(tftool => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(data[0]);
    };

    this.columnCounter = 1;
    this.toolTipRenderer = this.toolTipRenderer.bind(this);
    this.onDateFilterChange = this.onDateFilterChange.bind(this);
  }

  onDateFilterChange(event) {
    const { fieldData } = this.props;
    fieldData[0].value = event.target.value;
    this.setState({
      fieldData: [...fieldData]
    });
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
    const { serverPaging,source,metadata} = this.props;
    let {griddef} = metadata;
    let dataAdapter = null;
    if (serverPaging) {
      dataAdapter = this.processAdapter(source);
      return dataAdapter;
    } else {
   
      let data = this.props.griddata;
      let { dataFields } = griddef;
      let source = {
        datatype: "json",
        datafields: dataFields,
        localdata: data
      };
      dataAdapter = new $.jqx.dataAdapter(source);
    }
    return dataAdapter;
  }

  processAdapter(source) {
    if (source) {
      let dataAdapter = new $.jqx.dataAdapter(source, {
        formatData: function (data) {
          try {
            return JSON.stringify(data);
          } catch (error) {
            return data;
          }
        },
        downloadComplete: function (data, status, xhr) {
          if (data != null && data.candidateRecords.length > 0) {
            source.totalrecords = data.candidateRecords[0].totalRows;
          }
        },
        beforeLoadComplete: function (records, sourceData) {},
        loadError: function (xhr, status, error) {
          throw new Error(error);
        }
      });
      return dataAdapter;
    }
  }

  render() {
    const {
        styles,tftools,saveGridData,formData,fieldData,filterFormData,
        formFilterData,getFormData,mapToolUsage,renderGrid,recentUsage,
        metadata,serverPaging} = this.props;
    const { pgdef,cruddef,griddef} = metadata;
    const {columns,isfilterform} = griddef;
    const {pgid} = pgdef;
    const {isOpen,recordEdit} = this.state;

    let dataAdapter = this.buildDataAdapter();
    let permissions = this.props.permissions(pgid);
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
    const { deleteRow, handleChange, renderMe, handleSubmit } = this;
    let filter;
    if (isfilterform) filter = true;
    const close = this.toggle;
    const formProps = {
      close,
      handleChange,
      pgid,
      permissions,
      deleteRow,
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
            <PageTitle styles = {styles} help={this.props.help} pgid={pgid} pgdef={metadata.pgdef} />
            <PageFilters styles = {styles} griddef = {metadata.griddef} fieldData = {fieldData} formFilterData = {formFilterData} />
            <PageActions styles = {styles} griddef = {metadata.griddef} 
                         pgdef={metadata.pgdef} handleNewForm = {this.handleNewForm}
            />
            <Row>
                <Grid
                    ref="reusableGrid"
                    id="myGrid"
                    width="100%"
                    altrows={true}
                    source={dataAdapter}
                    columns={newColumns}
                    pageable={true}
                    autoheight={true}
                    virtualmode={serverPaging ? true : false}
                    rendergridrows={obj => {
                    if (serverPaging) this.dispatchGridData(obj);
                    return obj.data;
                    }}
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
            <PageFooter styles = {styles} pgdef={metadata.pgdef} pgid={pgid} mapToolUsage={mapToolUsage} />
            <ViewPDF view={this.state.viewPdfMode} handleHidePDF={this.handlePdfView} />
            <ReusableModal open={isOpen} close={this.toggle} pgdef={pgdef} cruddef={cruddef} styles={styles}>
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
            </ReusableModal>
            {metadata.confirmdef ? (
            <ConfirmModal
                showConfirm={this.state.showConfirm}
                {...metadata.confirmdef}
                handleOk={this.handleOk}
                handleCancel={this.handleCancel}
            />
            ) : null}
            {this.state.alertInfo.showAlert ? (
            <ReusableAlert {...this.state.alertInfo} handleClick={this.handleAlertOk} />
            ) : null}
      </Fragment>
    );
  }
}
export default BaseGrid;


