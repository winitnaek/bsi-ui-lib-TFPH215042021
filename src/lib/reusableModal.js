import React, { Component } from "react";
import { Modal, ModalHeader} from "reactstrap";

class ReusableModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {styles} = this.props;
    return (
      <Modal
        isOpen={this.props.open}
        size="lg"
        style={styles.modal}
      >
        <ModalHeader toggle={e => this.props.close()}>
          <span> {this.props.title} </span>
        </ModalHeader>
        <p style={styles.subTitle}> { this.props.subtitle && this.props.cruddef.subtitle} </p>
        {this.props.children}
      </Modal>
    );
  }
}
export default ReusableModal;
