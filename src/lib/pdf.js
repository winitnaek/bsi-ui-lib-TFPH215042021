
import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { PDF_ANCHOR_ID } from '../../base/constants/AppConstants';
class ViewPDF extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: this.props.view,
      title: this.props.title
    };
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.props.handleHidePDF();
  }
  render() {
    return (
      <div>
        <Modal size="lg"  style={{ 'max-width': window.innerWidth-200}} isOpen={this.props.view} toggle={this.toggle} backdrop="static" className={this.props.className}>
          <ModalHeader toggle={this.toggle}>{this.state.title}</ModalHeader>
          <ModalBody>
            <iframe id={PDF_ANCHOR_ID} width="100%" height={window.innerHeight-200} allowfullscreen webkitallowfullscreen ></iframe>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
export default ViewPDF;