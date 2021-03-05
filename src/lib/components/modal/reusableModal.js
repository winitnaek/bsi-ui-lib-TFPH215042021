import React, { Component } from "react";
import { Modal, ModalHeader } from "reactstrap";

class ReusableModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { styles, title, subtitle, cruddef, open, close } = this.props;
    return (
      <Modal isOpen={open} size="lg" style={styles.modal}>
        <ModalHeader toggle={(e) => close()}>
          <span> {title} </span>
        </ModalHeader>
        {subtitle && cruddef.subtitle && <p style={styles.subTitle}> {subtitle && cruddef.subtitle} </p>}
        {this.props.children}
      </Modal>
    );
  }
}
export default ReusableModal;
