import React, { Fragment } from 'react';
import {Row, UncontrolledTooltip,Col} from "reactstrap";

export default class PageActions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allSelected:false,
        };
        this.handleFilterForm = this.handleFilterForm.bind(this);
        this.unselectAll = this.unselectAll.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.refreshGrid = this.refreshGrid.bind(this);
        this.clearFilters = this.clearFilters.bind(this);
        this.handleNewForm = this.handleNewForm.bind(this);

    }

    handleFilterForm(e) {
        const {formFilterData,setFormData,setIsOpen} = this.props;
        debugger
        const payload = {
          formData: formFilterData,
          mode: "Edit",
          index: null
        };
        setFormData(payload);
        setIsOpen(true);
      };

      clearFilters() {
          debugger
      }

      refreshGrid(event) {
        event.preventDefault();
        this.unselectAll(event);
      };

      unselectAll(event) {
          debugger
        event.preventDefault();
        this.setState({ allSelected: false });
        let _id = document.querySelector("div[role='grid']").id;
        $("#" + _id).jqxGrid("clearselection");
      };

      selectAll(event){
        event.preventDefault();
        this.setState({ allSelected: true });
        let _id = document.querySelector("div[role='grid']").id;
        $("#" + _id).jqxGrid("selectallrows");
      };

      handleNewForm(e){
        e.preventDefault();
        debugger
        const {setFormData,setIsOpen,metadata} = this.props;
        const {pgid} = metadata.pgdef; 
        setFormData(pgid,"New",{});
        setIsOpen(true);
      };
      

    render() {
        const {metadata,styles,handleParentGrid} = this.props;
        const {hasFilter,isfilter,selectionmode} = metadata.griddef;
        const {hasAddNew,actiondel,addNewLabel,parentConfig} = metadata.pgdef;
        const {allSelected} = this.state;
        debugger
        return (
            <Row style={styles.rowTop,{justifyContent:"space-between",marginRight:0,marginTop:16}}>      
                <Col style={styles.iconPaddingLeft}>
                    {allSelected && selectionmode != "checkbox" &&  (
                    <span>
                        <span id="selectAll" style={{ marginRight: "16px" }}>
                        <a href="" onClick={e => this.unselectAll(e)}>
                            <i className="fas fa-check-square  fa-2x" />
                        </a>
                        </span>
                        <UncontrolledTooltip placement="right" target="selectAll">
                        <span> Select All </span>
                        </UncontrolledTooltip>
                    </span>
                    )}

                    {!allSelected && selectionmode != "checkbox" &&  (
                    <span>
                        <span id="unselectAll" style={{ marginRight: "16px" }}>
                        <a href="" onClick={this.selectAll}>
                            <i className="far fa-square  fa-2x" />
                        </a>
                        </span>
                        <UncontrolledTooltip placement="right" target="unselectAll">
                        <span> Select All </span>
                        </UncontrolledTooltip>
                    </span>
                    )}
                    <span>
                        <span id="refreshGrid" style={{ marginRight: "16px" }}>
                        <a href="" onClick={e => this.refreshGrid(e)}>
                            <span>
                            <i className="fas fa-redo-alt fa-2x" />
                            </span>
                        </a>
                        </span>
                        <UncontrolledTooltip placement="right" target="refreshGrid">
                        <span> Refresh Records </span>
                        </UncontrolledTooltip>
                    </span>
                    <span>
                        <span id="clearFilters" style={{ marginRight: "16px" }}>
                        <a href="" onClick={e => this.clearFilters(e)}>
                            <span>
                            <i className="fas fa-eraser fa-2x" />
                            </span>
                        </a>
                        </span>
                        <UncontrolledTooltip placement="right" target="clearFilters">
                        <span> Clear Filters </span>
                        </UncontrolledTooltip>
                    </span>
                </Col>
                <Col style={styles.iconPaddingRight}>
                    <Row style={{justifyContent:"flex-end"}}>
                        {hasAddNew && (
                        <span>
                            <span id="addNew">
                            <a href="" onClick={this.handleNewForm}>
                                <i className="fas fa-calendar-plus  fa-2x" />
                            </a>
                            </span>
                            <UncontrolledTooltip placement="right" target="addNew">
                            <span> {addNewLabel}</span>
                            </UncontrolledTooltip>
                        </span>
                        )}
                        {actiondel ? (
                            <span
                                style={
                                (hasAddNew && actiondel) == true ? {marginLeft: 16 } : {marginLeft: 46 }
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
                        {hasFilter ? (
                            <span id="filter">
                            <i class="fas fa-filter fa-2x" style={styles.filterIcon} onClick={this.handleFilterForm} />
                            <UncontrolledTooltip placement="right" target="filter">
                                Modify Selection Criteria
                            </UncontrolledTooltip>
                            </span>
                        ) : null}
                        {isfilter && (
                            <span>
                                {parentConfig ? (
                                    <span id="filter">
                                    <i class="fas fa-arrow-up fa-2x" style={styles.filterIcon} onClick={handleParentGrid} />
                                    <UncontrolledTooltip placement="right" target="filter">
                                        Return to prior screen
                                    </UncontrolledTooltip>
                                    </span>
                                ) : (
                                    <span id="filter">
                                    <i class="fas fa-filter fa-2x" style={styles.filterIcon} onClick={this.handleFilterForm} />
                                    <UncontrolledTooltip placement="right" target="filter">
                                        Modify Selection Criteriaaa
                                    </UncontrolledTooltip>
                                    </span>
                                )}
                            </span>
                        )}
                    </Row>
                </Col>
            </Row>
        )
    }
}
