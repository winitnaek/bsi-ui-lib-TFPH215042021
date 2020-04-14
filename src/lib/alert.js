import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class UIAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAlert: this.props.showAlert,
            aheader: this.props.aheader,
            abody: this.props.abody,
            abtnlbl: this.props.abtnlbl,
            closeAll: false
        };
        this.toggleUIAlert = this.toggleUIAlert.bind(this);
    }
    toggleUIAlert() {
        this.setState({
            showAlert: !this.state.showAlert
        });
        this.props.handleClick();
    }
    render() {
        return (
            <div>
                <Modal isOpen={this.props.showAlert} toggle={this.toggleUIAlert} backdrop="static">
                    <ModalHeader>{this.props.aheader}</ModalHeader>
                    <ModalBody>{this.props.abody}</ModalBody>
                    <ModalFooter>
                        <Button color="success" onClick={() => this.toggleUIAlert()}>{this.props.abtnlbl}</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
export default UIAlert;