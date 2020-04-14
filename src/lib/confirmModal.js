import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ConfirmModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showConfirm: this.props.showConfirm,
            aheader: this.props.cheader,
            abody: this.props.cbody,
            okbtnlbl: this.props.okbtnlbl,
            cancelbtnlbl: this.props.cancelbtnlbl,
            closeAll: false
        };
        this.toggleUIConfirmOk = this.toggleUIConfirmOk.bind(this);
        this.toggleUIConfirmCancel = this.toggleUIConfirmCancel.bind(this);
    }

    toggleUIConfirmOk() {
        this.props.handleOk();
    }
    toggleUIConfirmCancel() {
        this.props.handleCancel();
    }
    render() {
        let btnType = (this.props.okbtnlbl === 'Opt-Out') ? 'danger':'success'
        return (
            <div>
                <Modal isOpen={this.props.showConfirm} backdrop="static">
                    <ModalHeader>{this.props.cheader}</ModalHeader>
                    <ModalBody>{this.props.cbody}</ModalBody>
                    <ModalFooter>
                        <Button color={btnType} onClick={() => this.toggleUIConfirmOk()}>{this.props.okbtnlbl}</Button>
                        <Button color="secondary" onClick={() => this.toggleUIConfirmCancel()}>{this.props.cancelbtnlbl}</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
export default ConfirmModal;