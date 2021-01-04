import React from 'react';
import { Alert, Modal, ModalBody} from 'reactstrap';
class Progress extends React.Component {
    render() {
        return (
            <div>
                <Modal size="sm" isOpen={true} backdrop="static" style={{width:'150px'}}>
                    <ModalBody style={{padding:'0rem'}}>
                        <Alert color="info" isOpen={true} style={{marginBottom:'0rem'}}>
                            <span href="#" id="inProgressSpinner"> <i class="fas fa-spinner fa-spin"></i>&nbsp;Loading...</span>
                        </Alert>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
export default Progress;