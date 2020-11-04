import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import JqxTooltip from "../../src/deps/jqwidgets-react/react_jqxtooltip";
import { copyToClipboard } from "./utils/copyToClipboard";
import ClipboardToast from "./clipboardToast";
import { Col, Row, UncontrolledTooltip, Badge } from "reactstrap";
import ReusableModal from "./reusableModal";
import DynamicForm from "./dynamicForm";
import CustomDate from "./inputTypes/date";
import ConfirmModal from "./confirmModal";
import ReusableAlert from "./reusableAlert";
import Grid from "../../src/deps/jqwidgets-react/react_jqxgrid";
import ViewPDF from "./viewPDF";

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
      actiondel: metadata.pgdef.actiondel,
      helpLabel: metadata.pgdef.helpLblTxt,
      isfilterform: metadata.griddef.isfilterform,
      filterFormData: {},
      childConfig: metadata.pgdef.childConfig,
      parentConfig: metadata.pgdef.parentConfig,
      isfilter: metadata.griddef.isfilter,
      isDateFilter: metadata.griddef.isDateFilter,
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
      alertInfo: {
        showAlert: false,
        aheader: "",
        abody: "",
        abtnlbl: "Ok"
      },
      fieldData: this.props.fieldData
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

    this.handleFilterForm = e => {
      const { formFilterData } = this.props;
      const payload = {
        formData: formFilterData,
        mode: "Edit",
        index: null
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

    this.handleFilter = e => {
      e.preventDefault();
      // Either Render Parent Grid or Toggle isOpen to Open Modal
      const { parentConfig } = this.state;
      parentConfig ? this.handleChildGrid(parentConfig.pgdef.pgid) : this.handleFilterForm(e);
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
      const { pgid, filterFormData } = this.state;
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

    this.selectAll = event => {
      event.preventDefault();
      this.setState({ allSelected: true });
      let _id = document.querySelector("div[role='grid']").id;
      $("#" + _id).jqxGrid("selectallrows");
    };

    this.unselectAll = event => {
      event.preventDefault();
      this.setState({ allSelected: false });
      let _id = document.querySelector("div[role='grid']").id;
      $("#" + _id).jqxGrid("clearselection");
    };

    this.toggleSelectAll = event => {
      event.preventDefault();
      // if (this.state.allSelected) {
      this.unselectAll(event);
      // }
    };
    this.columnCounter = 1;
    this.toolTipRenderer = this.toolTipRenderer.bind(this);
    this.onDateFilterChange = this.onDateFilterChange.bind(this);
  }

  onDateFilterChange(event) {
    const { fieldData } = this.state;
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

  componentDidMount() {
    if (!this.props.griddata) {
      this.setState({ noResultsFoundTxt: metadata.griddef.noResultsFoundTxt });
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
    var numOfRows = copyToClipboard();
    this.setState(
      {
        showClipboard: true,
        numOfRows: numOfRows
      },
      () => {
        window.setTimeout(() => {
          this.setState({ showClipboard: false });
        }, 2000);
      }
    );
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
    console.log("--------props ", this.props);
    // let metadata = this.props.metadata(this.props.pageid);
    const {
      styles,
      tftools,
      saveGridData,
      formData,
      fieldData,
      formMetaData,
      recentUsage,
      autoComplete,
      renderGrid,
      metadata,
      getFormData,
      griddata,
      serverPaging,
      filterComp = null // If no filter component then render nothing
    } = this.props;
    const { pgdef } = this.state;
    const { hasDeleteAll, extraLinks } = pgdef;
    let dataAdapter = this.buildDataAdapter();

    // Check to see if permissions allow for edit & delete.  If no, then remove column
    let permissions = this.props.permissions(this.props.pid);
    const { columns, showClipboard, isSaveSuccess } = this.state;

    let newColumns = this.addColLinks(columns);

    if (this.state.recordEdit) {
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

    const { title, cruddef, isfilterform, pgid, subtitle, noResultsFoundTxt, isOpen, griddef } = this.state;
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
        <Row className={this.props.className}>
          <h1 style={styles.pagetitle}>{this.state.title}</h1>
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
                  <i class="fas fa-arrow-up" style={styles.filtericon} onClick={this.handleParentGrid} />
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
          <CustomDate
            {...this.state.fieldData[0]}
            onChange={this.onDateFilterChange}
            classNames="row"
            colClassNames="d-flex p-0 align-items-center"
            inputClassNames="w-25"
            labelClassNames="mb-0 mr-2"
          />
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

        {filterComp}

        <Row style={styles.rowTop}>
          <Col sm="2" style={styles.iconPaddingLeft}>
            {this.state.allSelected && (
              <span>
                <span id="selectAll" style={{ marginRight: "10px" }}>
                  <a href="" onClick={e => this.unselectAll(e)}>
                    <i className="fas fa-check-square  fa-2x" />
                  </a>
                </span>
                <UncontrolledTooltip placement="right" target="selectAll">
                  <span> Select All </span>
                </UncontrolledTooltip>
              </span>
            )}

            {!this.state.allSelected && (
              <span>
                <span id="unselectAll" style={{ marginRight: "10px" }}>
                  <a href="" onClick={this.selectAll}>
                    <i className="far fa-square  fa-2x" />
                  </a>
                </span>
                <UncontrolledTooltip placement="right" target="unselectAll">
                  <span> Select All </span>
                </UncontrolledTooltip>
              </span>
            )}

            <span id="unselectAll">
              <a href="" onClick={e => this.toggleSelectAll(e)}>
                <span>
                  <i className="fas fa-redo-alt fa-2x" />
                </span>
              </a>
            </span>
            <UncontrolledTooltip placement="right" target="unselectAll">
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
                    display: "none"
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
            rendergridrows={obj => {
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
        <ViewPDF view={this.state.viewPdfMode} handleHidePDF={this.handlePdfView} />

        <ReusableModal open={isOpen} close={this.toggle} title={title} cruddef={cruddef} styles={styles}>
          <DynamicForm
            formData={formData}
            renderMe={this.renderMe}
            formProps={formProps}
            fieldData={fieldData}
            tftools={tftools}
            metadata={metadata}
            renderGrid={renderGrid}
            formMetaData={formMetaData}
            filterFormData={this.state.filterFormData}
            recentUsage={recentUsage}
            autoComplete={autoComplete}
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
export default ReusableGrid;

export const FilterValues = ({ fieldData = [], formFilterData, style }) => {
  const values = Object.assign({}, formFilterData);

  fieldData.forEach(({ id, disable, hidden, datafield }) => {
    if (disable && disable.length && values[id]) {
      disable.forEach(disabled => {
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
