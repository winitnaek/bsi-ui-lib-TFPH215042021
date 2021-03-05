import React, { Fragment } from "react";
import { Button, ModalFooter, ModalBody } from "reactstrap";

export default function FormActionButtons(props) {
  if (!props.formActions) {
    return (
      <ModalFooter style={{ borderTop: "0", borderBottom: "1" }}>
        {!props.hideReset && (
          <Fragment>
            <Button color="primary" className="btn btn-primary" onClick={() => props.close(false)}>
              Cancel
            </Button>
            <Button onClick={props.handleReset} color="warning" className="btn btn-primary mr-auto" type="reset">
              Reset
            </Button>
          </Fragment>
        )}
        {props.showDelete && (
          <Button onClick={(e) => props.deleteHandler(props.values)} color="danger">
            Delete
          </Button>
        )}
        {props.showSave && (
          <Button type="submit" color="success">
            {props.filter || props.metadata.griddef.isfilterform ? props.submitButtonText || " View " : " Save "}
          </Button>
        )}
      </ModalFooter>
    );
  } else {
    return <ModalFooter>{formActions}</ModalFooter>;
  }
}
