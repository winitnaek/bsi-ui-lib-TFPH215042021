import React, { Component } from "react";
import { Form, Modal, ModalHeader} from "reactstrap";

class FormModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {styles,metadata,title} = this.props;
    let modalTitle = title || "";
    if(metadata && metadata.pgdef) modalTitle = metadata.pgdef.pgtitle;
    else if (metadata && metadata.formdef) modalTitle = metadata.formdef.title;
    return (
      <Modal
        isOpen={this.props.open}
        size="lg"
        style={styles.modal}
      >
        <ModalHeader toggle={e => this.props.close()}>
          <span> {modalTitle} </span>
        </ModalHeader>
        {this.props.children}
      </Modal>
    );
  }
}
export default FormModal;
