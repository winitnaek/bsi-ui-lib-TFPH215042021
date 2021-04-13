import React, { Component } from "react";
import { Col, Collapse, Button, ListGroup, ListGroupItem, Row } from "reactstrap";
import Grid from "../../../deps/jqwidgets-react/react_jqxgrid";

class PopupGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isLoading: false,
      gridData: [],
    };
    this.toggle = this.toggle.bind(this);
  }

  convertGridInput(formData) {
    let gridData = [];
    if (formData.length) {
      gridData = formData.map((item) => {
        var output = {};
        output["name"] = item;
        return output;
      });
    }
    return gridData;
  }

  async componentDidMount() {
    debugger;
    const { pgid, values, getFormData } = this.props;
    this.setState({ isLoading: true });
    let formData = (await getFormData.getFormData(pgid, values)) || [];
    var gridData = this.convertGridInput(formData);
    this.setState({ gridData: gridData, isLoading: false });
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  handleLink(data) {
    renderTFApplication("pageContainer", data);
    this.props.close();
  }

  render() {
    const { isOpen, isLoading, gridData } = this.state;
    const { columns, dataFields } = this.props.metadata.pgdef.popupGrid || null;
    let source = {
      datafields: dataFields,
      datatype: "json",
      localdata: gridData,
    };
    let dataAdapter = new $.jqx.dataAdapter(source);
    return (
      <Col className="pl-0 pr-0">
        {isLoading ? (
          <div style={{ justifyContent: "center" }} className="d-flex">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        ) : (
          <Col className="pl-0 pr-0">
            <div id="popupgrid">
              <Grid
                width="100%"
                source={dataAdapter}
                pageable={gridData.length > 5 ? true : false}
                enabletooltips={true}
                autoheight={true}
                columns={columns}
                selectionmode="checkbox"
              />
            </div>
          </Col>
        )}
      </Col>
    );
  }
}
export default PopupGrid;
