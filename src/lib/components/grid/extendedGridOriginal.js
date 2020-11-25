import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import JqxTooltip from "../../../deps/jqwidgets-react/react_jqxtooltip";
import {Form, Row} from "reactstrap";
import FormModal from "../../formModal";
import DynamicForm from "../../dynamicForm";
import Aggregates from "../../../../res/js/jqwidgets/jqxgrid.aggregates";
import Grid from "../../../deps/jqwidgets-react/react_jqxgrid";

class ExtendedGrid extends React.Component {
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
        let dataRecord = this.getSelectedRow(index);
        const decodedCell = decodeURIComponent(cell);
        const cellInfo = JSON.parse(decodedCell); 
        const data = {data: dataRecord, mode: "Edit",cell: cellInfo};
        await gridSelectionHandler(pageid,"Edit",data);
      };
  
      this.handleChildGrid = async (index) => {
        const {pageid,gridSelectionHandler} = this.props;
        let _id = document.querySelector("div[role='grid']").id;
        let data = $("#" + _id).jqxGrid("getrowdata", index);
        await gridSelectionHandler(pageid,"renderChild",data);
    }
  
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
  
      this.handleSubmit = (pgid, payload, mode, rowid) => {
        const { saveGridData,setIsOpen} = this.props;
        saveGridData.saveGridData(pgid, payload, mode);
        setIsOpen(false);
      };
  
      //Only Required For Paginated Grid
      this.saveGridData = async (data) => {
        debugger
        const {setGridData} = this.props;
        await setGridData(data);
      }
  
      //TODO
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
    const {
        styles,tftools,saveGridData,formData,fieldData,filterFormData,
        formFilterData,getFormData,mapToolUsage,renderGrid,recentUsage,
        metadata,serverPaging,setFormData,gridType} = this.props;
    const { pgdef,cruddef,griddef,formdef} = metadata;
    const {columns,isfilterform,recordEdit} = griddef;
    const {pgid} = pgdef;
    const {isOpen} = this.state;

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
    const { deleteRow, handleChange, renderMe, handleSubmit } = this;
    let filter;
    if (isfilterform) filter = true;
    const close = this.close;
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
    window.editClick = this.editClick;
    module.exports = this.cellClick;
    window.cellClick = this.cellClick

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
            <FormModal open={isOpen} close={this.close} metadata={metadata} formdef={formdef} cruddef={cruddef} styles={styles}>
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
export default ExtendedGrid;


