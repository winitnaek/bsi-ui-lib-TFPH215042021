import React, { Component } from "react";
import { TypeaheadInputSingle } from "react-bootstrap-typeahead";
import {Col, Collapse, Button, ListGroup, ListGroupItem,Row} from "reactstrap";
import Grid from "../../src/deps/jqwidgets-react/react_jqxgrid";

class PopupGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen:false,
            isLoading:false,
            gridData: []
        }
        this.toggle = this.toggle.bind(this);
      }

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
        this.setState({isLoading:true});
        let formData = await getFormData.getFormData(pgid,values) || [];
        var gridData = this.convertGridInput(formData);
        this.setState({gridData: gridData,isLoading:false})
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
        const {isOpen, isLoading, gridData} = this.state;
        const {columns,dataFields} = this.props.metadata.pgdef.popupGrid || null;
        let source = { 
            datafields: dataFields,
            datatype: "json",
            localdata: gridData,
        };
        let dataAdapter = new $.jqx.dataAdapter(source);
        return (
        <Col>
            {isLoading ? (
                <Row style={{justifyContent:"center"}}>
                    <i class="fas fa-spinner fa-spin"></i>
                </Row>
            ):(
                <Col>
                    <div id="popupgrid">
                        <Grid width='100%' source={dataAdapter} pageable={gridData.length > 5 ? true:false}
                            enabletooltips={true} autoheight={true} columns={columns}
                            selectionmode="checkbox"
                        />
                    </div>
                </Col>
            )}
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
