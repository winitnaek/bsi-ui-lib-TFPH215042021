import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const ConfirmModal = ({ showConfirm, cheader, cbody, handleOk, handleCancel, okbtnlbl, cancelbtnlbl }) => {
  let btnType = okbtnlbl === "Opt-Out" ? "danger" : "success";
  return (
    <div>
      <Modal isOpen={showConfirm} backdrop="static">
        <ModalHeader>{cheader}</ModalHeader>
        <ModalBody>{cbody}</ModalBody>
        <ModalFooter>
          {okbtnlbl ? (
            <Button color={btnType} onClick={handleOk}>
              {okbtnlbl}
            </Button>
          ) : null}
          {cancelbtnlbl ? (
            <Button color="secondary" onClick={handleCancel}>
              {cancelbtnlbl}
            </Button>
          ) : null}
        </ModalFooter>
      </Modal>
    </div>
  );
};
export default ConfirmModal;
