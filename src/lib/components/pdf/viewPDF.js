
import React, { Component } from "react";;
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const viewer_path ='/pdfjs/web/viewer.html?file=';
const viewer_url  = window.location.protocol+'//'+window.location.host+viewer_path;

class ViewPDF extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: this.props.view,
      title: this.props.title,
      filePath: '',
    };
    this.toggle = this.toggle.bind(this);
  }

  getPDF(props) {
    if(props.pdfData && props.pdfData.docData) {
        var pdfData = window.atob(props.pdfData.docData);
        //var raw = window.atob(eew2pdf);
        var rawLength = pdfData.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));
        for(var i = 0; i < rawLength; i++) {
            array[i] = pdfData.charCodeAt(i);
        }
        var pdfAsArray = array;
        var binaryData = [];
        binaryData.push(pdfAsArray);
        var dataPdf = window.URL.createObjectURL(new Blob(binaryData, {type: "application/pdf"}))
        this.setState({
          filePath: encodeURIComponent(dataPdf),
        })
    }
  }

  toggle(event) {
    this.props.handleHidePDF(event);
  }
  componentDidMount() {
    this.getPDF(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getPDF(nextProps);
  }
  render() {
    const {pdfId, view, className, title } = this.props;
    return (
        <Modal size="lg"  style={{ 'max-width': window.innerWidth-200}} isOpen={view} toggle={this.toggle} backdrop="static" className={className}>
          <ModalHeader toggle={this.toggle}>{title}</ModalHeader>
          <ModalBody>
            {this.state.filePath ? <iframe src={`${viewer_url}${this.state.filePath}`} width={window.innerWidth-300}  height={window.innerHeight}></iframe>: null}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>
    );
  }
}
export default ViewPDF;