import React, { Component } from "react";
import {Row, Col} from "reactstrap";

class ClipboardToast extends Component {
  render() {
       const {numOfRows} = this.props;
            return (
                <Row>
                    <Col sm="12" md={{ size: 6, offset: 3 }} style={{backgroundColor: '#c1d7d9', borderRadius:10, textAlign: 'center', height: 30, paddingTop:3}}>
                        Copied <strong>{numOfRows}</strong> rows to Clipboard.
                    </Col>
                </Row>
            ) 
    }
}


export default ClipboardToast;
