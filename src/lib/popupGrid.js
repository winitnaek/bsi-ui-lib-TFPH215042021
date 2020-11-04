import React, { Component } from "react";
import {Col, Collapse, Button, ListGroup, ListGroupItem,Row} from "reactstrap";
import Grid from "../../src/deps/jqwidgets-react/react_jqxgrid";

class PopupGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen:false,
            gridData: []
        }
        this.toggle = this.toggle.bind(this);
      }

    //   deleteHandler(){
    //     let _id = document.querySelectorAll("div[role='grid']")[1].id;
    //     var rows = $("#"+_id).jqxGrid('selectedrowindexes');
    //     var selectedRecords = new Array();
    //     for (var m = 0; m < rows.length; m++) {
    //         var row = $("#"+_id).jqxGrid('getrowdata', rows[m]);
    //         selectedRecords[selectedRecords.length] = row;
    //     }
    //     if(selectedRecords) {
    //         this.props.deleteRecords(selectedRecords)
    //         .then(formData => {
    //             let gridData = this.convertGridInput(formData)
    //             this.setState({gridData:gridData})
    //         });
    //     }
    //   }

      convertGridInput(formData){
        let gridData = [];
        if(formData.length) {
                gridData = formData.map(item => { 
                var output = {};
                output["name"] = item;
                return output;
            });
        }
        return gridData;
    }

    async componentDidMount() {
        debugger
        const {pgid,values, getFormData} = this.props;
        let formData = await getFormData.getFormData(pgid,values) || [];
        var gridData = this.convertGridInput(formData);
        this.setState({gridData: gridData})
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    handleLink(data) {
        renderTFApplication("pageContainer", data);
        this.props.close();
    }

    render() {
        const {isOpen, gridData} = this.state;
        const {columns,dataFields} = this.props.metadata.pgdef.popupGrid || null;
        let source = { 
            datafields: dataFields,
            datatype: "json",
            localdata: gridData,
        };
        let dataAdapter = new $.jqx.dataAdapter(source);
        return (
        <Col>
            {gridData.length > 0 &&
                <Col>
                    <div id="popupgrid">
                        <Grid width='100%' source={dataAdapter} pageable={gridData.length > 5 ? true:false}
                            enabletooltips={true} autoheight={true} columns={columns}
                            selectionmode="checkbox"
                        />
                    </div>
                </Col>
            }
        </Col>
        // <Col>
        //     {gridData.length > 0 &&
        //     <Col>
        //     <Row>
        //         <Col xs="4">
        //             <Button color="link" onClick={this.toggle} className="float-left">More 
        //                 {!isOpen && <i class="fas fa-caret-right" style = {{marginTop:8, paddingLeft:4}}/>}
        //                 {isOpen && <i class="fas fa-caret-down" style = {{marginTop:8, paddingLeft:4}} />}
        //             </Button>
        //         </Col>
        //         {isOpen && 
        //         <Col>
        //             <Button color="link" onClick={this.deleteHandler} className="float-right" style={{marginTop:8}}>Delete</Button>
        //         </Col>
        //         }
        //     </Row>
        //     <Collapse isOpen={isOpen}>
        //         <Grid width='100%' source={dataAdapter} pageable={gridData.length > 5 ? true:false}
        //             enabletooltips={true} autoheight={true} columns={columns}
        //             selectionmode="checkbox"
        //         />
        //     </Collapse>
        //     </Col>
        // }
        // </Col>
        )
    }
}
export default PopupGrid;
