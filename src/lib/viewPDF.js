
import React, { Component } from "react";;
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ViewPDF extends Component {
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
    const {pdfId, view, className, title} = this.props;
    return (
        <Modal size="lg"  style={{ 'max-width': window.innerWidth-200}} isOpen={view} toggle={this.toggle} backdrop="static" className={className}>
          <ModalHeader toggle={this.toggle}>{title}</ModalHeader>
          <ModalBody>
            <iframe id={pdfId} width="100%" height={window.innerHeight-200} allowfullscreen webkitallowfullscreen ></iframe>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>
    );
  }
}
export default ViewPDF;