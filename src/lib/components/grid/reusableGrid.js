import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import JqxTooltip from "../../../deps/jqwidgets-react/react_jqxtooltip";
import { copyToClipboard } from "../toast/copyToClipboard";
import ClipboardToast from "../toast/clipboardToast";
import { Col, Row, UncontrolledTooltip, Badge } from "reactstrap";
import ReusableModal from "../modal/reusableModal";
import DynamicForm from "../form/dynamicForm";
import CustomDate from "../form/inputTypes/date";
import Select from "../form/inputTypes/select";
import ConfirmModal from "../modal/confirmModal";
import ReusableAlert from "../modal/reusableAlert";
import Grid from "../../../deps/jqwidgets-react/react_jqxgrid";
import ViewPDF from "../pdf/viewPDF";
class ReusableGrid extends React.Component {
  constructor(props) {
    super(props);
    let metadata = this.props.metadata;
    this.state = {
      value: "",
      pgdef: metadata.pgdef,
      pgid: metadata.pgdef.pgid,
      griddef: metadata.griddef,
      cruddef: metadata.cruddef,
      columns: metadata.griddef.columns,
      dataFields: metadata.griddef.dataFields,
      title: metadata.pgdef.pgtitle,
      subtitle: metadata.pgdef.pgsubtitle,
      caption: metadata.pgdef.caption,
      addNewLabel: metadata.pgdef.addNewLabel,
      recordEdit: metadata.griddef.recordEdit,
      recordDelete: metadata.griddef.recordDelete,
      noResultsFoundTxt: metadata.griddef.noResultsFoundTxt || "",
      hasAddNew: metadata.pgdef.hasAddNew,
      hasSave:  metadata.pgdef.hasSave,
      hasViewPdf:  metadata.pgdef.hasViewPdf,
      hasCheckbox:  metadata.pgdef.hasCheckbox,
      checkBoxLabel:  metadata.pgdef.checkBoxLabel,
      actiondel: metadata.pgdef.actiondel,
      helpLabel: metadata.pgdef.helpLblTxt,
      isfilterform: metadata.griddef.isfilterform,
      filterFormData: {},
      childConfig: metadata.pgdef.childConfig,
      parentConfig: metadata.pgdef.parentConfig,
      isfilter: metadata.griddef.isfilter,
      isDateFilter: metadata.griddef.isDateFilter,
      isSelectFilter: metadata.griddef.isSelectFilter,
      hasFilter: metadata.griddef.hasFilter,
      mockData: [],
      child: this.props.child,
      allSelected: false,
      showClipboard: false,
      numOfRows: 0,
      isOpen: false,
      viewPdfMode: false,
      isSaveSuccess: false,
      showConfirm: false,
      hasGrandChild:metadata.pgdef.hasGrandChild && metadata.pgdef.hasGrandChild===true ? true:false,
      alertInfo: {
        showAlert: false,
        aheader: "",
        abody: "",
        abtnlbl: "Ok",
      },
      alertMsgInfo: {
        showAlert: false,
        aheader: "",
        abody: "",
        abtnlbl: "Ok",
      },
      fieldData: this.props.fieldData,
      hasChildData: false,
      isSaveAs: false,
      pdfData: {},
      addtionalcheckbox: false,
      apgid:'',
      aformValues:[],
      aSaveStatus:''
    };
    this.copyToClipboardHandler = this.copyToClipboardHandler.bind(this);
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
      const { pgdef } = this.state;
      const { childConfig } = pgdef;

      const { checkForData } = childConfig && childConfig.length && childConfig[0];
      if (checkForData) {
        this.props.setFilterFormData(data.formData);
        this.props.getDataForChildGrid(childConfig[0]).then((res) => {
          this.setState({ hasChildData: !!res.length }, () => {
            dispatchAction(setFormData, setIsOpen);
          });
        });
      } else {
        dispatchAction(setFormData, setIsOpen);
      }
    };

    this.saveAndRefresh = async (pgid, values, mode, childPageId) => {
      const { saveGridData, renderGrid, tftools, renderAdditionalInfo, metadata } = this.props;
      let payload;
      if(metadata.griddef.hasAlert) {
        renderAdditionalInfo(childPageId || pgid, values, { allSelected: this.state.allSelected });
      } else {
        if(this.state.isSaveAs) {
          payload = await saveGridData.saveAsGridData(childPageId || pgid, values, mode);
          this.setState({ isSaveAs: false });
        } else  {
          payload = await saveGridData.saveGridData(childPageId || pgid, values, mode);
        }
        const pgData = tftools.find(tool => tool.id === (pgid || childPageId));
        renderGrid(pgData);
      }
    };

    this.saveSelectedData = async (event, isNotModal) => {
      if(event) {
      event.preventDefault();
      }
      const modalGridId = isNotModal ? document.querySelectorAll("div[role='grid']")[0].id :  document.querySelectorAll("div[role='grid']")[1].id;
      const griddata = $("#" + modalGridId).jqxGrid("getdatainformation");
      const payload = [];
      for (let i = 0; i < griddata.rowscount; i++) {
       const rowData = $("#" + modalGridId).jqxGrid("getrenderedrowdata", i);
       const checkBoxKey = Object.keys(rowData).filter(k => rowData[k] === true);
       if(rowData[checkBoxKey]) {
        payload.push(rowData);
       }
       if(Array.isArray(checkBoxKey)) {
         payload.push(rowData);
      }
      }
     
    const saveSuccessFull = await this.saveAndRefresh(this.props.parentPageid, payload, undefined, this.props.pageid);
     console.log("save Success")
    }

    this.handleChildGrid = async (childId, rowIndex) => {
      if(childId === "home") {
        const { saveGridData } = this.props;
        let _id = document.querySelector("div[role='grid']").id;
        let dataRecord = $("#" + _id).jqxGrid("getrowdata", rowIndex);
        const dataSetId = dataRecord.dataSetId;
        const payload = await saveGridData.setDataSet(dataSetId).then((data) => {
          this.props.updateDataSet(data);
        });
        return;
      }
      if(childId === "permissions") {
        const userDataSet = JSON.parse(sessionStorage.getItem('up') || '{}').dataset
        sessionStorage.setItem('newDataName', userDataSet);
      }
      const { setFilterFormData, tftools, renderGrid } = this.props;
      const { isDateFilter, fieldData } = this.state;
      if (rowIndex !== undefined) {
        let _id = document.querySelector("div[role='grid']").id;
        let dataRecord = $("#" + _id).jqxGrid("getrowdata", rowIndex);
        if (isDateFilter) {
          const { id, value } = fieldData[0];
          dataRecord[id] = value;
        }
        setFilterFormData(dataRecord);
        if(this.props.setParentInfo){//Do not remove this. To Handle New with values from parent
          this.props.setParentInfo(dataRecord);
        }
        if(this.props.setChildInfo && this.state.hasGrandChild){//Do not remove this. To Handle New with values from parent
          this.props.setChildInfo(dataRecord);
        }
      }
      const pgData = tftools.find((tool) => tool.id === childId);
      renderGrid(pgData);
    };

    this.dispatchGridData = async (data) => {
      const { setGridData } = this.props;
      await setGridData(data);
    };

    this.handleParentGrid = () => {
      const { tftools, renderGrid } = this.props;
      const parentConfig = this.state.parentConfig.pgdef.pgid;
      const pgData = tftools.filter((item) => {
        if (item.id === parentConfig) {
          return item;
        }
      });
      renderGrid(pgData[0]);
    };

    this.handleNewForm = (e, formProps, isSaveAs) => {
      e.preventDefault();
      const { values = {} } = formProps || {};
      const payload = { formData: values, mode: "New" };
      const { setFormData } = this.props;
      setFormData(payload);
      this.setState({ isOpen: true, isSaveAs: isSaveAs });
    };

    this.handlePdfView = async (event) => {
      event.preventDefault();
      const { getPdfDataAPI, pageid, formData } = this.props;
      const pdfData = await getPdfDataAPI.getPdfData(pageid, formData.data);
      console.log("PDAPAAa", pdfData);
      this.setState({
        viewPdfMode: !this.state.viewPdfMode,
        pdfData,
      });
    };

    this.handleFilterForm = (e) => {
      const { formFilterData } = this.props;
      const payload = {
        formData: formFilterData,
        mode: "New",
        index: null,
      };
      const { setFormData } = this.props;
      const setIsOpen = () => {
        this.setState({ isOpen: true });
      };
      async function dispatchAction(setFormData, setIsOpen) {
        setFormData(payload);
        await setIsOpen();
      }
      dispatchAction(setFormData, setIsOpen);
    };

    this.handleFilter = (e) => {
      e.preventDefault();
      // Either Render Parent Grid or Toggle isOpen to Open Modal
      const { parentConfig } = this.state;
      parentConfig ? this.handleChildGrid(parentConfig.pgdef.pgid) : this.handleFilterForm(e);
    };

    this.handleSubmit = async (payload, mode, pgid, formId, actions) => {
      const { saveGridData } = this.props;
      saveGridData.saveGridData(pgid, payload, mode).then((saveStatus) => {
        if (saveStatus.status === "SUCCESS") {
          if(this.props.showActionMessage){
            this.props.showActionMessage('alert','Save',saveStatus.message);
          }else{
            alert(saveStatus.message);
          }
          this.renderMe(pgid, formValues, saveStatus);
        } else if (saveStatus.status === "ERROR") {
          if(this.props.showActionMessage){
            this.props.showActionMessage('alert','Save',saveStatus.message);
          }else{
            alert(saveStatus.message);
          }
        }
      });
      actions.resetForm({});
      this.toggle();
    };

    this.handleFilters = (pgid, values, actions) => {
      this.renderMe(pgid, values, filter);
      actions.resetForm({});
      this.toggle();
    };

    this.OpenHelp = () => {
      this.props.help(this.state.pgid);
    };

    this.toggle = (isSaveSuccess) => {
      this.setState({ isOpen: false, isSaveSuccess }, () => {
        window.setTimeout(() => {
          this.setState({ isSaveSuccess: false });
        }, 2000);
      });
    };

    this.handleDelete = (index, values) => {
      const { pgid, index: rowIndex } = this.state;
      let _id = document.querySelector("div[role='grid']").id;
      const rowid = $("#" + _id).jqxGrid("getrowid", index || rowIndex);
      // need to uncomment below when hooking up to api
      // this.props.deleteGridData(pgid, rowid)
      const { deleteGridData } = this.props;
      deleteGridData.deleteGridData(pgid, this.props.formData.data, "Edit").then((deleteStatus) => {
        if (deleteStatus.status === "SUCCESS") {
          $("#" + _id).jqxGrid("deleterow", rowid);
          if(this.props.showActionMessage){
            this.props.showActionMessage('alert','Delete',deleteStatus.message);
          }else{
            alert(deleteStatus.message);
          }
        } else if (deleteStatus.status === "ERROR") {
          if(this.props.showActionMessage){
            this.props.showActionMessage('alert','Delete',deleteStatus.message);
          }else{
            alert(deleteStatus.message);
          }
        }
      });
    };

    this.deleteAll = () => {
      this.setState({
        showConfirm: true,
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
        showConfirm: false,
      });
    };

    this.handleCancel = () => {
      this.setState({
        showConfirm: false,
      });
    };

    this.mapToolUsage = (id, successMessage, errorMessage) => {
      const { mapToolUsage, formFilterData } = this.props;
      const { pgid } = this.state;
      // TODO: Check for request payload format
      mapToolUsage.createDefaultMapping(id, { id, formFilterData }).then((res) => {
        const { alertInfo } = this.state;
        if(res.message) {
        this.setState({
          alertInfo: Object.assign({}, alertInfo, { abody: res.message, showAlert: true }),
        });
        } else {
          this.handleAlertOk();
        }
     
      });
    };

    this.handleAlertOk = () => {
      const { pgid } = this.state;
      this.renderMe(pgid, filter, false);
    };
    this.handleAlertMsgOk= () => {
      const { apgid, aformValues,aSaveStatus } = this.state;
      this.renderMe(apgid,aformValues,aSaveStatus);
    };

    this.renderMe = (pgid, values, filter) => {
      const { setFilterFormData, setFormData, tftools, renderGrid } = this.props;

      if (filter) {
        setFilterFormData(values);
        setFormData({ formData: values, mode: "Edit", index: null });
        this.setState({ filterFormData: values });
      }

      let data = tftools.filter((tftool) => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(data[0]);
    };
    this.showActionMessage =(type,action,message,pgid, formValues, saveStatus) => {
      const { alertMsgInfo } = this.state;
      this.setState({
        alertMsgInfo: Object.assign({}, alertMsgInfo, {aheader:action, abody: message, showAlert: true }),
        apgid:pgid,
        aformValues:formValues,
        aSaveStatus:saveStatus
      });
    };
    this.selectAll = (event, fromOutside) => {
      if(event) {
      event.preventDefault();
      }
      const isModal = this.props.hideModal;
      this.setState({ allSelected: fromOutside ? this.state.allSelected : true, addtionalcheckbox: true });
      let _id = isModal ?  document.querySelectorAll("div[role='grid']")[1].id : document.querySelector("div[role='grid']").id;
      $("#" + _id).jqxGrid("selectallrows");

      const griddata = $("#" + _id).jqxGrid("getdatainformation");
      const updatedData = [];
      for (let i = 0; i < griddata.rowscount; i++) {
      const rowData = $("#" + _id).jqxGrid("getrenderedrowdata", i);
      Object.keys(rowData).forEach(k => {
        if(typeof rowData[k] === "boolean" || rowData[k] === undefined) {
          rowData[k] = k === "auditPermission" ? rowData[k] : true;
          rowData.disabled =  k === "auditPermission" ? rowData.flag : true;
        }
      });
      updatedData.push(rowData);
      }

      this.props.handleHTML && this.props.handleHTML(true);

      let source = {
        datatype: "json",
        datafields: this.props.datafields,
        localdata: updatedData,
      };

      console.log("griddata", updatedData);
     const dataAdapter = new $.jqx.dataAdapter(source);
      $("#" + _id).jqxGrid({ source: dataAdapter });
      if(this.props.selectAllOutside) {
        this.props.selectAllOutside(true);
      }
    };

    this.unselectAll = (event, fromOutside) => {
      if(event) {
      event.preventDefault();
      }
     
      this.setState({ allSelected: fromOutside ? this.state.allSelected : false, addtionalcheckbox: false });
      const isModal = this.props.hideModal;
      let _id = isModal ?  document.querySelectorAll("div[role='grid']")[1].id : document.querySelector("div[role='grid']").id;
      $("#" + _id).jqxGrid("clearselection");
      const griddata = $("#" + _id).jqxGrid("getdatainformation");
      const updatedData = [];
      for (let i = 0; i < griddata.rowscount; i++) {
      const rowData = $("#" + _id).jqxGrid("getrenderedrowdata", i);
      Object.keys(rowData).forEach(k => {
        if(typeof rowData[k] === "boolean" || rowData[k] === undefined) {
          rowData[k] = false;
          rowData.disabled = k === "auditPermission" ? rowData.flag : false;
        }
      });
      updatedData.push(rowData);
      }

      let source = {
        datatype: "json",
        datafields: this.props.datafields,
        localdata: updatedData,
      };

      console.log("griddata", updatedData);
     const dataAdapter = new $.jqx.dataAdapter(source);
      $("#" + _id).jqxGrid({ source: dataAdapter });
      if(this.props.selectAllOutside) {
        this.props.selectAllOutside(false);
      }
    };

    this.toggleSelectAll = (event) => {
      event.preventDefault();
      // if (this.state.allSelected) {
      this.unselectAll(event);
      // }
    };
    this.columnCounter = 1;
    this.toolTipRenderer = this.toolTipRenderer.bind(this);
    this.onDateFilterChange = this.onDateFilterChange.bind(this);
    this.handlePdfView = this.handlePdfView.bind(this);
    this.additionalCheckBox = this.additionalCheckBox.bind(this);
    this.updateFieldData = this.updateFieldData.bind(this);
    this.selectChange = this.selectChange.bind(this);
  }

  selectChange(event, selected) {
    console.log("on change")
    this.props.handleChange(`${this.props.pageid}`, this.props.metadata.griddef, selected.id);
  }


  onDateFilterChange(event) {
    const { fieldData } = this.state;
    fieldData[0].value = event.target.value;
    this.setState({
      fieldData: [...fieldData],
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

  componentDidMount() {
    if (!this.props.griddata) {
      this.setState({ noResultsFoundTxt: this.props.metadata.griddef.noResultsFoundTxt });
    }
  }

  componentWillReceiveProps(nextProps) {
    if((this.props.isSelectAll !== nextProps.isSelectAll)) {
      if(nextProps.isSelectAll === false) {
       this.unselectAll(undefined, true)
      }
      if(nextProps.isSelectAll === true) {
        this.selectAll(undefined, true);
      }
    }
    if(!this.state.allSelected) {
      var list = document.querySelectorAll('[role="gridcell"]');
      list.forEach(ele => {
        ele.classList.remove('jqx-fill-state-pressed')
      })
    }

    if(this.props.saveSelected !== nextProps.saveSelected) {
      this.saveSelectedData(undefined, true);
    }
  }

  exportToExcel() {
    this.refs.reusableGrid.exportdata("xls", this.state.pgid);
  }

  exportToCsv() {
    this.refs.reusableGrid.exportdata("csv", this.state.pgid);
  }

  copyToClipboardHandler(event) {
    event.preventDefault();
    var numOfRows = copyToClipboard(this.state.pgid);
    this.setState(
      {
        showClipboard: true,
        numOfRows: numOfRows,
      },
      () => {
        window.setTimeout(() => {
          this.setState({ showClipboard: false});
        }, 2000);
      }
    );
  }

  addColLinks(columns) {
    return columns.map((column) => {
      if (column.link) {
        column = {
          text: column.text,
          datafield: column.datafield,
          align: column.align,
          cellsalign: column.cellsalign,
          cellsformat: "c2",
          cellsrenderer: function (ndex, datafield, value, defaultvalue, column, rowdata) {
            return `<a href='#' id='${datafield}-${ndex}' class='click' onClick={editClick(${ndex})}><div style="padding-left:4px">${value}</div></a>`;
          },
        };
      }
      column.rendered = this.toolTipRenderer;
      return column;
    });
  }

  buildDataAdapter() {
    const { serverPaging, source } = this.props;
    let dataAdapter = null;
    if (serverPaging) {
      dataAdapter = this.processAdapter(source);
      return dataAdapter;
    } else {
      let { griddef } = this.state;
      let data = this.props.griddata;
      let { dataFields } = griddef;
      let source = {
        datatype: "json",
        datafields: dataFields,
        localdata: data,
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
        },
      });
      return dataAdapter;
    }
  }

  additionalCheckBox(event) {
    this.setState({ addtionalcheckbox: !this.state.addtionalcheckbox})
    this.props.clickCheckBox(event)
  }
  
  setFormMetadata(formMetaData) {
    console.log(formMetaData);
  }

  updateFieldData(fieldId, options) {
    const { fieldData } = this.state;
    const updatedFieldData = fieldData.map((field) => {
      if (field.id === fieldId && field.fieldinfo) {
        field.fieldinfo.options = options;
      }
      return field;
    });
    this.setState({
      fieldData: updatedFieldData,
    });
  }

  render() {
    let metadata = this.props.metadata;
    const { pgdef } = this.state;
    const { hasDeleteAll, extraLinks, topLink } = pgdef;
    let dataAdapter = this.buildDataAdapter();

    // Check to see if permissions allow for edit & delete.  If no, then remove column
    let permissions = this.props.permissions(this.props.pid);
    const { columns, showClipboard, isSaveSuccess } = this.state;

    const cellbegineditCallbck = (row, datafield, columntype, value) => {
      let _id = document.querySelector("div[role='grid']").id;
      const rowData = $("#" + _id).jqxGrid("getrenderedrowdata", row);
      if(rowData && rowData.flag === false && datafield === "auditPermission") {
        return false;
      }
      if(!this.state.allSelected) {
        setTimeout(() => {
          var list = document.querySelectorAll('[role="gridcell"]');
          list.forEach(ele => {
            ele.classList.remove('jqx-fill-state-pressed')
          })
        }, 0);
      }
      return true;
    }

    const modifiedColumns = columns.map((column) => {
      const col = Object.assign(column, { cellbeginedit: cellbegineditCallbck });
      return col;
     
    });

    let newColumns = this.addColLinks(modifiedColumns);
    if (this.state.recordEdit) {
      const editCellsRenderer = (rowIndex) => {
        return ` <div id='edit-${rowIndex}'style="text-align:center; margin-top: 10px; color: #4C7392" onClick={editClick(${rowIndex})}> <i class="fas fa-edit  fa-1x" color="primary"/> </div>`;
      };
      const editColumn = {
        text: "Edit",
        datafield: "edit",
        align: "center",
        width: 'auto',
        sortable: false,
        filterable: false,
        resizable: false,
        exportable: false,
        cellsrenderer: editCellsRenderer,
        menu: false,
        rendered: this.toolTipRenderer,
      };

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

      /*if (!permissions.SAVE) {
        newColumns = newColumns.filter((item) => {
          return item.text !== "Edit";
        });
      }*/

      if (!permissions.DELETE) {
        newColumns = newColumns.filter((item) => {
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
        datafield: pgid,
        text: columnHeader,
        align: "center",
        width: 'auto',
        sortable: false,
        filterable: false,
        resizable: false,
        exportable: false,
        cellsrenderer: childCellsRenderer,
        menu: false,
        rendered: this.toolTipRenderer,
      }));
      newColumns.push(...childColumns);
    }

    const { title, cruddef, isfilterform, pgid, subtitle, noResultsFoundTxt, isOpen, griddef } = this.state;
    const { handleDelete, renderMe, handleSubmit, handleFilters,showActionMessage } = this;
    let filter;
    if (isfilterform) filter = true;
    const close = this.toggle;
    const formProps = {
      pgid,
      filter,
      close,
      permissions,
      handleDelete,
      //handleSubmit,
      //handleFilters,
      renderMe,
      showActionMessage,
    };

    module.exports = this.handleChildGrid;
    // Below "Global Methods" method's are used by Grid Cell Renderer
    window.editClick = this.editClick;
    window.handleChildGrid = this.handleChildGrid;
    window.saveAndRefresh = this.saveAndRefresh;
    module.exports = this.saveAndRefresh;

    module.exports = this.setGridData;
    window.exports = this.setGridData;

   

    const {
      styles,
      tftools,
      saveGridData,
      formData,
      fieldData,
      getFormData,
      renderGrid,
      recentUsage,
      griddata,
      serverPaging,
      filterComp = null, // If no filter component then render nothing
    } = this.props;

    return (
      <Fragment>
        <Row className={this.props.className}>
          {!this.props.hideLabel ? <h1 style={styles.pagetitle}>{this.state.title}</h1> : null}
          {this.state.helpLabel && (
            <span style={styles.helpMargin}>
              <span id="help">
                <i className="fas fa-question-circle  fa-lg" onClick={this.OpenHelp} style={styles.helpicon} />
              </span>
              <UncontrolledTooltip placement="right" target="help">
                <span> {this.state.helpLabel} </span>
              </UncontrolledTooltip>
            </span>
          )}

          {this.state.hasFilter ? (
            <span id="filter">
              <i class="fas fa-filter fa-lg" style={styles.filtericon} onClick={this.handleFilterForm} />
              <UncontrolledTooltip placement="right" target="filter">
                Modify Selection Criteria
              </UncontrolledTooltip>
            </span>
          ) : null}

          {this.state.isfilter && (
            <span>
              {this.state.parentConfig ? (
                <span id="filter">
                  <i class="fas fa-arrow-alt-circle-up" style={{paddingTop: "4px", color: "#4c7392", marginLeft: "10px", fontSize: "21px" }} onClick={this.handleParentGrid} />
                  <UncontrolledTooltip placement="right" target="filter">
                    Return to prior screen
                  </UncontrolledTooltip>
                </span>
              ) : (
                <span id="filter">
                  <i class="fas fa-filter fa-lg" style={styles.filtericon} onClick={this.handleFilter} />
                  <UncontrolledTooltip placement="right" target="filter">
                    Modify Selection Criteria
                  </UncontrolledTooltip>
                </span>
              )}
            </span>
          )}
        </Row>

        {this.state.subtitle ? (
          <Row>
            <p>{this.state.subtitle}</p>
          </Row>
        ) : null}

        {metadata.pgdef.subHeader ? (
          <Row>
            <p>{metadata.pgdef.subHeader}</p>
          </Row>
        ) : null}

        {this.state.isDateFilter ? (
          <div style={{ marginTop: '57px' }}>
            <CustomDate
              {...this.state.fieldData[0]}
              onChange={this.onDateFilterChange}
              classNames="row"
              colClassNames="d-flex p-0 align-items-center"
              inputClassNames="w-25"
              labelClassNames="mb-0 mr-2"
              setFormMetadata={this.setFormMetadata}
            />
          </div>
        ) : null}

        {this.state.isfilter ? (
          <FilterValues
            style={styles}
            fieldData={
              this.state.parentConfig && this.state.parentConfig.griddef
                ? this.state.parentConfig.griddef.columns
                : this.props.fieldData
            }
            formFilterData={this.props.formFilterData}
          />
        ) : null}

{this.state.isSelectFilter ?   
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Select
              {...this.state.fieldData[0]}
              value={sessionStorage.getItem('newDataName')}
              onChange={this.selectChange}
              classNames="row"
              setFormMetadata={this.setFormMetadata}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              labelStyle={{
                width: '40%',
                marginLeft: '-28px',
                marginBottom: 0,
              }}
              formData={formData}
              formProps={formProps}
              fieldData={this.state.fieldData}
              tftools={tftools}
              metadata={metadata}
              getFormData={getFormData}
              formFilterData={this.props.formFilterData}
              updateFieldData={this.updateFieldData}
            />
            <span style={{
              fontSize: '10px',
              marginTop: '-15px',
              marginLeft: '-20px'
            }}>
              {(topLink || []).map(link => {
                return (
                  <Fragment>
                  <a
                    href="#"
                    id={link.id}
                    onClick={(event) => { event.preventDefault(); this.mapToolUsage(link.id) }}
                    style={styles.gridLinkStyle}
                  > <i class={`fas ${link.icon} fa-lg fa-2x`}></i></a>
                   <UncontrolledTooltip placement="right" target={link.id}>
                      <span> {link.description} </span>
                    </UncontrolledTooltip>
                  </Fragment>
                )
              })}
            </span>
          </div>
         : null}

        {filterComp}

        <Row style={styles.rowTop}>
          <Col sm="2" style={styles.iconPaddingLeft}>
            {this.state.allSelected && (
              <span>
                <span id={`selectAll-${this.props.hideModal ? '1': '0'}`} style={{ marginRight: "10px" }}>
                  <a href="" onClick={(e) => this.unselectAll(e)}>
                    <i className="fas fa-check-square  fa-2x" />
                  </a>
                </span>
                <UncontrolledTooltip placement="right" target={`selectAll-${this.props.hideModal ? '1': '0'}`}>
                  <span> {metadata.griddef.selectAllLabel || "Select All"} </span>
                </UncontrolledTooltip>
              </span>
            )}

            {!this.state.allSelected && (
              <span>
                <span id={`unselectAll-${this.props.hideModal ? '1': '0'}`} style={{ marginRight: "10px" }}>
                  <a href="" onClick={this.selectAll}>
                    <i className="far fa-square  fa-2x" />
                  </a>
                </span>
                <UncontrolledTooltip placement="right" target={`unselectAll-${this.props.hideModal ? '1': '0'}`}>
                  <span> Select All </span>
                </UncontrolledTooltip>
              </span>
            )}

            <span id={`unselectAll-${this.props.hideModal ? '1': '0'}`}>
              <a href="" onClick={(e) => this.toggleSelectAll(e)}>
                <span>
                  <i className="fas fa-redo-alt fa-2x" />
                </span>
              </a>
            </span>
            <UncontrolledTooltip placement="right" target={`unselectAll-${this.props.hideModal ? '1': '0'}`}>
              <span> Unselect All </span>
            </UncontrolledTooltip>
          </Col>
          <Col sm="9">
            {showClipboard && <ClipboardToast numOfRows={this.state.numOfRows} />}
            {isSaveSuccess && (
              <Row>
                <Col
                  sm="12"
                  md={{ size: 6, offset: 3 }}
                  style={{
                    backgroundColor: "#c1d7d9",
                    borderRadius: 10,
                    textAlign: "center",
                    height: 30,
                    paddingTop: 3,
                    display: "none",
                  }}
                >
                  Saved successfully
                </Col>
              </Row>
            )}
          </Col>
          <Col sm="1" style={styles.iconPaddingRight}>
            {this.state.hasAddNew && (
              <span
                style={
                  (this.state.hasAddNew && this.state.actiondel) == true ? { paddingLeft: 10 } : { paddingLeft: 46 }
                }
              >
                <span id="addNew">
                  <a href="" onClick={this.handleNewForm}>
                    <i className="fas fa-calendar-plus  fa-2x" />
                  </a>
                </span>
                <UncontrolledTooltip placement="right" target="addNew">
                  <span> {this.state.addNewLabel}</span>
                </UncontrolledTooltip>
              </span>
            )}
            {this.state.actiondel ? (
              <span
                style={
                  (this.state.hasAddNew && this.state.actiondel) == true ? { paddingLeft: 5 } : { paddingLeft: 46 }
                }
              >
                <span id="delAll">
                  <a href="" onClick="">
                    <i className="fas fa-calendar-minus fa-2x" />
                  </a>
                </span>
                <UncontrolledTooltip placement="right" target="delAll">
                  <span> Delete All </span>
                </UncontrolledTooltip>
              </span>
            ) : null}
          </Col>
        </Row>

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
            rendergridrows={(obj) => {
              if (serverPaging) this.dispatchGridData(obj);
              return obj.data;
            }}
            selectionmode={griddef.selectionmode || "multiplerows"}
            style={styles.gridStyle}
            sortable={true}
            filterable={true}
            columnsresize={true}
            showfilterrow={true}
            columnsautoresize={true}
            columnsresize={true}
            editable={griddef.editable}
            editmode={griddef.editmode || ""}
            enableellipsis={true}
            enabletooltips={true}
          />
        </Row>

        <Row style={styles.gridRowStyle}>
          <a href="#" id="exportToExcel" onClick={this.exportToExcel.bind(this)}>
            <i class="fas fa-table fa-lg fa-2x"></i>
          </a>
          <UncontrolledTooltip placement="right" target="exportToExcel">
            <span> Export to Excel </span>
          </UncontrolledTooltip>
          <a href="#" id="exportToCsv" onClick={this.exportToCsv.bind(this)} style={styles.gridLinkStyle}>
            <i class="fas fa-pen-square fa-lg fa-2x"></i>
          </a>
          <UncontrolledTooltip placement="right" target="exportToCsv">
            <span> Export to CSV </span>
          </UncontrolledTooltip>

          <a href="#" id="copyToClipboard" onClick={this.copyToClipboardHandler} style={styles.gridLinkStyle}>
            <i class="far fa-copy fa-lg fa-2x"></i>
          </a>
          <UncontrolledTooltip placement="right" target="copyToClipboard">
            <span> Copy to clipboard </span>
          </UncontrolledTooltip>
          {hasDeleteAll ? (
            <Fragment>
              <a href="#" id="deleteAll" onClick={this.deleteAll} style={styles.gridLinkStyle}>
                <i class="fas fa-trash fa-lg fa-2x"></i>
              </a>
              <UncontrolledTooltip placement="right" target="deleteAll">
                <span>Delete All</span>
              </UncontrolledTooltip>
            </Fragment>
          ) : null}
           {this.state.hasViewPdf && (
              <a href="#"
                style={styles.gridLinkStyle}
              >
                <span id="viewPdf">
                  <span onClick={(event) => this.handlePdfView(event)}>
                    <i className="fa fa-file-pdf fa-lg fa-2x" />
                  </span>
                </span>
                <UncontrolledTooltip placement="right" target="viewPdf">
                  <span> View PDF</span>
                </UncontrolledTooltip>
              </a>
            )}
            {this.state.hasSave && (
              <a href="#" style={styles.gridLinkStyle}>
                <span id="saveGrid">
                  <span onClick={(event) => this.saveSelectedData(event, false)}>
                    <i className="fas fa-save fa-lg fa-2x" />
                  </span>
                </span>
                <UncontrolledTooltip placement="right" target="saveGrid">
                  <span> {(typeof this.state.hasSave  === "string") ? this.state.hasSave : "Save Me"}</span>
                </UncontrolledTooltip>
              </a>
            )}
          {extraLinks
            ? extraLinks.map(({ id, description, icon, successMessage, errorMessage }) => (
                <Fragment>
                  <a
                    href="#"
                    id={id}
                    onClick={() => this.mapToolUsage(id, successMessage, errorMessage)}
                    style={styles.gridLinkStyle}
                  >
                    <i class={`fas ${icon} fa-lg fa-2x`}></i>
                  </a>
                  <UncontrolledTooltip placement="right" target={id}>
                    <span>{description}</span>
                  </UncontrolledTooltip>
                </Fragment>
              ))
            : null}
        </Row>
        <Row style={styles.gridRowStyle}>
          {this.state.hasCheckbox 
            ? <div>
            <input disabled={this.state.allSelected} checked={this.state.addtionalcheckbox} type="checkbox" name="displaylocaltax" id="displayLocalTax" onChange={(event) => this.additionalCheckBox(event)} style={{width: "15px", height: "15px", marginRight: "10px"}} />
            <label for="displaylocaltax">{this.state.checkBoxLabel}</label>
          </div>
          : null}
          
        </Row>
        <ViewPDF view={this.state.viewPdfMode} handleHidePDF={this.handlePdfView} pdfData={this.state.pdfData} />

        <ReusableModal open={isOpen} close={this.toggle} title={title} cruddef={cruddef} styles={styles}>
          <DynamicForm
            formData={formData}
            renderMe={this.renderMe}
            formProps={formProps}
            fieldData={fieldData}
            tftools={tftools}
            renderGrid={renderGrid}
            metadata={metadata}
            recentUsage={recentUsage}
            getFormData={getFormData}
            saveGridData={saveGridData}
            handleChildGrid={() => handleChildGrid(this.state.index)}
            handleSaveAs={this.handleNewForm}
            handleCancel={this.handleFilterForm}
            handlePdfView={this.handlePdfView}
            formFilterData={this.props.formFilterData}
            hasChildData={formData && formData.mode == "New" ? false : this.state.hasChildData}
            saveAndRefresh={this.saveAndRefresh}
            deleteAndRefresh={this.deleteRow}
            fillParentInfo ={this.props.fillParentInfo}
            showActionMessage={this.props.showActionMessage}
            styles={this.props.styles}
            permissions ={this.props.permissions}
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
        {this.state.alertMsgInfo.showAlert ? (
          <ReusableAlert {...this.state.alertMsgInfo} handleClick={this.handleAlertMsgOk} />
        ) : null}
      </Fragment>
    );
  }
}
export default ReusableGrid;

export const FilterValues = ({ fieldData = [], formFilterData, style }) => {
  const values = Object.assign({}, formFilterData);

  fieldData.forEach(({ id, disable, hidden, datafield }) => {
    if (disable && disable.length && values[id]) {
      disable.forEach((disabled) => {
        delete values[disabled];
      });
    }
    if (hidden) {
      delete values[datafield];
    }
  });

  return (
    <Row className="mt-2 mb-3">
      {/* placeholder is for checkboxes having no label */}
      {fieldData.map(({ id, label, placeholder, text, datafield }) => {
        return values[id || datafield] ? (
          <span className="mb-1">
            <Badge color="light">{label || text || placeholder}</Badge>{" "}
            <Badge color="dark" className="mr-1">{`${values[id || datafield]}`}</Badge>
          </span>
        ) : null;
      })}
    </Row>
  );
};
